package com.example.demo.mapper;

import com.example.demo.model.Trial;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface TrialMapper {
    @Select("SELECT * FROM trials WHERE id = #{id}")
    Trial findById(Long id);

    @Select("SELECT * FROM trials WHERE user_id = #{userId} ORDER BY create_time DESC")
    List<Trial> findByUserId(Long userId);

    @Select("SELECT * FROM trials WHERE product_id = #{productId} ORDER BY create_time DESC")
    List<Trial> findByProductId(Long productId);

    @Select("SELECT * FROM trials WHERE status = #{status} ORDER BY create_time DESC")
    List<Trial> findByStatus(String status);

    @Select("SELECT " +
            "t.id AS trial_id, " +
            "t.user_id, " +
            "u.username AS user_username, " +
            "u.name AS user_name, " +
            "u.industry AS user_industry, " +
            "t.product_id, " +
            "p.name AS product_name, " +
            "p.capability AS product_capability, " +
            "p.scenarios AS product_scenarios, " +
            "p.price AS product_price, " +
            "p.version AS product_version, " +
            "t.solution_id, " +
            "s.name AS solution_name, " +
            "t.status AS trial_status, " +
            "t.environment_url, " +
            "t.test_data, " +
            "t.start_time, " +
            "t.end_time, " +
            "t.create_time " +
            "FROM trials t " +
            "LEFT JOIN users u ON t.user_id = u.id " +
            "LEFT JOIN products p ON t.product_id = p.id " +
            "LEFT JOIN solutions s ON t.solution_id = s.id " +
            "ORDER BY t.create_time DESC")
    List<java.util.Map<String, Object>> findAllForAdmin();

    @Insert("INSERT INTO trials(user_id, product_id, solution_id, environment_url, test_data, " +
            "status, start_time, end_time, create_time, update_time) " +
            "VALUES(#{userId}, #{productId}, #{solutionId}, #{environmentUrl}, #{testData}, " +
            "#{status}, #{startTime}, #{endTime}, NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Trial trial);

    @Update("UPDATE trials SET status = #{status}, update_time = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    @Update("UPDATE trials SET environment_url = #{environmentUrl}, update_time = NOW() WHERE id = #{id}")
    int updateEnvironment(@Param("id") Long id, @Param("environmentUrl") String environmentUrl);
}
