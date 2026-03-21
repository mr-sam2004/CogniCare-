package com.cognicare.service;

import com.cognicare.dto.DoctorVrVideoDto;
import com.cognicare.dto.VrVideoRequest;
import com.cognicare.model.Doctor;
import com.cognicare.model.Child;
import com.cognicare.model.VrVideoAssignment;
import com.cognicare.repository.ChildRepository;
import com.cognicare.repository.DoctorRepository;
import com.cognicare.repository.VrVideoAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DoctorVrVideoService {

    private final VrVideoAssignmentRepository vrVideoRepository;
    private final DoctorRepository doctorRepository;
    private final ChildRepository childRepository;

    public DoctorVrVideoService(VrVideoAssignmentRepository vrVideoRepository,
                               DoctorRepository doctorRepository,
                               ChildRepository childRepository) {
        this.vrVideoRepository = vrVideoRepository;
        this.doctorRepository = doctorRepository;
        this.childRepository = childRepository;
    }

    private Doctor getActiveDoctor(Integer doctorId) {
        return doctorRepository.findByDoctorIdAndUserIsActiveTrue(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    private Child getActiveChild(Integer childId) {
        return childRepository.findByChildIdAndUserIsActiveTrue(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
    }

    @Transactional
    public void assignVideo(Integer doctorId, VrVideoRequest request) {
        Doctor doctor = getActiveDoctor(doctorId);
        Child child = getActiveChild(request.getChildId());

        if (child.getDoctor() == null || !child.getDoctor().getDoctorId().equals(doctor.getDoctorId())) {
            throw new RuntimeException("This child is not assigned to you");
        }

        VrVideoAssignment assignment = new VrVideoAssignment();
        assignment.setDoctor(doctor);
        assignment.setChild(child);
        assignment.setVideoTitle(request.getVideoTitle());
        assignment.setYoutubeUrl(request.getYoutubeUrl());
        assignment.setDescription(request.getDescription());
        assignment.setDurationMinutes(request.getDurationMinutes());
        assignment.setIsActive(true);
        vrVideoRepository.save(assignment);
    }

    @Transactional(readOnly = true)
    public List<DoctorVrVideoDto> getDoctorVideos(Integer doctorId) {
        getActiveDoctor(doctorId);
        return vrVideoRepository.findByDoctorDoctorId(doctorId).stream()
                .map(v -> new DoctorVrVideoDto(
                        v.getAssignmentId(),
                        v.getChild().getChildId(),
                        v.getChild().getFirstName() + " " + v.getChild().getLastName(),
                        v.getVideoTitle(),
                        v.getYoutubeUrl(),
                        v.getDescription(),
                        v.getDurationMinutes(),
                        !Boolean.TRUE.equals(v.getIsActive()),
                        v.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public void deleteVideo(Integer doctorId, Integer assignmentId) {
        Doctor doctor = getActiveDoctor(doctorId);
        VrVideoAssignment assignment = vrVideoRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Video assignment not found"));

        if (!assignment.getDoctor().getDoctorId().equals(doctor.getDoctorId())) {
            throw new RuntimeException("You can only delete your own video assignments");
        }

        assignment.setIsActive(false);
        vrVideoRepository.save(assignment);
    }
}
