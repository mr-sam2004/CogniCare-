package com.cognicare.dto;

import java.time.LocalDateTime;

public class ParentRewardDto {
    private Integer rewardId;
    private String badgeName;
    private String description;
    private String badgeIcon;
    private LocalDateTime earnedAt;

    public ParentRewardDto() {}

    public ParentRewardDto(Integer rewardId, String badgeName, String description, String badgeIcon, LocalDateTime earnedAt) {
        this.rewardId = rewardId;
        this.badgeName = badgeName;
        this.description = description;
        this.badgeIcon = badgeIcon;
        this.earnedAt = earnedAt;
    }

    public Integer getRewardId() { return rewardId; }
    public String getBadgeName() { return badgeName; }
    public String getDescription() { return description; }
    public String getBadgeIcon() { return badgeIcon; }
    public LocalDateTime getEarnedAt() { return earnedAt; }
}
