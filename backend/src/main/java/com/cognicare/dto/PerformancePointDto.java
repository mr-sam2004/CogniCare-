package com.cognicare.dto;

import java.time.LocalDateTime;

public class PerformancePointDto {
    private String moduleName;
    private String difficultyLevel;
    private Integer score;
    private LocalDateTime completedAt;

    public PerformancePointDto(String moduleName, String difficultyLevel, Integer score, LocalDateTime completedAt) {
        this.moduleName = moduleName;
        this.difficultyLevel = difficultyLevel;
        this.score = score;
        this.completedAt = completedAt;
    }

    public String getModuleName() { return moduleName; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public Integer getScore() { return score; }
    public LocalDateTime getCompletedAt() { return completedAt; }
}
