package com.cognicare.repository;

import com.cognicare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(User.Role role);
    List<User> findByIsActiveTrue();
    Optional<User> findByUserIdAndIsActiveTrue(Integer userId);
    long countByIsActiveTrue();
    long countByRole(User.Role role);
    long countByRoleAndIsActiveTrue(User.Role role);
}
