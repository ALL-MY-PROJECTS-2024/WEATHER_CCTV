//package com.example.app.restController.backup;
//
//
//import com.example.app.domain.entity.CCTV2;
//import com.example.app.domain.repository.CCTV2Respository;
//import io.github.bonigarcia.wdm.WebDriverManager;
//import lombok.extern.slf4j.Slf4j;
//import org.openqa.selenium.By;
//import org.openqa.selenium.WebDriver;
//import org.openqa.selenium.WebElement;
//import org.openqa.selenium.chrome.ChromeDriver;
//import org.openqa.selenium.chrome.ChromeOptions;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.time.Duration;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Set;
//
//
//@RestController
//@Slf4j
//public class  CCTV2RestController {
//
//
//
//    @Autowired
//    private CCTV2Respository cCTV2repository;
//
//
//
//
//    List<WebElement> clusterOne = new ArrayList();
//
//
//    int zoomLevel = 4 ;      //값이 올라갈수록 depth 반복
//
//    @GetMapping("/cctv2")
//    public List<WebElement> cctv2() {
//        // WebDriverManager를 통해 ChromeDriver 설정
//        WebDriverManager.chromedriver().setup();
//
//        // Headless 모드로 ChromeDriver 설정
//        ChromeOptions options = new ChromeOptions();
////        options.addArguments("--headless");  // UI 없이 실행
////        options.addArguments("--no-sandbox");
////        options.addArguments("--disable-dev-shm-usage");
//
//        // ChromeDriver 인스턴스 생성
//        WebDriver driver = new ChromeDriver(options);
//        options.setBinary("/bin/google-chrome-stable");
//
//        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
//
//
//        try {
//            // 웹 페이지 열기
//            driver.get("https://safecity.busan.go.kr/#/");
//
//            // 페이지 로드 대기
//            Thread.sleep(3000);  // 페이지 로딩을 위해 잠시 대기 (필요 시 명시적으로 대기)
//
//            //팝업닫기
//            closedPopup(driver);
//
//            //재난감시 CCTV 클릭
//            turnOnCCTV2(driver);
//
//            //ONE DEPTH TEST
//            getOneDepthCCTVUrl(driver);
//
//            return null;
//        } catch (Exception e) {
//            e.printStackTrace();
//            return null;
//        } finally {
//            // 브라우저 닫기
//            //driver.quit();
//        }
//    }
//    //--------------------------
//    //팝업 닫기
//    //--------------------------
//    public void closedPopup(WebDriver driver) throws InterruptedException {
//        //팝업1 닫기 버튼 클릭
//        WebElement PopupcheckOne = driver.findElement(By.cssSelector(".todayClose input[type='checkbox']"));
//        if(PopupcheckOne.isDisplayed())
//            PopupcheckOne.click();
//
//        WebElement Popupbutton = driver.findElement(By.cssSelector(".popupClose"));
//        if(Popupbutton.isDisplayed()){
//            Popupbutton.click();
//            Thread.sleep(500);
//        }
//
//        WebElement PopupcheckTwo = driver.findElement(By.cssSelector(".todayGuideClose input[type='checkbox']"));
//        if(PopupcheckTwo!=null)
//            PopupcheckTwo.click();
//
//        //팝업2 닫기 버튼 클릭
//        WebElement Popupbutton2 = driver.findElement(By.cssSelector(".center"));
//        if(Popupbutton2.isDisplayed()){
//            Popupbutton2.click();
//            Thread.sleep(500);
//        }
//    }
//
//    //--------------------------
//    //재난감지 CCTV2 켜기
//    //--------------------------
//    public void turnOnCCTV2(WebDriver driver) throws InterruptedException {
//        WebElement 재난감시CCTV버튼 = driver.findElement(By.cssSelector(".map_dep1_ul>li:nth-child(1)"));
//        재난감시CCTV버튼.click();
//        Thread.sleep(100);
//
//        //교통감지끄기
//        List<WebElement> CCTVFrameEls = driver.findElements(By.cssSelector(".induationCheckBox ul li .selectOption.active"));
//        for(WebElement el : CCTVFrameEls)
//            el.click();
//        Thread.sleep(100);
//
//        //재난감지CCTV 켜기
//        WebElement CCTVFloodingEl = driver.findElement(By.cssSelector(".induationCheckBox ul li:nth-child(1) .selectOption"));
//        if(CCTVFloodingEl.getText().contains("OFF"))
//            CCTVFloodingEl.click();
//
//    }
//
//    //--------------------------
//    //줌 out
//    //--------------------------
//    public void zoomInit(WebElement zoominEl) throws InterruptedException {
//        for(int i=0;i<9;i++){
//            zoominEl.click();
//            Thread.sleep(500);
//        }
//
//    }
//    public void zoomInit(WebElement zoominEl,int count) throws InterruptedException {
//        for(int i=0;i<count;i++){
//            zoominEl.click();Thread.sleep(500);
//        }
//
//    }
//
//    //ONE DEPTH
//    public void getOneDepthCCTVUrl(WebDriver driver) throws InterruptedException {
//
//        //최상위 이동
//        WebElement zoominEl = driver.findElement(By.cssSelector(".leaflet-control-zoom-out"));
//        zoomInit(zoominEl);
//
//        //최상위 클러스터 클릭
//        WebElement 재난CCTV = driver.findElement(By.cssSelector(".leaflet-marker-icon.marker-cluster.marker-cluster-large.leaflet-zoom-animated.leaflet-interactive"));
//        WebElement totalValue = driver.findElement(By.cssSelector(".leaflet-marker-icon.marker-cluster.marker-cluster-large.leaflet-zoom-animated.leaflet-interactive div span"));
//        System.out.println("TOTAL :" + totalValue.getText());
//        재난CCTV.click();
//        Thread.sleep(1000);
//
//        //최상위  클릭 이후 카메라 수집
//        List<WebElement> cam  = driver.findElements(By.cssSelector(".leaflet-pane.leaflet-marker-pane>img"));
//        System.out.println("CAM's size : " + cam.size());
//        saveCCTVUrl(cam,driver);
//        Thread.sleep(1000);
//
//
//        //OneDepth 클러스터 수집
//        List<WebElement> ALLClusteredMarkers = driver.findElements(By.cssSelector(".leaflet-pane.leaflet-marker-pane>div"));
//        System.out.println("One DEPTH TOTAL size : " + ALLClusteredMarkers.size());
//
//        List<WebElement> oneDepthList = new ArrayList<>(ALLClusteredMarkers);
//
//
//        //반복해서 OneDepth 기준 카메라 긁어옴
//        for(int i=0;i<oneDepthList.size();i++){
//
//            //페이지 새로고침
//            driver.navigate().refresh();
//
//            //CCTV2 켜기
//            turnOnCCTV2(driver);
//
//
//            //최상위 이동
//            zoominEl = driver.findElement(By.cssSelector(".leaflet-control-zoom-out"));
//            zoomInit(zoominEl);
//            Thread.sleep(1000);
//
//            //최상위 클러스터 클릭
//            재난CCTV = driver.findElement(By.cssSelector(".leaflet-marker-icon.marker-cluster.marker-cluster-large.leaflet-zoom-animated.leaflet-interactive"));
//            재난CCTV.click();
//            Thread.sleep(1000);
//
//            //ONEDEPTH_GET
//            List<WebElement> one = driver.findElements(By.cssSelector(".leaflet-pane.leaflet-marker-pane>div"));
//            WebElement e = one.get(i);
//            WebElement valEl =  e.findElement((By.cssSelector("div span")));
//            System.out.println("i : "  + i + "  VAL : "+  valEl.getText());
//            e.click();
//
//            Thread.sleep(2000);
//
//            //카메라 GET
//            cam  = driver.findElements(By.cssSelector(".leaflet-pane.leaflet-marker-pane>img"));
//            System.out.println("CAM's size : " + cam.size());
//            saveCCTVUrl(cam,driver);
//            Thread.sleep(1000);
//        }
//
//    }
//    //TWO DEPTH
//    public void getTwoDepthCCTVUrl(){
//
//    }
//    //THREE DEPTH
//    public void getThreeDepthCCTVUrl(){
//
//    }
//    //FOUR DEPTH
//    public void getFourDepthCCTVUrl(){
//
//    }
//
//    //--------------------------
//    //CCTV URL 받기
//    //--------------------------
//    public void saveCCTVUrl(List<WebElement> list ,WebDriver driver)  {
//
//            int i = 1;
//            for (WebElement e : list) {
//                try {
//                    System.out.print("반복 횟수 : " + i + " ");
//                    e.click();
//                    System.out.println(e);
//                    Thread.sleep(1000);
//
//                    // 새로 열린 모든 창 핸들 가져오기
//                    Set<String> allWindowHandles = driver.getWindowHandles();
//
//                    // 현재 창의 핸들을 저장
//                    String mainWindowHandle = driver.getWindowHandle();
//
//                    // 새창 탐색
//                    for (String windowHandle : allWindowHandles) {
//                        if (!windowHandle.equals(mainWindowHandle)) {
//                            // 새창으로 전환
//                            driver.switchTo().window(windowHandle);
//
//                            // 새창의 URL 확인
//                            String popupURL = driver.getCurrentUrl();
//                            System.out.println("팝업 창 URL: " + popupURL);
//                            String  title =  driver.findElement(By.cssSelector(".spot01 .titleBox span")).getText();
//                            System.out.println("title : " + title);
//
//
//                            //DB저장
//                            if (!cCTV2repository.existsByHlsAddr(popupURL)) {
//                                CCTV2 cctv2 = new CCTV2();
//                                cctv2.setInstlPos(title);
//                                cctv2.setCategory("재난");
//                                cctv2.setHlsAddr(popupURL);
//
//                                cctv2.setLastUpdateAt(LocalDateTime.now());
//                                cCTV2repository.save(cctv2);
//                            }
//                            // 팝업창 닫기
//                            driver.close();
//
//                            // 메인 창으로 다시 전환
//                            driver.switchTo().window(mainWindowHandle);
//                        }
//                    }
//                    i++;
//
//                }catch(Exception e1){
//                    System.out.print("_!_");
//                }
//            }
//            System.out.println();
//
//
//    }
//
//    @GetMapping("/get/cctv2")
//    public  List<CCTV2>  t1(){
//        log.info("GET /get/cctv2....");
//        return cCTV2repository.findAll();
//    }
//
//
////    // 부산광역시_CCTV 설치 현황정보
////    @GetMapping("/cctv")
////    public List<Item> cctv(){
////        log.info("GET /cctv..");
////
////        //[임시] URL 요청
//////        String url = "https://apis.data.go.kr/6260000/BusanITSCCTV/CCTVList";
//////        String pageNo = "1";
//////        String numOfRows = "10";
//////        String serviceKey = "xYZ80mMcU8S57mCCY/q8sRsk7o7G8NtnfnK7mVEuVxdtozrl0skuhvNf34epviHrru/jiRQ41FokE9H4lK0Hhg==";
//////
//////        String total = url
//////                + "?serviceKey=" + serviceKey
//////                + "&pageNo=" + pageNo
//////                + "&numOfRows=" + numOfRows;
//////
//////        RestTemplate restTemplate = new RestTemplate();
//////
//////        ResponseEntity<Root> response = restTemplate.getForEntity(total, Root.class);
//////        System.out.println(response.getBody());
////        // 고정된 CCTV 데이터 100개
////
////
////        List<Item> cctvList = new ArrayList<>();
////        cctvList.add(new Item("충무교차로", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_1.stream/playlist.m3u8", 129.024297, 35.096521));
////        cctvList.add(new Item("남포동", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_2.stream/playlist.m3u8", 129.029273, 35.097858));
////        cctvList.add(new Item("옛시청", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_3.stream/playlist.m3u8", 129.035343, 35.097879));
////        cctvList.add(new Item("부산우체국", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_4.stream/playlist.m3u8", 129.036658, 35.103092));
////        cctvList.add(new Item("영주사거리", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_5.stream/playlist.m3u8", 129.037914, 35.11186));
////        cctvList.add(new Item("부산역", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_6.stream/playlist.m3u8", 129.039353, 35.114967));
////        cctvList.add(new Item("초량교차로", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_7.stream/playlist.m3u8", 129.042203, 35.120005));
////        cctvList.add(new Item("좌천삼거리", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_8.stream/playlist.m3u8", 129.052554, 35.132734));
////        cctvList.add(new Item("자유시장", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_9.stream/playlist.m3u8", 129.059168, 35.141795));
////        cctvList.add(new Item("범내골교차로", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_10.stream/playlist.m3u8", 129.059051, 35.147345));
////        // 계속해서 100개의 데이터를 추가합니다.
////        // 실제 데이터에 맞게 아래의 형식을 따라 나머지 데이터를 채워주세요.
////        cctvList.add(new Item("천우장", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_11.stream/playlist.m3u8", 129.058965, 35.15453));
////        cctvList.add(new Item("서면교차로", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_12.stream/playlist.m3u8", 129.059124, 35.157704));
////        cctvList.add(new Item("삼전교차로", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_13.stream/playlist.m3u8", 129.063771, 35.163847));
////        cctvList.add(new Item("양정교차로", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_15.stream/playlist.m3u8", 129.070956, 35.172854));
////        cctvList.add(new Item("부산지방경찰청", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_16.stream/playlist.m3u8", 129.075663, 35.178605));
////        cctvList.add(new Item("연산교차로", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_17.stream/playlist.m3u8", 129.081753, 35.186064));
////        cctvList.add(new Item("교대사거리", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_18.stream/playlist.m3u8", 129.080232, 35.19575));
////        cctvList.add(new Item("동래롯데", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_19.stream/playlist.m3u8", 129.078823, 35.211747));
////        cctvList.add(new Item("온천교사거리", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_20.stream/playlist.m3u8", 129.084225, 35.218093));
////        cctvList.add(new Item("부산대학교사거리", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_21.stream/playlist.m3u8", 129.086384, 35.231319));
////        cctvList.add(new Item("부곡사거리", "https://its-stream3.busan.go.kr:8443/rtplive/cctv_22.stream/playlist.m3u8", 129.091587, 35.230741));
////
////
////        return cctvList;
////    }
////    @Data
////    private static class Content{
////        public int pageNo;
////        public int numOfRows;
////        public int totalCount;
////        public ArrayList<Item> items;
////    }
////    @Data
////    @AllArgsConstructor
////    private static class Item{
////        public String instlPos;
////        public String hlsAddr;
////        public double lot;
////        public double lat;
////    }
////    @Data
////    private static class Root{
////        public String resultCode;
////        public String resultMsg;
////        public Content content;
////    }
//
//
//}
