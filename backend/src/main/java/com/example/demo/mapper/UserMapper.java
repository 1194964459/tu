package com.example.demo.mapper;

import com.example.demo.model.User;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface UserMapper {
    @Select("SELECT * FROM users WHERE id = #{id}")
    User findById(Long id);

    @Select("SELECT * FROM users WHERE role = #{role}")
    List<User> findByRole(String role);

    @Select("SELECT * FROM users")
    List<User> findAll();

    @Insert("INSERT INTO users(username, name, role, industry, email, create_time) " +
            "VALUES(#{username}, #{name}, #{role}, #{industry}, #{email}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);
}
