package com.example.app.domain.dto;

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
public class CCTV1Dto {
    private Long id;
    private String category;
    private String instlPos;
    private String hlsAddr;
    private String address;
}
