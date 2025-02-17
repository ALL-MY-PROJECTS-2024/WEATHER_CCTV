//package com.example.app.controller;
//
//import com.example.app.domain.dto.UserDto;
//import com.example.app.domain.service.UserServiceImpl;
//import lombok.AllArgsConstructor;
//import lombok.NoArgsConstructor;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.stereotype.Controller;
//import org.springframework.ui.Model;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//
//@Controller
//@Slf4j
//
////@NoArgsConstructor
////@AllArgsConstructor
//@RequiredArgsConstructor
//public class UserController {
//
//    private final UserServiceImpl userServiceImpl;
//    private int a ;
//
//
//    @ExceptionHandler(Exception.class)
//    public void ExceptionHandler(Exception ex)
//    {
//        System.out.println("UserController's ExceptionHandler()..."+ex);
//    }
//
//    @GetMapping("/login")
//    public void login(){
//        log.info("GET /login...");
//    }
//
//    @GetMapping("/user")
//    public void user(Authentication authentication, Model model){
//        log.info("GET /user..."+ authentication);
//        model.addAttribute("authentication",authentication);
//    }
//    @GetMapping("/member")
//    public void member(@AuthenticationPrincipal UserDetails userDetails,Model model) {
//        log.info("GET /member...");
//        model.addAttribute("userDetails",userDetails);
//
//    }
//    @GetMapping("/admin")
//    public void admin(){
//        log.info("GET /admin...");
//        Authentication authentication =
//        SecurityContextHolder.getContext().getAuthentication();
//    }
//
//    @GetMapping("/join")
//    public void join_get(){
//        log.info("GET /join...");
//    }
//    @PostMapping("/join")
//    public void join_post(UserDto userDto){
//        log.info("POST /join..."+userDto);
//
//        userServiceImpl.userJoin(userDto);
//    }
//
//}
