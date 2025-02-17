//package com.example.app.config.auth.jwt;
//
//
//import com.example.app.config.auth.PrincipalDetails;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.http.Cookie;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.AuthenticationException;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//
//
//import java.io.IOException;
//import java.util.ArrayList;
//
///**
// * JWT를 이용한 로그인 인증
// */
//public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
//
//
//    private final JwtTokenProvider jwtTokenProvider;
//    private final AuthenticationManager authenticationManager;      // 사용자의 인증을 확인하고, 사용자가 제공한 자격 증명(예: 사용자 이름과 비밀번호, JWT 토큰 등)이 올바른지 검증하는 인터페이스
//
//    public JwtAuthenticationFilter(AuthenticationManager authenticationManager,JwtTokenProvider jwtTokenProvider) {
//
//        super(authenticationManager);
//        this.authenticationManager = authenticationManager;
//        this.jwtTokenProvider = jwtTokenProvider;
//        System.out.println("[JWT 인증필터] JwtAuthenticationFilter 생성자 authenticationManager " + authenticationManager);
//    }
//
//    /**
//     * 로그인 인증 시도
//     */
//    @Override
//    public Authentication attemptAuthentication(
//            HttpServletRequest request,
//            HttpServletResponse response
//    ) throws AuthenticationException {
//
//
//        // 로그인할 때 입력한 username과 password를 가지고 authenticationToken를 생성한다.
//        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
//                request.getParameter("username"),
//                request.getParameter("password"),
//                new ArrayList<>()
//        );
//        System.out.println("[JWT 인증필터] JwtAuthenticationFilter.attemptAuthentication...authenticationToken : " + authenticationToken);
//
//
//        //Token 정보를 TokenInfo(Table) 에 저장한다.
//
//
//        return authenticationManager.authenticate(authenticationToken);
//
//
//    }
//
//    /**
//     * 인증에 성공했을 때 사용
//     * JWT Token을 생성해서 쿠키에 넣는다.
//     */
//    @Override
//    protected void successfulAuthentication(
//            HttpServletRequest request,
//            HttpServletResponse response,
//            FilterChain chain,
//            Authentication authResult
//    ) throws IOException, IOException {
//
//        PrincipalDetails principalDetails = (PrincipalDetails) authResult.getPrincipal();
////        String token = JwtUtils.createToken(principalDetails);
//
//        TokenInfo tokenInfo = jwtTokenProvider.generateToken(authResult);
//        // 쿠키 생성
//        Cookie cookie = new Cookie(JwtProperties.COOKIE_NAME, tokenInfo.getAccessToken());
//        cookie.setMaxAge(JwtProperties.EXPIRATION_TIME); // 쿠키의 만료시간 설정
//        cookie.setPath("/");
//        response.addCookie(cookie);
//
//        System.out.println("[JWT 인증필터] JwtAuthenticationFilter.successfulAuthentication...TokenInfo : " + tokenInfo);
//        response.sendRedirect("/");
//    }
//
//    @Override
//    protected void unsuccessfulAuthentication(
//            HttpServletRequest request,
//            HttpServletResponse response,
//            AuthenticationException failed
//    ) throws IOException {
//        System.out.println("JwtAuthenticationFilter.unsuccessfulAuthentication...");
//
//        response.sendRedirect("/login");
//    }
//}