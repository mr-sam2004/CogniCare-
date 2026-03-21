package com.cognicare.controller;

import com.cognicare.dto.ApiResponse;
import com.cognicare.dto.ContactMessageDto;
import com.cognicare.model.ContactMessage;
import com.cognicare.repository.ContactMessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMessageRepository contactRepository;

    public ContactController(ContactMessageRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<String>> submitContact(@RequestBody ContactMessageDto dto) {
        ContactMessage msg = new ContactMessage();
        msg.setName(dto.getName());
        msg.setEmail(dto.getEmail());
        msg.setPhone(dto.getPhone());
        msg.setSubject(dto.getSubject());
        msg.setMessage(dto.getMessage());
        contactRepository.save(msg);
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully", "OK"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.success(contactRepository.countByIsReadFalse()));
    }
}
