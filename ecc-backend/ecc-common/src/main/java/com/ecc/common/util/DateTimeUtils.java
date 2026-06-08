package com.ecc.common.util;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class DateTimeUtils {
    private static final String DEFAULT_FORMAT = "yyyy-MM-dd HH:mm:ss";

    public static String format(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.format(DateTimeFormatter.ofPattern(DEFAULT_FORMAT));
    }

    public static LocalDateTime nowUtc() {
        return LocalDateTime.now(ZoneId.of("UTC"));
    }
}