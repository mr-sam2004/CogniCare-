package com.cognicare.dto;

public class ParentProfileDto {
    private Integer parentId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String approvalStatus;

    public ParentProfileDto() {}

    public ParentProfileDto(Integer parentId, String firstName, String lastName, String email, String phone, String approvalStatus) {
        this.parentId = parentId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.approvalStatus = approvalStatus;
    }

    public Integer getParentId() { return parentId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getApprovalStatus() { return approvalStatus; }
}
