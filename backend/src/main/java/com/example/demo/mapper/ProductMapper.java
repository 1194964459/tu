package com.example.demo.mapper;

import com.example.demo.model.Product;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface ProductMapper {
    @Select("SELECT * FROM products WHERE status = 'ACTIVE' ORDER BY popularity DESC")
    List<Product> findActive();

    @Select("SELECT * FROM products WHERE id = #{id}")
    Product findById(Long id);

    @Select("SELECT * FROM products WHERE category = #{category} AND status = 'ACTIVE'")
    List<Product> findByCategory(String category);

    @Select("SELECT * FROM products WHERE status = 'ACTIVE' ORDER BY popularity DESC LIMIT #{limit}")
    List<Product> findPopular(Integer limit);

    @Select("SELECT * FROM products WHERE status = 'ACTIVE' AND " +
            "(name LIKE CONCAT('%', #{keyword}, '%') OR description LIKE CONCAT('%', #{keyword}, '%'))")
    List<Product> search(String keyword);

    @Insert("INSERT INTO products(name, category, description, capability, scenarios, price, version, " +
            "provider_name, popularity, status, create_time, update_time) " +
            "VALUES(#{name}, #{category}, #{description}, #{capability}, #{scenarios}, #{price}, " +
            "#{version}, #{providerName}, #{popularity}, #{status}, NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Product product);

    @Update("UPDATE products SET popularity = #{popularity} WHERE id = #{id}")
    int updatePopularity(@Param("id") Long id, @Param("popularity") Integer popularity);
}
