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

    @Select("SELECT DISTINCT category FROM products WHERE status = 'ACTIVE' AND category IS NOT NULL AND category <> '' ORDER BY category")
    List<String> distinctCategories();

    @Select("SELECT * FROM products WHERE status = 'ACTIVE' AND " +
            "(name LIKE CONCAT('%', #{keyword}, '%') " +
            "OR category LIKE CONCAT('%', #{keyword}, '%') " +
            "OR description LIKE CONCAT('%', #{keyword}, '%') " +
            "OR capability LIKE CONCAT('%', #{keyword}, '%') " +
            "OR scenarios LIKE CONCAT('%', #{keyword}, '%') " +
            "OR version LIKE CONCAT('%', #{keyword}, '%') " +
            "OR provider_name LIKE CONCAT('%', #{keyword}, '%') " +
            "OR source_name LIKE CONCAT('%', #{keyword}, '%') " +
            "OR customers LIKE CONCAT('%', #{keyword}, '%') " +
            "OR cases LIKE CONCAT('%', #{keyword}, '%'))")
    List<Product> search(String keyword);

    @Select("SELECT * FROM products WHERE owner_user_id = #{ownerUserId} ORDER BY update_time DESC, create_time DESC")
    List<Product> findByOwnerUserId(Long ownerUserId);

    @Select("SELECT * FROM products WHERE status = 'DRAFT' AND source_type = 'PARTNER' ORDER BY create_time DESC")
    List<Product> findPendingPartner();

    @Insert("INSERT INTO products(name, category, description, capability, scenarios, price, version, " +
            "provider_name, source_type, source_name, source_url, external_demo_url, customers, cases, owner_user_id, " +
            "popularity, status, create_time, update_time) " +
            "VALUES(#{name}, #{category}, #{description}, #{capability}, #{scenarios}, #{price}, " +
            "#{version}, #{providerName}, #{sourceType}, #{sourceName}, #{sourceUrl}, #{externalDemoUrl}, #{customers}, #{cases}, #{ownerUserId}, " +
            "#{popularity}, #{status}, NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Product product);

    @Update("UPDATE products SET popularity = #{popularity} WHERE id = #{id}")
    int updatePopularity(@Param("id") Long id, @Param("popularity") Integer popularity);

    @Update("UPDATE products SET status = #{status}, update_time = NOW() WHERE id = #{id}")
    int updateStatus(@Param("id") Long id, @Param("status") String status);

    @Update("UPDATE products SET name=#{name}, category=#{category}, description=#{description}, capability=#{capability}, scenarios=#{scenarios}, " +
            "price=#{price}, version=#{version}, provider_name=#{providerName}, source_name=#{sourceName}, source_url=#{sourceUrl}, " +
            "external_demo_url=#{externalDemoUrl}, customers=#{customers}, cases=#{cases}, update_time=NOW() " +
            "WHERE id=#{id}")
    int updateEditable(Product product);
}
