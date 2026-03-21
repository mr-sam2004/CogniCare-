package com.cognicare.dto;

import java.time.LocalDateTime;

public class ParentSessionDto {
    private Integer sessionId;
    private String sessionTitle;
    private LocalDateTime scheduledAt;
    private String sessionType;
    private String googleMeetLink;
    private String status;

    public ParentSessionDto() {}

    public ParentSessionDto(Integer sessionId, String sessionTitle, LocalDateTime scheduledAt,
                            String sessionType, String googleMeetLink, String status) {
        this.sessionId = sessionId;
        this.sessionTitle = sessionTitle;
        this.scheduledAt = scheduledAt;
        this.sessionType = sessionType;
        this.googleMeetLink = googleMeetLink;
        this.status = status;
    }

    public Integer getSessionId() { return sessionId; }
    public String getSessionTitle() { return sessionTitle; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public String getSessionType() { return sessionType; }
    public String getGoogleMeetLink() { return googleMeetLink; }
    public String getStatus() { return status; }
}
