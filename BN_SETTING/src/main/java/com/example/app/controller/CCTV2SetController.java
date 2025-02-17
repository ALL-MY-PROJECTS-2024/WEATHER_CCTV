package com.example.app.controller;


import com.example.app.domain.dto.CCTV1Dto;
import com.example.app.domain.dto.CCTV2Dto;
import com.example.app.domain.entity.CCTV1;
import com.example.app.domain.entity.CCTV2;
import com.example.app.domain.repository.CCTV1Respository;
import com.example.app.domain.repository.CCTV2Respository;
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
public class CCTV2SetController {


    @Autowired
    private CCTV2Respository cctv2Respository;

    @GetMapping("/set/cctv2")
    public void set1(Model model){
        log.info("GET /set/cctv2");

        List<CCTV2> cctv2List   =cctv2Respository.findAll();
        cctv2List.forEach(el->System.out.println(el));

        model.addAttribute("cctv2List",cctv2List);
    }

    // CCTV 정보를 업데이트하는 API
    @GetMapping("/update/cctv2")
    @ResponseBody
    public String updateCCTV(@RequestParam("id")Long id, @RequestParam("lat")double lat , @RequestParam("lon")double lon ) {
        log.info("Updating CCTV2: " + id + " "+ lat + " " + lon);
        CCTV2 cctv = cctv2Respository.findById(id).orElseThrow();
        cctv.setLat(lat);
        cctv.setLon(lon);
        cctv2Respository.save(cctv);
        return "CCTV information updated successfully!";
    }


    @GetMapping("/cctv2/maker/new")
    @ResponseBody
    public ResponseEntity<CCTV2> newMaker(@RequestParam("lat")double lat , @RequestParam("lon")double lon ) {
        log.info("Updating CCTV2: " + lat + " " + lon);
        CCTV2 cctv = new CCTV2();
        cctv.setLat(lat);
        cctv.setLon(lon);
        cctv.setLastUpdateAt(LocalDateTime.now());
        cctv2Respository.save(cctv);
        return new ResponseEntity(cctv, HttpStatus.OK);
    }

    @GetMapping("/cctv2/maker/update")
    @ResponseBody
    public ResponseEntity<CCTV2> updateMaker(CCTV2Dto dto) {
        log.info("Updating CCTV2: " + dto);
        CCTV2 cctv = cctv2Respository.findById(dto.getId()).orElseThrow();
        log.info("FIND CCTV : " + cctv);
        cctv.setCategory(dto.getCategory());
        cctv.setInstlPos(dto.getInstlPos());
        cctv.setHlsAddr(dto.getHlsAddr());
        cctv.setLastUpdateAt(LocalDateTime.now());

        cctv2Respository.save(cctv);
        return new ResponseEntity(cctv, HttpStatus.OK);

    }

    @GetMapping("/cctv2/maker/delete")
    @ResponseBody
    public ResponseEntity<CCTV2> deleteMaker(CCTV2Dto dto) {
        log.info("delete CCTV2: " + dto);
        CCTV2 cctv = cctv2Respository.findById(dto.getId()).orElseThrow();
        cctv2Respository.delete(cctv);
        return new ResponseEntity(cctv, HttpStatus.OK);
    }






}
