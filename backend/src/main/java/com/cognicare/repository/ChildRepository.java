package com.cognicare.repository;

import com.cognicare.dto.AdminChildDto;
import com.cognicare.model.Child;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChildRepository extends JpaRepository<Child, Integer> {
    Optional<Child> findByUserUserId(Integer userId);
    Optional<Child> findByUserUserIdAndUserIsActiveTrue(Integer userId);
    Optional<Child> findByChildIdAndUserIsActiveTrue(Integer childId);
    List<Child> findByParentParentId(Integer parentId);
    List<Child> findByParentParentIdAndUserIsActiveTrue(Integer parentId);
    List<Child> findByDoctorDoctorId(Integer doctorId);
    List<Child> findByDoctorDoctorIdAndUserIsActiveTrue(Integer doctorId);

    @Query("select c from Child c where c.user.isActive = true order by c.totalScore desc nulls last, c.currentStreak desc nulls last, c.firstName asc nulls last")
    List<Child> findAllActiveOrderByScoreDesc();

    @Query("select c from Child c left join fetch c.parent where c.childId = :childId and c.user.isActive = true")
    Optional<Child> findByChildIdWithParent(@Param("childId") Integer childId);

    @Query("select new com.cognicare.dto.AdminChildDto(c.childId, c.firstName, c.lastName, c.user.email, c.parent.parentId, d.doctorId, c.diagnosis, c.level, c.currentStreak, c.totalScore) " +
           "from Child c left join c.doctor d where c.user.isActive = true")
    List<AdminChildDto> findAllChildDtos();
}
