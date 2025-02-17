package com.example.app.domain.repository;

import com.example.app.config.auth.jwt.TokenInfo;
import com.example.app.domain.entity.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TokenRepository extends JpaRepository<Token,Long> {

    Token findByAccessToken(String accessToken);

    Token findByUserId(String userId);
}
