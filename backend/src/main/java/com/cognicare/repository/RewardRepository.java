package com.cognicare.repository;

import com.cognicare.model.Reward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RewardRepository extends JpaRepository<Reward, Integer> {
    List<Reward> findByChildChildId(Integer childId);
    List<Reward> findByChildChildIdOrderByEarnedAtDesc(Integer childId);
}
