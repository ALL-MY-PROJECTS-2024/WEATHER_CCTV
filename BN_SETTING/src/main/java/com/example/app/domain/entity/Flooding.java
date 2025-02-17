package com.example.app.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
public class Flooding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String category;
    private String instlPos;
    @Column(length = 4096)
    private String hlsAddr;
    private String address;
    private double lat;
    private double lon;
    private LocalDateTime lastUpdateAt;
}
