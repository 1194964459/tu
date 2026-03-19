package com.example.demo.controller;

import com.example.demo.mapper.*;
import com.example.demo.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private SolutionMapper solutionMapper;

    /**
     * 获取产品列表
     */
    @GetMapping
    public Map<String, Object> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {

        List<Product> products;

        if (keyword != null && !keyword.isEmpty()) {
            products = productMapper.search(keyword);
        } else if (category != null && !category.isEmpty()) {
            products = productMapper.findByCategory(category);
        } else {
            products = productMapper.findActive();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("data", products);
        result.put("total", products.size());

        return result;
    }

    /**
     * 获取热门产品
     */
    @GetMapping("/popular")
    public Map<String, Object> popular(@RequestParam(defaultValue = "10") Integer limit) {
        List<Product> products = productMapper.findPopular(limit);

        Map<String, Object> result = new HashMap<>();
        result.put("data", products);

        return result;
    }

    /**
     * 获取产品详情
     */
    @GetMapping("/{id}")
    public Map<String, Object> detail(@PathVariable Long id) {
        Product product = productMapper.findById(id);

        Map<String, Object> result = new HashMap<>();

        if (product != null) {
            result.put("data", product);

            // 相关产品
            List<Product> related = productMapper.findByCategory(product.getCategory());
            related.removeIf(p -> p.getId().equals(id));
            result.put("relatedProducts", related);
        } else {
            result.put("error", "产品不存在");
        }

        return result;
    }

    /**
     * 获取产品分类
     */
    @GetMapping("/categories")
    public Map<String, Object> categories() {
        List<String> categories = productMapper.distinctCategories();
        if (categories == null || categories.isEmpty()) {
            categories = Arrays.asList(
                    "仓储管理", "运输管理", "订单管理", "供应链",
                    "数据分析", "人工智能", "云计算", "安全合规", "公共服务");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("data", categories);

        return result;
    }
}
