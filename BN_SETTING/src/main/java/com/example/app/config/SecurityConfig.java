package com.example.app.config;

import com.example.app.config.auth.exceptionHandler.CustomAccessDeniedHandler;
import com.example.app.config.auth.exceptionHandler.CustomAuthenticationEntryPoint;
import com.example.app.config.auth.jwt.JwtAuthorizationFilter;
import com.example.app.config.auth.jwt.JwtProperties;
import com.example.app.config.auth.jwt.JwtTokenProvider;
import com.example.app.config.auth.loginHandler.OAuth2JwtLoginSuccessHandler;
import com.example.app.config.auth.logoutHandler.CustomLogoutHandler;
import com.example.app.config.auth.logoutHandler.CustomLogoutSuccessHandler;
import com.example.app.domain.repository.TokenRepository;
import com.example.app.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenRepository tokenRepository;

    //웹요청 처리
    @Bean
    public SecurityFilterChain config(HttpSecurity http) throws Exception {

        //CSRF 비활성화
        http.csrf((config)->{config.disable();});

        // ⭐️ CORS 설정
        http.cors(corsConfigurer ->corsConfigurer.configurationSource(corsConfigurationSource())); // ⭐️⭐️⭐️


        //요청 URL별 접근 제한
        http.authorizeHttpRequests((auth)->{
//            auth.requestMatchers("/","/join","/login").permitAll();
//            auth.requestMatchers("/main").permitAll();
            auth.requestMatchers("*").permitAll();
            auth.requestMatchers("/set/*").permitAll();
            auth.requestMatchers("/update/*").permitAll();
            auth.requestMatchers("/position/*").permitAll();
            auth.requestMatchers("/get/*").permitAll();
            auth.requestMatchers("/getPos/*").permitAll();
            auth.requestMatchers("/open/*").permitAll();
            auth.requestMatchers("/snapshot/*").permitAll();
            auth.requestMatchers("/bSearch/*").permitAll();

            auth.requestMatchers("/cctv1/maker/new").permitAll();
            auth.requestMatchers("/cctv1/maker/update").permitAll();
            auth.requestMatchers("/cctv1/maker/delete").permitAll();

            auth.requestMatchers("/cctv2/maker/new").permitAll();
            auth.requestMatchers("/cctv2/maker/update").permitAll();
            auth.requestMatchers("/cctv2/maker/delete").permitAll();

            auth.requestMatchers("/flooding/maker/new").permitAll();
            auth.requestMatchers("/flooding/maker/update").permitAll();
            auth.requestMatchers("/flooding/maker/delete").permitAll();


            auth.anyRequest().authenticated();
        });

        // ⭐️ ATHENTICATION MANAGER 설정 - login 을 직접 처리
        http.formLogin((login)->{ login.disable();
//            login.permitAll();
//            login.loginPage("/login");
//            login.successHandler(new CustomLoginSuccessHandler(jwtTokenProvider));
//            login.failureHandler(new CustomAuthenticationFailureHandler());
        });

        //로그아웃
        http.logout((logout)->{
            logout.permitAll();
            logout.logoutUrl("/logout");
            logout.addLogoutHandler(customLogoutHandler());
            logout.logoutSuccessHandler(customLogoutSuccessHandler());
            //JWT
            logout.deleteCookies("JSESSIONID", JwtProperties.COOKIE_NAME);
            logout.invalidateHttpSession(true);
        });

        //예외처리
        http.exceptionHandling((ex)->{
            ex.accessDeniedHandler(new CustomAccessDeniedHandler());
            ex.authenticationEntryPoint(new CustomAuthenticationEntryPoint());
        });

//        //REMEMBER_ME
//        http.rememberMe((rm)->{
//            rm.key("rememberMeKey");
//            rm.rememberMeParameter("remember-me");
//            rm.alwaysRemember(false);
//            rm.tokenValiditySeconds(30*30);
//            rm.tokenRepository(tokenRepository());
//        });

        //OAUTH2-CLIENT
        http.oauth2Login((oauth2)->{
            oauth2.loginPage("/login");
            oauth2.successHandler(new OAuth2JwtLoginSuccessHandler(jwtTokenProvider));

        });

        //SESSION INVALIDATE..
        http.sessionManagement(
                httpSecuritySessionManagementConfigurer ->
                        httpSecuritySessionManagementConfigurer.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
        );

        //JWT FILTER ADDED
        http.addFilterBefore(new JwtAuthorizationFilter(userRepository,jwtTokenProvider,tokenRepository),
                BasicAuthenticationFilter.class);

        return http.build();
    }

    @Autowired
    private DataSource dataSource;

//    @Bean
//    public PersistentTokenRepository tokenRepository(){
//        JdbcTokenRepositoryImpl repo = new JdbcTokenRepositoryImpl();
//        repo.setDataSource(dataSource);
//        return repo;
//    }


    // ⭐️ CORS 설정
    CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            CorsConfiguration config = new CorsConfiguration();
            config.setAllowedHeaders(Collections.singletonList("*"));
            config.setAllowedMethods(Collections.singletonList("*"));
            // 여러 Origin을 허용하기 위해 리스트로 설정
            config.setAllowedOriginPatterns(Arrays.asList(
                    "http://127.0.0.1:3000",
                    "http://localhost:3000",
                    "https://all-my-projects-2024.github.io/CCTV_WEATHER_PROJECT_FN/" // 추가할 Origin
                    // 필요한 만큼 Origin을 추가
            ));
            config.setAllowCredentials(true);
            return config;
        };
    }



    // ⭐️ ATHENTICATION MANAGER 설정 - login 을 직접 처리
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }


    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }


    @Bean
    public CustomLogoutHandler customLogoutHandler(){
        return new CustomLogoutHandler();
    }
    @Bean
    public CustomLogoutSuccessHandler customLogoutSuccessHandler(){
        return new CustomLogoutSuccessHandler();
    }


}
