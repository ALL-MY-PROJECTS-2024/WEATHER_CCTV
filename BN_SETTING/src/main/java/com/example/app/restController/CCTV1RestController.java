package com.example.app.restController;


import com.example.app.domain.entity.CCTV1;
import com.example.app.domain.entity.CCTV2;
import com.example.app.domain.repository.CCTV1Respository;
import com.example.app.domain.repository.CCTV2Respository;
import io.github.bonigarcia.wdm.WebDriverManager;
import jakarta.persistence.criteria.Root;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.awt.*;
import java.awt.datatransfer.DataFlavor;
import java.net.URI;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;


/*
*   재난 CCTV
* */

@RestController
@Slf4j
public class CCTV1RestController {


    @Autowired
    private CCTV1Respository cCTV1repository;


    List<WebElement> clusterOne = new ArrayList();


    //--------------------------
    //팝업 닫기
    //--------------------------
    public void closedPopup(WebDriver driver) throws InterruptedException {
        //팝업1 닫기 버튼 클릭
        WebElement PopupcheckOne = driver.findElement(By.cssSelector(".todayClose input[type='checkbox']"));
        if(PopupcheckOne.isDisplayed())
            PopupcheckOne.click();

        WebElement Popupbutton = driver.findElement(By.cssSelector(".popupClose"));
        if(Popupbutton.isDisplayed()){
            Popupbutton.click();
            Thread.sleep(500);
        }

        WebElement PopupcheckTwo = driver.findElement(By.cssSelector(".todayGuideClose input[type='checkbox']"));
        if(PopupcheckTwo!=null)
            PopupcheckTwo.click();

        //팝업2 닫기 버튼 클릭
        WebElement Popupbutton2 = driver.findElement(By.cssSelector(".center"));
        if(Popupbutton2.isDisplayed()){
            Popupbutton2.click();
            Thread.sleep(500);
        }
    }

    //--------------------------
    //재난감지 CCTV2 켜기
    //--------------------------
    public void turnOnCCTV1(WebDriver driver) throws InterruptedException {
        WebElement 재난감시CCTV버튼 = driver.findElement(By.cssSelector(".map_dep1_ul>li:nth-child(1)"));
        재난감시CCTV버튼.click();
        Thread.sleep(100);

        //CCTV 끄기
        List<WebElement> CCTVFrameEls = driver.findElements(By.cssSelector(".induationCheckBox ul li .selectOption.active"));
        for(WebElement el : CCTVFrameEls)
            el.click();
        Thread.sleep(100);

        ////교통감지켜기
        WebElement CCTVFloodingEl = driver.findElement(By.cssSelector(".induationCheckBox ul li:nth-child(2) .selectOption"));
        if(CCTVFloodingEl.getText().contains("OFF"))
            CCTVFloodingEl.click();

    }

    //--------------------------
    //줌 out
    //--------------------------
    public void zoomInit(WebElement zoominEl) throws InterruptedException {
        for(int i=0;i<9;i++){
            zoominEl.click();
            Thread.sleep(500);
        }

    }
    public void zoomInit(WebElement zoominEl,int count) throws InterruptedException {
        for(int i=0;i<count;i++){
            zoominEl.click();Thread.sleep(500);
        }

    }



    //----------------------------------------------------------------

    WebDriver driverTest ;
    @GetMapping("/open/cctv1")
    public void openCCTV1(){
        System.out.println("GET /open/cctv1");


        log.info("GET /open/cctv1");
        // WebDriverManager를 통해 ChromeDriver 설정
        WebDriverManager.chromedriver().setup();

        // Headless 모드로 ChromeDriver 설정
        ChromeOptions options = new ChromeOptions();
        // ChromeDriver 인스턴스 생성
        driverTest  = new ChromeDriver(options);
        options.setBinary("/bin/google-chrome-stable");

        driverTest.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        // 웹 페이지 열기
        driverTest.get("https://safecity.busan.go.kr/#/");


    }


    @GetMapping("/snapshot/cctv1")
    public void test() {
        System.out.println("GET /snapshot/cctv1");

        // 요소 로드 대기 및 요소 목록 가져오기
        List<WebElement> list = driverTest.findElements(By.cssSelector(".leaflet-pane.leaflet-marker-pane>img"));
        System.out.println("총 개수 : " + list.size());

        String mainWindowHandle = driverTest.getWindowHandle();  // 현재 창 핸들 저장
        int i = 1;

        for (WebElement e : list) {
            try {
                // 요소 클릭 (JavaScriptExecutor로 클릭)
                JavascriptExecutor js = (JavascriptExecutor) driverTest;
                js.executeScript("arguments[0].click();", e);

                // 새로 열린 모든 창 핸들 가져오기
                Set<String> allWindowHandles = driverTest.getWindowHandles();

                // 새창 탐색
                for (String windowHandle : allWindowHandles) {
                    if (!windowHandle.equals(mainWindowHandle)) {
                        // 새창으로 전환
                        driverTest.switchTo().window(windowHandle);

                        // 팝업 창 URL 확인
                        String popupURL = driverTest.getCurrentUrl();
                        System.out.println("팝업 창 URL: " + popupURL);

                        // WebDriverWait를 통해 타이틀 요소가 로딩될 때까지 기다림
                        try {
                            WebDriverWait wait = new WebDriverWait(driverTest, Duration.ofSeconds(10));
                            //타이틀이 없을수도 -예외처리할것!..
                            String title = null;
                            try {
                                WebElement titleElement = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".spot01 .titleBox span")));
                                title = titleElement.getText();
                                System.out.println("title : " + title);
                            }catch(Exception eee){

                                System.out.println("SPOT01 TITLE 찾을수 없음");
                                WebElement titleElement = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".spot02 .titleBox span")));
                                title = titleElement.getText();
                                System.out.println("title : " + title);

                            }

                            // DB 저장 확인 후 저장
                            if (!cCTV1repository.existsByHlsAddr(popupURL)) {
                                CCTV1 cctv1 = new CCTV1();
                                cctv1.setInstlPos(title);

                                // 위치 좌표 검색
                                Location location = keywordSearch(title);
                                if (location != null) {
                                    cctv1.setLat(location.getLat());
                                    cctv1.setLon(location.getLng());
                                } else {
                                    // 부산시 중심 좌표 (부산시청 부근)
                                    cctv1.setLat(35.1796);
                                    cctv1.setLon(129.0756);
                                }

                                cctv1.setCategory("재난");
                                cctv1.setHlsAddr(popupURL);
                                cctv1.setLastUpdateAt(LocalDateTime.now());
                                cCTV1repository.save(cctv1);
                            } else {
                                System.out.println("DB에 있음!");
                            }

                        } catch (NoSuchElementException e22) {
                            System.out.println("요소를 찾을 수 없습니다: " + e22);
                        } finally {
                            // 팝업 창 닫기 및 메인 창으로 복귀
                            driverTest.close();
                            driverTest.switchTo().window(mainWindowHandle);
                            Thread.sleep(2000);
                        }
                    }
                }
                i++;

            } catch (Exception e1) {
                System.out.println("_!_ 오류 발생: " + e1);
            }
        }
        System.out.println("종료!!");
    }


    @GetMapping(value = "/get/cctv1" ,produces = MediaType.APPLICATION_JSON_VALUE)
    public  List<CCTV1>  t1(){
        log.info("GET /get/cctv1....");
        return cCTV1repository.findAll();
    }

    @GetMapping(value="/search",produces = MediaType.APPLICATION_JSON_VALUE)
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
