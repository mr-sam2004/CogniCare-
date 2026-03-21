package com.cognicare.dto;

import java.time.LocalDateTime;

public class ActivityItemDto {
    private String type;
    private String title;
    private String description;
    private Integer score;
    private LocalDateTime timestamp;

    public ActivityItemDto() {}

    public ActivityItemDto(String type, String title, String description, Integer score, LocalDateTime timestamp) {
        this.type = type;
        this.title = title;
        this.description = description;
        this.score = score;
        this.timestamp = timestamp;
    }

    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Integer getScore() { return score; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
