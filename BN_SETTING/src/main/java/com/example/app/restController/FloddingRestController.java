package com.example.app.restController;


import com.example.app.domain.entity.Flooding;
import com.example.app.domain.repository.FloodingRespository;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.WebElement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;


/*
 *   재난 CCTV
 * */

@RestController
@Slf4j
public class FloddingRestController {


    @Autowired
    private FloodingRespository floodingRespository;


    List<WebElement> clusterOne = new ArrayList();


    @GetMapping(value = "/get/flooding" ,produces = MediaType.APPLICATION_JSON_VALUE)
    public  List<Flooding>  t1(){
        log.info("GET /get/flooding....");
        return floodingRespository.findAll();
    }

    @GetMapping(value="/search/flooding",produces = MediaType.APPLICATION_JSON_VALUE)
    public Location keywordSearch(@RequestParam("keyword") String keyword){
        //

        String PLACES_API_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
        String apiKey = "AIzaSyBGrmdPyyxRpgLsrH1IO-BRAqmmKP3czos";
        RestTemplate restTemplate = new RestTemplate();
        String location = "35.1796,129.0756"; // 부산시 중심 좌표 (부산시청 부근)
        int radius = 20000; // 반경 20,000m (20km)로 설정
        URI uri = UriComponentsBuilder.fromHttpUrl(PLACES_API_URL)
                .queryParam("location", location)  // 위도,경도 예: "37.7749,-122.4194"
                .queryParam("radius", radius)      // 반경 (미터 단위)
                .queryParam("keyword", keyword)    // 검색 키워드
                .queryParam("key", apiKey)         // Google Places API 키
                .build()
                .toUri();
        Root response =  restTemplate.getForObject(uri, Root.class);
        System.out.println(response);
        if(response.results!=null && response.results.size()!=0){
            Location location1 =  response.getResults().get(0).getGeometry().getLocation();
            return location1;
        }

        return null;

    }

    //    --------------------------------------------------------------
    @Data
    private static class Geometry{
        public Location location;
        public Viewport viewport;
    }
    @Data
    private static class Location{
        public double lat;
        public double lng;
    }
    @Data
    private static class Northeast{
        public double lat;
        public double lng;
    }
    @Data
    private static class Photo{
        public int height;
        public ArrayList<String> html_attributions;
        public String photo_reference;
        public int width;
    }
    @Data
    private static class PlusCode{
        public String compound_code;
        public String global_code;
    }
    @Data
    private static class Result{
        public String business_status;
        public Geometry geometry;
        public String icon;
        public String icon_background_color;
        public String icon_mask_base_uri;
        public String name;
        public String place_id;
        public PlusCode plus_code;
        public double rating;
        public String reference;
        public String scope;
        public ArrayList<String> types;
        public int user_ratings_total;
        public String vicinity;
        public ArrayList<Photo> photos;
    }
    @Data
    private static class Root{
        public ArrayList<Object> html_attributions;
        public ArrayList<Result> results;
        public String status;
    }
    @Data
    private static class Southwest{
        public double lat;
        public double lng;
    }
    @Data
    private static class Viewport{
        public Northeast northeast;
        public Southwest southwest;
    }



}
