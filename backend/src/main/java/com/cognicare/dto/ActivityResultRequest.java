package com.cognicare.dto;

import jakarta.validation.constraints.NotNull;

public class ActivityResultRequest {
    @NotNull(message = "Assignment ID is required")
    private Integer assignmentId;

    @NotNull(message = "Score is required")
    private Integer score;

    public Integer getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Integer assignmentId) { this.assignmentId = assignmentId; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}
