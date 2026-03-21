package com.cognicare.dto;

public class AdminChildCredentialsDto {
    private Integer childId;
    private String username;
    private String tempPassword;

    public AdminChildCredentialsDto(Integer childId, String username, String tempPassword) {
        this.childId = childId;
        this.username = username;
        this.tempPassword = tempPassword;
    }

    public Integer getChildId() { return childId; }
    public String getUsername() { return username; }
    public String getTempPassword() { return tempPassword; }
}
