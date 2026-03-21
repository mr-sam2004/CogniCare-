package com.cognicare.dto;

import java.util.List;

public class ChildPerformanceDto {
    private Integer childId;
    private String childName;
    private Integer completedGames;
    private Integer totalGames;
    private Integer averageScore;
    private List<PerformancePointDto> points;

    public ChildPerformanceDto(Integer childId, String childName, Integer completedGames, Integer totalGames,
                               Integer averageScore, List<PerformancePointDto> points) {
        this.childId = childId;
        this.childName = childName;
        this.completedGames = completedGames;
        this.totalGames = totalGames;
        this.averageScore = averageScore;
        this.points = points;
    }

    public Integer getChildId() { return childId; }
    public String getChildName() { return childName; }
    public Integer getCompletedGames() { return completedGames; }
    public Integer getTotalGames() { return totalGames; }
    public Integer getAverageScore() { return averageScore; }
    public List<PerformancePointDto> getPoints() { return points; }
}
