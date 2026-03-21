package com.cognicare.service;

import com.cognicare.dto.ChildVrVideoDto;
import com.cognicare.model.Child;
import com.cognicare.model.VrVideoAssignment;
import com.cognicare.repository.ChildRepository;
import com.cognicare.repository.VrVideoAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChildVrVideoService {

    private final VrVideoAssignmentRepository vrVideoRepository;
    private final ChildRepository childRepository;

    public ChildVrVideoService(VrVideoAssignmentRepository vrVideoRepository,
                               ChildRepository childRepository) {
        this.vrVideoRepository = vrVideoRepository;
        this.childRepository = childRepository;
    }

    private Child getActiveChild(Integer childId) {
        return childRepository.findByChildIdAndUserIsActiveTrue(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
    }

    @Transactional(readOnly = true)
    public List<ChildVrVideoDto> getChildVideos(Integer childId) {
        getActiveChild(childId);
        return vrVideoRepository.findByChildChildIdAndIsActiveTrue(childId).stream()
                .map(v -> {
                    String embedUrl = v.getYoutubeUrl();
                    if (embedUrl != null && embedUrl.contains("watch?v=")) {
                        embedUrl = embedUrl.replace("watch?v=", "embed/");
                    } else if (embedUrl != null && embedUrl.contains("youtu.be/")) {
                        String videoId = embedUrl.substring(embedUrl.lastIndexOf("/") + 1);
                        embedUrl = "https://www.youtube.com/embed/" + videoId;
                    }
                    return new ChildVrVideoDto(
                            v.getAssignmentId(),
                            v.getVideoTitle(),
                            embedUrl,
                            v.getDescription(),
                            v.getDurationMinutes(),
                            "Dr. " + v.getDoctor().getFirstName() + " " + v.getDoctor().getLastName(),
                            v.getCreatedAt()
                    );
                })
                .toList();
    }

    @Transactional
    public void markAsWatched(Integer childId, Integer assignmentId) {
        getActiveChild(childId);
        VrVideoAssignment assignment = vrVideoRepository.findByAssignmentIdAndChildChildId(assignmentId, childId)
                .orElseThrow(() -> new RuntimeException("Video assignment not found"));
        assignment.setIsActive(false);
        vrVideoRepository.save(assignment);
    }
}
