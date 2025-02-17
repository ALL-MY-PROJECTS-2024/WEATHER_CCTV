package com.example.app.controller;


import com.example.app.domain.dto.CCTV1Dto;
import com.example.app.domain.dto.FloodingDto;
import com.example.app.domain.entity.CCTV1;
import com.example.app.domain.entity.Flooding;
import com.example.app.domain.repository.FloodingRespository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@Slf4j
public class FloodingForecastController {

    @Autowired
    private FloodingRespository floodingRespository;

    @GetMapping("/set/flooding")
    public void set1(Model model){
        log.info("GET /set/flooding");

        List<Flooding> floodingList   =floodingRespository.findAll();
        floodingList.forEach(el->System.out.println(el));

        model.addAttribute("floodingList",floodingList);
    }

    // CCTV 정보를 업데이트하는 API
    @GetMapping("/update/flooding")
    @ResponseBody
    public String updateCCTV(@RequestParam("id")Long id, @RequestParam("lat")double lat , @RequestParam("lon")double lon ) {
        log.info("Updating flooding: " + id + " "+ lat + " " + lon);
        Flooding flooding = floodingRespository.findById(id).orElseThrow();
        flooding.setLat(lat);
        flooding.setLon(lon);
        floodingRespository.save(flooding);
        return "CCTV information updated successfully!";
    }


    @GetMapping("/flooding/maker/new")
    @ResponseBody
    public ResponseEntity<CCTV1> newMaker(@RequestParam("lat")double lat , @RequestParam("lon")double lon ) {
        log.info("Updating flooding: " + lat + " " + lon);
        Flooding flooding = new Flooding();
        flooding.setLat(lat);
        flooding.setLon(lon);
        flooding.setLastUpdateAt(LocalDateTime.now());
        floodingRespository.save(flooding);
        return new ResponseEntity(flooding, HttpStatus.OK);
    }

    @GetMapping("/flooding/maker/update")
    @ResponseBody
    public ResponseEntity<CCTV1> updateMaker(FloodingDto dto) {
        log.info("Updating flooding: " + dto);
        Flooding flooding = floodingRespository.findById(dto.getId()).orElseThrow();
        log.info("FIND flooding : " + flooding);
        flooding.setCategory(dto.getCategory());
        flooding.setInstlPos(dto.getInstlPos());
        flooding.setHlsAddr(dto.getHlsAddr());
        flooding.setLastUpdateAt(LocalDateTime.now());

        floodingRespository.save(flooding);
        return new ResponseEntity(flooding, HttpStatus.OK);

    }

    @GetMapping("/flooding/maker/delete")
    @ResponseBody
    public ResponseEntity<CCTV1> deleteMaker(CCTV1Dto dto) {
        log.info("delete flooding: " + dto);
        Flooding flooding = floodingRespository.findById(dto.getId()).orElseThrow();
        floodingRespository.delete(flooding);
        return new ResponseEntity(flooding, HttpStatus.OK);
    }
}
