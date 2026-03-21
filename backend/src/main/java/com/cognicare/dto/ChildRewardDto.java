package com.cognicare.dto;

import java.time.LocalDateTime;

public class ChildRewardDto {
    private Integer rewardId;
    private String badgeName;
    private String badgeIcon;
    private String description;
    private LocalDateTime earnedAt;

    public ChildRewardDto(Integer rewardId, String badgeName, String badgeIcon, String description, LocalDateTime earnedAt) {
        this.rewardId = rewardId;
        this.badgeName = badgeName;
        this.badgeIcon = badgeIcon;
        this.description = description;
        this.earnedAt = earnedAt;
    }

    public Integer getRewardId() { return rewardId; }
    public String getBadgeName() { return badgeName; }
    public String getBadgeIcon() { return badgeIcon; }
    public String getDescription() { return description; }
    public LocalDateTime getEarnedAt() { return earnedAt; }
}
