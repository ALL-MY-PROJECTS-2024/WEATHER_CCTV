package com.example.app.domain.repository;


import com.example.app.domain.entity.Flooding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FloodingRespository extends JpaRepository<Flooding,Long> {
    boolean existsByHlsAddr(String hlsAddr);
}
