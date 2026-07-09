package com.ecc.common.infrastructure;

import com.ecc.common.util.BadWordFilter;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Adapter Implementation – Bộ lọc từ cấm (Hexagonal: Infrastructure Adapter).
 *
 * Chiến lược:
 * 1. Load danh sách từ cấm từ file classpath "bad_words.txt" vào HashSet.
 * 2. Normalize text (bỏ dấu tiếng Việt, lowercase) trước khi so khớp.
 * 3. So khớp theo WORD BOUNDARY (ranh giới từ) để tránh false positive
 *    (ví dụ: "ngu" không match "người", "cho" không match "học").
 * 4. Cache trong memory, hỗ trợ hot-reload qua reload().
 * 5. Thread-safe nhờ ReentrantReadWriteLock.
 */
@Slf4j
@Component
public class    BadWordFilterAdapter implements BadWordFilter {

    private static final String BAD_WORDS_FILE = "bad_words.txt";
    private static final String MASK = "***";
    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final int MIN_BAD_WORD_LENGTH = 2;

    /** Cache danh sách từ cấm đã normalize. */
    private volatile Set<String> badWordsCache = new HashSet<>();

    /** Lock đọc/ghi để đảm bảo thread-safety khi reload. */
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    @PostConstruct
    public void init() {
        reload();
    }

    @Override
    public boolean containsBadWord(String text) {
        if (text == null || text.isBlank()) return false;

        String normalizedText = normalize(text);

        lock.readLock().lock();
        try {
            for (String badWord : badWordsCache) {
                // Dùng regex word boundary để match chính xác từ
                Pattern pattern = buildWordBoundaryPattern(badWord);
                if (pattern.matcher(normalizedText).find()) {
                    return true;
                }
            }
            return false;
        } finally {
            lock.readLock().unlock();
        }
    }

    @Override
    public String filter(String text) {
        if (text == null || text.isBlank()) return text;

        // Normalize toàn bộ text gốc để tìm vị trí từ cấm
        String normalizedText = normalize(text);

        // Xây dựng mapping: mỗi ký tự trong normalizedText tương ứng vị trí nào trong text gốc
        int[] normalizedToOriginalStart = buildPositionMap(text);

        StringBuilder result = new StringBuilder(text);
        // Offset để điều chỉnh vị trí khi thay thế (vì *** có thể ngắn/dài hơn từ gốc)
        int offset = 0;

        lock.readLock().lock();
        try {
            for (String badWord : badWordsCache) {
                Pattern pattern = buildWordBoundaryPattern(badWord);
                Matcher matcher = pattern.matcher(normalizedText);

                while (matcher.find()) {
                    int normStart = matcher.start();
                    int normEnd = matcher.end();

                    // Map vị trí normalized → vị trí trong text gốc
                    int origStart = normalizedToOriginalStart[normStart];
                    int origEnd = (normEnd < normalizedToOriginalStart.length)
                            ? normalizedToOriginalStart[normEnd]
                            : text.length();

                    // Thay thế trong result (có tính offset)
                    int adjustedStart = origStart + offset;
                    int adjustedEnd = origEnd + offset;

                    if (adjustedStart >= 0 && adjustedEnd <= result.length() && adjustedStart < adjustedEnd) {
                        result.replace(adjustedStart, adjustedEnd, MASK);
                        offset += MASK.length() - (origEnd - origStart);
                    }
                }
            }
        } finally {
            lock.readLock().unlock();
        }

        return result.toString();
    }

    @Override
    public void reload() {
        Set<String> newBadWords = new HashSet<>();

        try {
            ClassPathResource resource = new ClassPathResource(BAD_WORDS_FILE);
            if (!resource.exists()) {
                log.warn("Không tìm thấy file từ cấm: {}. BadWordFilter sẽ hoạt động với danh sách rỗng.", BAD_WORDS_FILE);
                return;
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

                String line;
                while ((line = reader.readLine()) != null) {
                    String trimmed = line.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("#")) {
                        String normalized = normalize(trimmed);
                        // Bỏ qua từ quá ngắn sau normalize (tránh "a$$" → "a" gây false positive)
                        if (normalized.length() >= MIN_BAD_WORD_LENGTH) {
                            newBadWords.add(normalized);
                        } else {
                            log.warn("Bỏ qua từ cấm '{}' vì sau normalize chỉ còn '{}' (< {} ký tự)",
                                    trimmed, normalized, MIN_BAD_WORD_LENGTH);
                        }
                    }
                }
            }

            lock.writeLock().lock();
            try {
                badWordsCache = newBadWords;
            } finally {
                lock.writeLock().unlock();
            }

            log.info("BadWordFilter đã load thành công {} từ cấm từ file {}", newBadWords.size(), BAD_WORDS_FILE);

        } catch (Exception e) {
            log.error("Lỗi khi load danh sách từ cấm từ file {}: {}", BAD_WORDS_FILE, e.getMessage());
        }
    }

    // ========================= PRIVATE HELPERS =========================

    /**
     * Normalize: bỏ dấu tiếng Việt + lowercase + loại bỏ ký tự đặc biệt bypass.
     * Ví dụ: "Đụ Má" → "du ma", "f.u.c.k" → "fuck"
     */
    private String normalize(String text) {
        String result = text.replace('đ', 'd').replace('Đ', 'D');
        result = Normalizer.normalize(result, Normalizer.Form.NFD);
        result = DIACRITICS_PATTERN.matcher(result).replaceAll("");
        result = result.toLowerCase();
        result = result.replaceAll("[^a-z0-9\\s]", "");
        result = result.replaceAll("\\s+", " ").trim();
        return result;
    }

    /**
     * Tạo regex pattern với word boundary (\b) để match từ cấm chính xác.
     * "ngu" sẽ match "mày ngu quá" nhưng KHÔNG match "người" hay "ngủ".
     */
    private Pattern buildWordBoundaryPattern(String normalizedBadWord) {
        return Pattern.compile("\\b" + Pattern.quote(normalizedBadWord) + "\\b");
    }

    /**
     * Xây dựng mảng mapping: normalizedIndex → originalIndex.
     * Mỗi phần tử i trong mảng cho biết ký tự thứ i trong chuỗi normalized
     * tương ứng với vị trí nào trong chuỗi gốc.
     */
    private int[] buildPositionMap(String originalText) {
        String tempResult = originalText.replace('đ', 'd').replace('Đ', 'D');
        tempResult = Normalizer.normalize(tempResult, Normalizer.Form.NFD);
        tempResult = DIACRITICS_PATTERN.matcher(tempResult).replaceAll("");
        tempResult = tempResult.toLowerCase();
        // Tại đây tempResult đã bỏ dấu nhưng CHƯA bỏ ký tự đặc biệt

        // Bước 1: Map từ tempResult (đã bỏ dấu) → original
        // Vì NFD decompose có thể thêm combining chars, ta cần map lại
        // Cách đơn giản: duyệt original từng ký tự, NFD decompose, đếm output chars
        int[] tempToOriginal = new int[tempResult.length() + 1];
        int tempIdx = 0;
        int origIdx = 0;

        String origNfd = Normalizer.normalize(
                originalText.replace('đ', 'd').replace('Đ', 'D'),
                Normalizer.Form.NFD
        );
        String afterDiacritics = DIACRITICS_PATTERN.matcher(origNfd).replaceAll("");
        // afterDiacritics có cùng ký tự với tempResult trước lowercase

        // Map: mỗi char trong afterDiacritics.toLowerCase() → vị trí trong originalText
        // Vì bỏ dấu có thể giảm số ký tự, ta cần track cẩn thận
        // Approach: duyệt originalText, cho mỗi char, normalize nó, đếm bao nhiêu chars ra
        int[] afterDiacriticsToOrig = new int[afterDiacritics.length() + 1];
        int adIdx = 0;
        for (int oi = 0; oi < originalText.length(); oi++) {
            char c = originalText.charAt(oi);
            String replaced = String.valueOf(c == 'đ' ? 'd' : c == 'Đ' ? 'D' : c);
            String nfd = Normalizer.normalize(replaced, Normalizer.Form.NFD);
            String noDiacritics = DIACRITICS_PATTERN.matcher(nfd).replaceAll("");

            for (int j = 0; j < noDiacritics.length() && adIdx < afterDiacritics.length(); j++) {
                afterDiacriticsToOrig[adIdx] = oi;
                adIdx++;
            }
        }
        if (adIdx <= afterDiacritics.length()) {
            afterDiacriticsToOrig[adIdx] = originalText.length();
        }

        // Bước 2: Từ afterDiacritics (lowercase) → bỏ ký tự đặc biệt → normalized
        // Map mỗi vị trí trong normalized → vị trí trong afterDiacritics → vị trí trong original
        String lowered = afterDiacritics.toLowerCase();
        // Gộp khoảng trắng và bỏ ký tự đặc biệt
        // Thay vì dùng replaceAll, duyệt thủ công để track vị trí

        // Đếm kích thước normalized
        StringBuilder normalizedBuilder = new StringBuilder();
        // Track: normalizedPos → origPos
        java.util.List<Integer> posMap = new java.util.ArrayList<>();

        boolean lastWasSpace = false;
        boolean started = false;
        for (int i = 0; i < lowered.length(); i++) {
            char c = lowered.charAt(i);
            if (Character.isLetterOrDigit(c)) {
                normalizedBuilder.append(c);
                posMap.add(afterDiacriticsToOrig[i]);
                lastWasSpace = false;
                started = true;
            } else if (Character.isWhitespace(c) && started && !lastWasSpace) {
                normalizedBuilder.append(' ');
                posMap.add(afterDiacriticsToOrig[i]);
                lastWasSpace = true;
            }
            // Ký tự đặc biệt → bỏ qua (không thêm vào map)
        }

        // Trim trailing space
        String normalized = normalizedBuilder.toString().trim();

        int[] result = new int[normalized.length() + 1];
        for (int i = 0; i < normalized.length() && i < posMap.size(); i++) {
            result[i] = posMap.get(i);
        }
        // Vị trí cuối cùng = end of original text
        result[normalized.length()] = originalText.length();

        return result;
    }
}
