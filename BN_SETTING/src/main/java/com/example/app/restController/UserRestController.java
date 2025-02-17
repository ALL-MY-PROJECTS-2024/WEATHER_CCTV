package com.example.app.restController;


import com.example.app.config.auth.jwt.JwtProperties;
import com.example.app.config.auth.jwt.JwtTokenProvider;
import com.example.app.config.auth.jwt.TokenInfo;
import com.example.app.domain.dto.UserDto;
import com.example.app.domain.entity.Token;
import com.example.app.domain.repository.TokenRepository;
import com.example.app.domain.service.UserServiceImpl;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import javax.print.attribute.standard.Media;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@Slf4j
//@CrossOrigin(origins = {"http://localhost:3000","http://127.0.0.1:3000"})
public class UserRestController {

    @Autowired
    private UserServiceImpl userServiceImpl;

    @Autowired
    private  AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private TokenRepository tokenRepository;


    @PostMapping(value = "/join" , produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String,Object>> join(@RequestBody UserDto userDto){
        Map<String,Object> map = new LinkedHashMap<>();
        log.info("/POST /join..." + userDto);

        userServiceImpl.userJoin(userDto);

        return new ResponseEntity<>(null, HttpStatus.OK);
    }


    @PostMapping(value = "/login" , consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, String> login(@RequestBody UserDto userDto){
        log.info("POST /login..." + userDto);
        Map<String, String> response = new HashMap<>();

        //접속 중인 동일 계정이 있으면 있다고 리턴
        Token token = tokenRepository.findByUserId((userDto.getUsername()));
        if(token!=null){
            //유효성 체크(만료체크)
            if(jwtTokenProvider.validateToken(token.getAccessToken())){

                response.put("message", "기존 로그인이 존재합니다.");
                response.put("success", "true");
                return response;
            }
            else{
                //refresh 된 토큰 가능성
                System.out.println("REFRESH 만료!!!!!!!!!!!!!!!!!!");
                tokenRepository.delete(token);
                //return response;

            }
        }
        //Token == null
            try {
                // 사용자 인증 시도
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                userDto.getUsername(),
                                userDto.getPassword()
                        )
                );
                //--------------------------
                //JWT TOKEN 생성
                //--------------------------
                TokenInfo tokenInfo = jwtTokenProvider.generateToken(authentication);
                System.out.println("JWT TOKEN : " + tokenInfo);

                //--------------------------
                //DB에 저장
                //--------------------------
                Token tokenEntity = new Token();
                tokenEntity.setAccessToken(tokenInfo.getAccessToken());
                tokenEntity.setRefreshToken(tokenInfo.getRefreshToken());
                tokenEntity.setUserId(userDto.getUsername());
                tokenEntity.setIssuedAt(LocalDateTime.now());
                tokenRepository.save(tokenEntity);

                System.out.println(authentication);

                // 인증 성공 시 REACT 전달
                response.put("message", "Login successful");
                response.put("success", "true");
                response.put(JwtProperties.COOKIE_NAME,tokenInfo.getAccessToken());



                return response;


            } catch (AuthenticationException e) {
                // 인증 실패 시 로직
                response.put("success", "false");
                response.put("error", "Invalid username or password");

                return response;
            }

    }

    @GetMapping(value = "/main", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> main(Authentication authentication){
        log.info("GET /main.." + authentication);
        Map<String , Object> map = new LinkedHashMap<>();
        //token없을때
        if(authentication==null){
            map.put("message","로그인이 필요합니다.");
            return map;
        }
        //refresh token 만료시
        Token token =  tokenRepository.findByUserId(authentication.getName());
        if(!jwtTokenProvider.validateToken((token.getAccessToken()))){
            map.put("message","refresh토큰 만료.. 로그인이 필요합니다.");
            tokenRepository.delete(token);
            return map;
        }


        map.put("username",authentication.getName());
        map.put("isAuthenticated",authentication.isAuthenticated());
        map.put("roles",authentication.getAuthorities());
        map.put("token",token.getAccessToken());

        return map;
    }





}
