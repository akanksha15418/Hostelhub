package com.hostelhub.dto;

import com.hostelhub.model.Product;
import java.time.LocalDateTime;

public class ProductResponse {
    private Long id;
    private String title;
    private String description;
    private Double price;
    private String category;
    private String condition;
    private String imageUrl;
    private String status;
    private LocalDateTime createdAt;
    private String hostel;
    private SellerInfo seller;

    public static class SellerInfo {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String hostel;

        public SellerInfo(Long id, String name, String email, String phone, String hostel) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.phone = phone;
            this.hostel = hostel;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getHostel() { return hostel; }
        public void setHostel(String hostel) { this.hostel = hostel; }
    }

    public ProductResponse(Product product) {
        this.id = product.getId();
        this.title = product.getTitle();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.category = product.getCategory();
        this.condition = product.getCondition();
        this.imageUrl = product.getImageUrl();
        this.status = product.getStatus();
        this.hostel = product.getHostel();
        this.createdAt = product.getCreatedAt();
        
        if (product.getSeller() != null) {
            this.seller = new SellerInfo(
                product.getSeller().getId(),
                product.getSeller().getName(),
                product.getSeller().getEmail(),
                product.getSeller().getPhone(),
                product.getSeller().getHostel()
            );
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getHostel() { return hostel; }
    public void setHostel(String hostel) { this.hostel = hostel; }

    public SellerInfo getSeller() { return seller; }
    public void setSeller(SellerInfo seller) { this.seller = seller; }
}
