package com.cognicare.dto;

import jakarta.validation.constraints.NotNull;

public class SessionRequest {
    @NotNull(message = "Child ID is required")
    private Integer childId;

    @NotNull(message = "Session title is required")
    private String sessionTitle;

    @NotNull(message = "Session type is required")
    private String sessionType;

    private String googleMeetLink;

    @NotNull(message = "Scheduled date is required")
    private String scheduledAt;

    private Integer durationMinutes;
    private String notes;

    public Integer getChildId() { return childId; }
    public void setChildId(Integer childId) { this.childId = childId; }
    public String getSessionTitle() { return sessionTitle; }
    public void setSessionTitle(String sessionTitle) { this.sessionTitle = sessionTitle; }
    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }
    public String getGoogleMeetLink() { return googleMeetLink; }
    public void setGoogleMeetLink(String googleMeetLink) { this.googleMeetLink = googleMeetLink; }
    public String getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(String scheduledAt) { this.scheduledAt = scheduledAt; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
