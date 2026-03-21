package com.cognicare.repository;

import com.cognicare.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Integer> {
    List<Module> findByIsActiveTrue();
    List<Module> findByCategory(String category);
    List<Module> findByDifficulty(Module.Difficulty difficulty);
    List<Module> findByIsActiveTrueAndCategory(String category);
}
