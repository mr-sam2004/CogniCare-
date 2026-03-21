package com.cognicare.repository;

import com.cognicare.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    List<Feedback> findBySessionSessionId(Integer sessionId);
    List<Feedback> findByParentParentId(Integer parentId);
    List<Feedback> findByDoctorDoctorId(Integer doctorId);
    List<Feedback> findByFeedbackType(Feedback.FeedbackType feedbackType);
    List<Feedback> findAllByOrderByCreatedAtDesc();
    List<Feedback> findByChildChildIdAndFeedbackTypeOrderByCreatedAtDesc(Integer childId, Feedback.FeedbackType feedbackType);
    List<Feedback> findByFeedbackTypeOrderByCreatedAtDesc(Feedback.FeedbackType feedbackType);

    void deleteByChildChildId(Integer childId);
    void deleteByParentParentId(Integer parentId);
    void deleteByDoctorDoctorId(Integer doctorId);
    void deleteBySessionSessionId(Integer sessionId);
}
