package com.cognicare.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ChildActivityDto {
    private int tasksCompletedToday;
    private int tasksRemaining;
    private int scoreEarnedToday;
    private int sessionsToday;
    private int totalScore;
    private int currentStreak;
    private int level;
    private List<ActivityItemDto> recentActivity;

    public ChildActivityDto() {}

    public ChildActivityDto(int tasksCompletedToday, int tasksRemaining, int scoreEarnedToday,
                           int sessionsToday, int totalScore, int currentStreak, int level,
                           List<ActivityItemDto> recentActivity) {
        this.tasksCompletedToday = tasksCompletedToday;
        this.tasksRemaining = tasksRemaining;
        this.scoreEarnedToday = scoreEarnedToday;
        this.sessionsToday = sessionsToday;
        this.totalScore = totalScore;
        this.currentStreak = currentStreak;
        this.level = level;
        this.recentActivity = recentActivity;
    }

    public int getTasksCompletedToday() { return tasksCompletedToday; }
    public int getTasksRemaining() { return tasksRemaining; }
    public int getScoreEarnedToday() { return scoreEarnedToday; }
    public int getSessionsToday() { return sessionsToday; }
    public int getTotalScore() { return totalScore; }
    public int getCurrentStreak() { return currentStreak; }
    public int getLevel() { return level; }
    public List<ActivityItemDto> getRecentActivity() { return recentActivity; }
}
