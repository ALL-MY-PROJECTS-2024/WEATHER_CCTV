package com.example.app.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FloodingDto {
    private Long id;
    private String category;
    private String instlPos;
    private String hlsAddr;
    private String address;
}
