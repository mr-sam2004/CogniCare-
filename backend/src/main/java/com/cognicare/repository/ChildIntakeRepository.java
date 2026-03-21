package com.cognicare.repository;

import com.cognicare.model.ChildIntake;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChildIntakeRepository extends JpaRepository<ChildIntake, Integer> {
    List<ChildIntake> findByParentParentId(Integer parentId);
}
