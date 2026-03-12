package com.example.demo.service;

import com.example.demo.mapper.ProductMapper;
import com.example.demo.mapper.SolutionMapper;
import com.example.demo.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ProductService {

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private SolutionMapper solutionMapper;

    public List<Product> getAllProducts() {
        return productMapper.findActive();
    }

    public Product getProductById(Long id) {
        return productMapper.findById(id);
    }

    public List<Product> getProductsByCategory(String category) {
        return productMapper.findByCategory(category);
    }

    public List<Product> getPopularProducts(Integer limit) {
        return productMapper.findPopular(limit != null ? limit : 10);
    }

    public List<Product> searchProducts(String keyword) {
        return productMapper.search(keyword);
    }

    public Map<String, Object> getProductDetail(Long id) {
        Product product = productMapper.findById(id);
        if (product == null) return Collections.emptyMap();
        
        Map<String, Object> detail = new HashMap<>();
        detail.put("product", product);
        
        List<Product> related = productMapper.findByCategory(product.getCategory());
        related.removeIf(p -> p.getId().equals(id));
        detail.put("relatedProducts", related);
        
        return detail;
    }

    public List<Product> recommendProducts(ChatRequest request) {
        String keyword = request.getMessage();
        List<Product> products = productMapper.search(keyword);
        if (products.isEmpty()) {
            products = productMapper.findPopular(5);
        }
        return products;
    }
}
