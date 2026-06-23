package com.ecc.session.application.port.out;

import java.util.List;

public interface EmailPort {
    void sendSessionSummary(List<String> toEmails, String sessionTitle, String summaryContent);
}