package com.cognicare.dto;

import java.time.LocalDateTime;

public class FeedbackDto {
    private Integer feedbackId;
    private Integer rating;
    private String comment;
    private String feedbackType;
    private String fromName;
    private String fromRole;
    private LocalDateTime createdAt;

    public FeedbackDto() {}

    public FeedbackDto(Integer feedbackId, Integer rating, String comment, String feedbackType,
                       String fromName, String fromRole, LocalDateTime createdAt) {
        this.feedbackId = feedbackId;
        this.rating = rating;
        this.comment = comment;
        this.feedbackType = feedbackType;
        this.fromName = fromName;
        this.fromRole = fromRole;
        this.createdAt = createdAt;
    }

    public Integer getFeedbackId() { return feedbackId; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public String getFeedbackType() { return feedbackType; }
    public String getFromName() { return fromName; }
    public String getFromRole() { return fromRole; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
