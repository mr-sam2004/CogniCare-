package com.cognicare.dto;

import java.time.LocalDateTime;

public class DoctorSessionDto {
    private Integer sessionId;
    private Integer childId;
    private String childName;
    private String sessionTitle;
    private String sessionType;
    private String googleMeetLink;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String status;
    private boolean canDelete;

    public DoctorSessionDto(Integer sessionId, Integer childId, String childName, String sessionTitle,
                            String sessionType, String googleMeetLink, LocalDateTime scheduledAt,
                            Integer durationMinutes, String status, boolean canDelete) {
        this.sessionId = sessionId;
        this.childId = childId;
        this.childName = childName;
        this.sessionTitle = sessionTitle;
        this.sessionType = sessionType;
        this.googleMeetLink = googleMeetLink;
        this.scheduledAt = scheduledAt;
        this.durationMinutes = durationMinutes;
        this.status = status;
        this.canDelete = canDelete;
    }

    public Integer getSessionId() { return sessionId; }
    public Integer getChildId() { return childId; }
    public String getChildName() { return childName; }
    public String getSessionTitle() { return sessionTitle; }
    public String getSessionType() { return sessionType; }
    public String getGoogleMeetLink() { return googleMeetLink; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public String getStatus() { return status; }
    public boolean isCanDelete() { return canDelete; }
}
