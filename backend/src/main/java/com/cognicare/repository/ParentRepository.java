package com.cognicare.repository;

import com.cognicare.dto.AdminParentDto;
import com.cognicare.dto.ParentPendingDto;
import com.cognicare.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParentRepository extends JpaRepository<Parent, Integer> {
    Optional<Parent> findByUserUserId(Integer userId);
    Optional<Parent> findByUserUserIdAndUserIsActiveTrue(Integer userId);
    Optional<Parent> findByParentIdAndUserIsActiveTrue(Integer parentId);
    boolean existsByUserUserId(Integer userId);
    List<Parent> findByApprovalStatus(Parent.ApprovalStatus approvalStatus);
    long countByApprovalStatus(Parent.ApprovalStatus approvalStatus);
    long countByApprovalStatusAndUserIsActiveTrue(Parent.ApprovalStatus approvalStatus);

    @Query("select new com.cognicare.dto.ParentPendingDto(p.parentId, p.firstName, p.lastName, p.user.email, p.phone, p.address, p.approvalStatus) " +
           "from Parent p where p.approvalStatus = :status and p.user.isActive = true")
    List<ParentPendingDto> findPendingParentDtos(@Param("status") Parent.ApprovalStatus status);

    @Query("select new com.cognicare.dto.AdminParentDto(p.parentId, p.firstName, p.lastName, p.user.email, p.phone, p.address, p.approvalStatus) " +
           "from Parent p where p.user.isActive = true")
    List<AdminParentDto> findAllParentDtos();

    @Query("select p from Parent p join p.user u where p.parentId = (select c.parent.parentId from Child c where c.childId = :childId) and u.isActive = true")
    Optional<Parent> findParentByChildId(@Param("childId") Integer childId);
}
