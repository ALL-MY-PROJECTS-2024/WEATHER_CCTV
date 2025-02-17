package com.example.app.domain.repository;


import com.example.app.domain.entity.CCTV2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CCTV2Respository extends JpaRepository<CCTV2,Long> {
    boolean existsByHlsAddr(String hlsAddr);
}
