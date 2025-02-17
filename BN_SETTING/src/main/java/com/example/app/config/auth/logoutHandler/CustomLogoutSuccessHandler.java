package com.example.app.config.auth.logoutHandler;

import com.example.app.config.auth.PrincipalDetails;
import com.example.app.config.auth.jwt.JwtProperties;
import com.example.app.config.auth.jwt.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;


public class CustomLogoutSuccessHandler implements LogoutSuccessHandler {

    //@Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String KAKAO_CLIENT_ID="87166502a8aeaf54e9067d26a41e2b67";
    //@Value("${spring.security.oauth2.client.kakao.logout.redirect.uri}")
    private String KAKAO_LOGOUT_REDIRECT_URI="http://localhost:8080/login";

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        System.out.println("CustomLogoutSuccessHandler's onLogoutSuccess()");
        System.out.println("KAKAO_CLIENT_ID : " + KAKAO_CLIENT_ID);
        System.out.println("KAKAO_LOGOUT_REDIRECT_URI : " + KAKAO_LOGOUT_REDIRECT_URI);


        //----------------------------
        //JWT
        //----------------------------
        //Cookie -> JWT Token 가져오기
        String token=null;
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer "))
            token = authorizationHeader.substring(7);
        if(token!=null)
            authentication = jwtTokenProvider.getAuthentication(token);

        PrincipalDetails principalDetails = (PrincipalDetails)authentication.getPrincipal();
        String provider = principalDetails.getUserDto().getProvider();

        //Kakao Server Disconn...
        if(provider!=null &&"kakao".equals(provider)) {
            response.sendRedirect("https://kauth.kakao.com/oauth/logout?client_id=" + KAKAO_CLIENT_ID + "&logout_redirect_uri=" + KAKAO_LOGOUT_REDIRECT_URI);
            return ;
        }else if(provider!=null &&"naver".equals(provider)){
            response.sendRedirect("https://nid.naver.com/nidlogin.logout?returl=https://www.naver.com/");
            return ;
        }else if(provider!=null &&"google".equals(provider)){
            response.sendRedirect("https://accounts.google.com/Logout");
            return ;
        }

        //JSON TYPE  으로 전달
        Map<String,Object> responseData = new LinkedHashMap<>();
        responseData.put("message","로그아웃 성공");
        responseData.put("status",200);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(responseData));
        response.getWriter().flush();



    }
}
