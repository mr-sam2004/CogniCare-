package com.cognicare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AssignmentRequest {
    @NotNull(message = "Child ID is required")
    private Integer childId;

    @NotNull(message = "Module ID is required")
    private Integer moduleId;

    @NotBlank(message = "Difficulty level is required")
    private String difficultyLevel;

    private String dueDate;
    private String notes;

    public Integer getChildId() { return childId; }
    public void setChildId(Integer childId) { this.childId = childId; }
    public Integer getModuleId() { return moduleId; }
    public void setModuleId(Integer moduleId) { this.moduleId = moduleId; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
