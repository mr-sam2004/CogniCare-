package com.cognicare.dto;

import java.time.LocalDateTime;

public class DoctorVrVideoDto {
    private Integer assignmentId;
    private Integer childId;
    private String childName;
    private String videoTitle;
    private String youtubeUrl;
    private String description;
    private Integer durationMinutes;
    private Boolean isWatched;
    private LocalDateTime createdAt;

    public DoctorVrVideoDto(Integer assignmentId, Integer childId, String childName, String videoTitle,
                           String youtubeUrl, String description, Integer durationMinutes,
                           Boolean isWatched, LocalDateTime createdAt) {
        this.assignmentId = assignmentId;
        this.childId = childId;
        this.childName = childName;
        this.videoTitle = videoTitle;
        this.youtubeUrl = youtubeUrl;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.isWatched = isWatched;
        this.createdAt = createdAt;
    }

    public Integer getAssignmentId() { return assignmentId; }
    public Integer getChildId() { return childId; }
    public String getChildName() { return childName; }
    public String getVideoTitle() { return videoTitle; }
    public String getYoutubeUrl() { return youtubeUrl; }
    public String getDescription() { return description; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public Boolean getIsWatched() { return isWatched; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
