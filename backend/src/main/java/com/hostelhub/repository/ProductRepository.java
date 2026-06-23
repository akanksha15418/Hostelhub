package com.hostelhub.repository;

import com.hostelhub.model.Product;
import com.hostelhub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerOrderByCreatedAtDesc(User seller);

    @Query("SELECT p FROM Product p WHERE p.status = 'AVAILABLE' " +
           "AND (:category IS NULL OR LOWER(p.category) = :category) " +
           "AND (:search IS NULL OR LOWER(p.title) LIKE :search OR LOWER(p.description) LIKE :search) " +
           "ORDER BY p.createdAt DESC")
    List<Product> searchProducts(@Param("category") String category, @Param("search") String search);
}
