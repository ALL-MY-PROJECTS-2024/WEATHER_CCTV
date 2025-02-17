package com.example.app.config.auth.loginHandler;

import com.example.app.config.auth.jwt.JwtProperties;
import com.example.app.config.auth.jwt.JwtTokenProvider;
import com.example.app.config.auth.jwt.TokenInfo;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.util.Collection;

@Slf4j
public class CustomLoginSuccessHandler implements AuthenticationSuccessHandler {

    JwtTokenProvider jwtTokenProvider;

    public CustomLoginSuccessHandler(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        log.info("CustomLoginSuccessHandler's onAuthenticationSuccess authentication :" + authentication);
        Collection<? extends GrantedAuthority> collection =  authentication.getAuthorities();

        collection.forEach(role->{

            log.info("ROLE : " + role.getAuthority());

            //--------------------------
            //JWT TOKEN 생성 / 쿠키 전달
            //--------------------------
            TokenInfo tokenInfo = jwtTokenProvider.generateToken(authentication);
            System.out.println("JWT TOKEN : " + tokenInfo);
            Cookie cookie = new Cookie(JwtProperties.COOKIE_NAME,tokenInfo.getAccessToken());
            cookie.setMaxAge(JwtProperties.EXPIRATION_TIME);
            cookie.setPath("/");
            response.addCookie(cookie);


            String role_str = role.getAuthority();
            try {
                if(role_str.equals("ROLE_ADMIN")){
                    response.sendRedirect(request.getContextPath()+"/admin");
                    return ;
                }else if(role_str.equals("ROLE_MEMBER")) {
                    response.sendRedirect(request.getContextPath()+"/member");
                    return ;
                }else {
                    response.sendRedirect(request.getContextPath()+"/user");
                    return ;
                }
            }catch(Exception e) {
                e.printStackTrace();
            }

        });
    }
}
