package com.cognicare.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DoctorAssignmentDto {
    private Integer assignmentId;
    private Integer childId;
    private String childName;
    private String moduleName;
    private String difficultyLevel;
    private Boolean isCompleted;
    private Integer score;
    private LocalDate dueDate;
    private LocalDateTime createdAt;

    public DoctorAssignmentDto(Integer assignmentId, Integer childId, String childName, String moduleName,
                               String difficultyLevel, Boolean isCompleted, Integer score,
                               LocalDate dueDate, LocalDateTime createdAt) {
        this.assignmentId = assignmentId;
        this.childId = childId;
        this.childName = childName;
        this.moduleName = moduleName;
        this.difficultyLevel = difficultyLevel;
        this.isCompleted = isCompleted;
        this.score = score;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
    }

    public Integer getAssignmentId() { return assignmentId; }
    public Integer getChildId() { return childId; }
    public String getChildName() { return childName; }
    public String getModuleName() { return moduleName; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public Boolean getIsCompleted() { return isCompleted; }
    public Integer getScore() { return score; }
    public LocalDate getDueDate() { return dueDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
