package com.cognicare.controller;

import com.cognicare.model.Feedback;
import com.cognicare.model.Parent;
import com.cognicare.repository.FeedbackRepository;
import com.cognicare.repository.ParentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback-test")
public class FeedbackTestController {

    private final ParentRepository parentRepository;
    private final FeedbackRepository feedbackRepository;

    public FeedbackTestController(ParentRepository parentRepository, FeedbackRepository feedbackRepository) {
        this.parentRepository = parentRepository;
        this.feedbackRepository = feedbackRepository;
    }

    @PostMapping("/submit")
    @Transactional
    public ResponseEntity<String> submit(@RequestParam Integer parentId,
                                         @RequestParam Integer rating,
                                         @RequestParam String comment) {
        System.out.println(">>> FEEDBACK TEST REACHED: parentId=" + parentId + ", rating=" + rating);
        try {
            Parent parent = parentRepository.findById(parentId).orElse(null);
            if (parent == null) {
                System.out.println(">>> PARENT NOT FOUND for id: " + parentId);
                return ResponseEntity.badRequest().body("Parent not found");
            }
            Feedback feedback = new Feedback();
            feedback.setParent(parent);
            feedback.setRating(rating);
            feedback.setComment(comment);
            feedback.setFeedbackType(Feedback.FeedbackType.PARENT_FEEDBACK);
            feedbackRepository.save(feedback);
            System.out.println(">>> FEEDBACK SAVED SUCCESSFULLY");
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            System.out.println(">>> EXCEPTION: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
