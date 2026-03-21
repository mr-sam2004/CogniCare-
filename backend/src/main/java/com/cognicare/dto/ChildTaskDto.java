package com.cognicare.dto;

public class ChildTaskDto {
    private Integer assignmentId;
    private Integer moduleId;
    private String moduleName;
    private String moduleIcon;
    private Integer moduleDurationMinutes;
    private String difficultyLevel;
    private Boolean completed;
    private Integer score;

    public ChildTaskDto(Integer assignmentId, Integer moduleId, String moduleName, String moduleIcon,
                        Integer moduleDurationMinutes, String difficultyLevel, Boolean completed, Integer score) {
        this.assignmentId = assignmentId;
        this.moduleId = moduleId;
        this.moduleName = moduleName;
        this.moduleIcon = moduleIcon;
        this.moduleDurationMinutes = moduleDurationMinutes;
        this.difficultyLevel = difficultyLevel;
        this.completed = completed;
        this.score = score;
    }

    public Integer getAssignmentId() { return assignmentId; }
    public Integer getModuleId() { return moduleId; }
    public String getModuleName() { return moduleName; }
    public String getModuleIcon() { return moduleIcon; }
    public Integer getModuleDurationMinutes() { return moduleDurationMinutes; }
    public String getDifficultyLevel() { return difficultyLevel; }
    public Boolean getCompleted() { return completed; }
    public Integer getScore() { return score; }
}
