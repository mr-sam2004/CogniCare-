package com.cognicare.dto;

import java.time.LocalDateTime;

public class ChildSessionDto {
    private Integer sessionId;
    private String sessionTitle;
    private String sessionType;
    private String googleMeetLink;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String status;
    private String videoUrl;

    public ChildSessionDto(Integer sessionId, String sessionTitle, String sessionType, String googleMeetLink,
                           LocalDateTime scheduledAt, Integer durationMinutes, String status) {
        this.sessionId = sessionId;
        this.sessionTitle = sessionTitle;
        this.sessionType = sessionType;
        this.googleMeetLink = googleMeetLink;
        this.scheduledAt = scheduledAt;
        this.durationMinutes = durationMinutes;
        this.status = status;
        if ("VR".equals(sessionType) && googleMeetLink != null && !googleMeetLink.isBlank()) {
            String link = googleMeetLink.trim();
            if (link.contains("watch?v=")) {
                link = link.replace("watch?v=", "embed/");
            }
            this.videoUrl = link;
        }
    }

    public Integer getSessionId() { return sessionId; }
    public String getSessionTitle() { return sessionTitle; }
    public String getSessionType() { return sessionType; }
    public String getGoogleMeetLink() { return googleMeetLink; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public String getStatus() { return status; }
    public String getVideoUrl() { return videoUrl; }
}
