package com.cognicare.dto;

import java.time.LocalDateTime;

public class ChildVrVideoDto {
    private Integer assignmentId;
    private String videoTitle;
    private String youtubeUrl;
    private String description;
    private Integer durationMinutes;
    private String doctorName;
    private LocalDateTime createdAt;

    public ChildVrVideoDto(Integer assignmentId, String videoTitle, String youtubeUrl,
                           String description, Integer durationMinutes, String doctorName, LocalDateTime createdAt) {
        this.assignmentId = assignmentId;
        this.videoTitle = videoTitle;
        this.youtubeUrl = youtubeUrl;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.doctorName = doctorName;
        this.createdAt = createdAt;
    }

    public Integer getAssignmentId() { return assignmentId; }
    public String getVideoTitle() { return videoTitle; }
    public String getYoutubeUrl() { return youtubeUrl; }
    public String getDescription() { return description; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public String getDoctorName() { return doctorName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
