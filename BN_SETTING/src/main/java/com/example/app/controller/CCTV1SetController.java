package com.example.app.controller;


import com.example.app.domain.dto.CCTV1Dto;
import com.example.app.domain.dto.CCTV2Dto;
import com.example.app.domain.entity.CCTV1;
import com.example.app.domain.entity.CCTV2;
import com.example.app.domain.repository.CCTV1Respository;
import io.github.bonigarcia.wdm.WebDriverManager;
import lombok.extern.slf4j.Slf4j;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Controller
@Slf4j
public class CCTV1SetController {


    @Autowired
    private CCTV1Respository cctv1Respository;

    @GetMapping("/set/cctv1")
    public void set1(Model model){
        log.info("GET /set/cctv1");

        List<CCTV1> cctv1List   =cctv1Respository.findAll();
        cctv1List.forEach(el->System.out.println(el));

        model.addAttribute("cctv1List",cctv1List);
    }

    // CCTV 정보를 업데이트하는 API
    @GetMapping("/update/cctv1")
    @ResponseBody
    public String updateCCTV(@RequestParam("id")Long id, @RequestParam("lat")double lat , @RequestParam("lon")double lon ) {
        log.info("Updating CCTV1: " + id + " "+ lat + " " + lon);
        CCTV1 cctv = cctv1Respository.findById(id).orElseThrow();
        cctv.setLat(lat);
        cctv.setLon(lon);
        cctv1Respository.save(cctv);
        return "CCTV information updated successfully!";
    }


    @GetMapping("/cctv1/maker/new")
    @ResponseBody
    public ResponseEntity<CCTV1> newMaker(@RequestParam("lat")double lat , @RequestParam("lon")double lon ) {
        log.info("Updating CCTV1: " + lat + " " + lon);
        CCTV1 cctv = new CCTV1();
        cctv.setLat(lat);
        cctv.setLon(lon);
        cctv.setLastUpdateAt(LocalDateTime.now());
        cctv1Respository.save(cctv);
        return new ResponseEntity(cctv, HttpStatus.OK);
    }

    @GetMapping("/cctv1/maker/update")
    @ResponseBody
    public ResponseEntity<CCTV1> updateMaker(CCTV1Dto dto) {
        log.info("Updating CCTV1: " + dto);
        CCTV1 cctv = cctv1Respository.findById(dto.getId()).orElseThrow();
        log.info("FIND CCTV : " + cctv);
        cctv.setCategory(dto.getCategory());
        cctv.setInstlPos(dto.getInstlPos());
        cctv.setHlsAddr(dto.getHlsAddr());
        cctv.setLastUpdateAt(LocalDateTime.now());

        cctv1Respository.save(cctv);
        return new ResponseEntity(cctv, HttpStatus.OK);

    }

    @GetMapping("/cctv1/maker/delete")
    @ResponseBody
    public ResponseEntity<CCTV1> deleteMaker(CCTV1Dto dto) {
        log.info("delete CCTV1: " + dto);
        CCTV1 cctv = cctv1Respository.findById(dto.getId()).orElseThrow();
        cctv1Respository.delete(cctv);
        return new ResponseEntity(cctv, HttpStatus.OK);
    }







}
