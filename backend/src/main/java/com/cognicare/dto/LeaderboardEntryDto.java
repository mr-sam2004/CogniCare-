package com.cognicare.dto;

public class LeaderboardEntryDto {
    private Integer rank;
    private Integer childId;
    private String childName;
    private Integer level;
    private Integer totalScore;
    private Integer currentStreak;

    public LeaderboardEntryDto(Integer rank, Integer childId, String childName, Integer level, Integer totalScore, Integer currentStreak) {
        this.rank = rank;
        this.childId = childId;
        this.childName = childName;
        this.level = level;
        this.totalScore = totalScore;
        this.currentStreak = currentStreak;
    }

    public Integer getRank() { return rank; }
    public Integer getChildId() { return childId; }
    public String getChildName() { return childName; }
    public Integer getLevel() { return level; }
    public Integer getTotalScore() { return totalScore; }
    public Integer getCurrentStreak() { return currentStreak; }
}
