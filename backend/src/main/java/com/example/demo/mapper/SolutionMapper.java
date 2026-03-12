package com.example.demo.mapper;

import com.example.demo.model.Solution;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface SolutionMapper {
    @Select("SELECT * FROM solutions")
    List<Solution> findAll();

    @Select("SELECT * FROM solutions WHERE id = #{id}")
    Solution findById(Long id);

    @Select("SELECT * FROM solutions WHERE target_industry = #{industry}")
    List<Solution> findByIndustry(String industry);

    @Insert("INSERT INTO solutions(name, description, target_industry, scenarios, architecture, " +
            "product_ids, estimated_days, price_range, create_time) " +
            "VALUES(#{name}, #{description}, #{targetIndustry}, #{scenarios}, #{architecture}, " +
            "#{productIds}, #{estimatedDays}, #{priceRange}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Solution solution);
}
