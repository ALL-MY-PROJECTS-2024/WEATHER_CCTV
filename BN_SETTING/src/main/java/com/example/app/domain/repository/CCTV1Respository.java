package com.example.app.domain.repository;


import com.example.app.domain.entity.CCTV1;
import com.example.app.domain.entity.CCTV2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CCTV1Respository extends JpaRepository<CCTV1,Long> {
    boolean existsByHlsAddr(String hlsAddr);
}
