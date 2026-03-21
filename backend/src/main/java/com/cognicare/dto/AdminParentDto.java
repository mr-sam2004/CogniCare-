package com.cognicare.dto;

import com.cognicare.model.Parent;

public class AdminParentDto {
    private Integer parentId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private Parent.ApprovalStatus approvalStatus;

    public AdminParentDto(Integer parentId, String firstName, String lastName, String email,
                          String phone, String address, Parent.ApprovalStatus approvalStatus) {
        this.parentId = parentId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.approvalStatus = approvalStatus;
    }

    public Integer getParentId() { return parentId; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public Parent.ApprovalStatus getApprovalStatus() { return approvalStatus; }
}
