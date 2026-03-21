package com.cognicare.dto;

import java.time.LocalDateTime;

public class AdminContactDto {
    private Integer messageId;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public AdminContactDto(Integer messageId, String name, String email, String phone,
                           String subject, String message, Boolean isRead, LocalDateTime createdAt) {
        this.messageId = messageId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.subject = subject;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public Integer getMessageId() { return messageId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getSubject() { return subject; }
    public String getMessage() { return message; }
    public Boolean getIsRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
