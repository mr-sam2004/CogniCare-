package com.cognicare.dto;

public class ParentChildDto {
    private Integer childId;
    private String firstName;
    private String lastName;
    private String diagnosis;
    private Integer level;
    private Integer currentStreak;
    private Integer totalScore;
    private String profileImage;

    public ParentChildDto() {}

    public ParentChildDto(Integer childId, String firstName, String lastName, String diagnosis,
                          Integer level, Integer currentStreak, Integer totalScore, String profileImage) {
        this.childId = childId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.diagnosis = diagnosis;
        this.level = level;
        this.currentStreak = currentStreak;
        this.totalScore = totalScore;
        this.profileImage = profileImage;
    }

    public Integer getChildId() { return childId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getDiagnosis() { return diagnosis; }
    public Integer getLevel() { return level; }
    public Integer getCurrentStreak() { return currentStreak; }
    public Integer getTotalScore() { return totalScore; }
    public String getProfileImage() { return profileImage; }
}
