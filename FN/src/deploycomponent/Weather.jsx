// CCTVPopup.js
import React, { useState, useEffect, useRef } from "react";
import "./Weather.scss";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS import

import { Swiper, SwiperSlide } from "swiper/react"; // Swiper와 SwiperSlide를 import
import { Navigation } from "swiper/modules"; // Navigation 모듈 import

import "../../node_modules/swiper/swiper-bundle.min.css"; // Swiper 스타일 import

// 날씨 정보 가져오기
const fetchWeatherInfo = async (latitude, longitude) => {
  // 현재 날짜와 시간을 가져와서 포맷
  const now = new Date();

  // 가능한 base_time 목록 (30분 단위로 설정)
  const availableTimes = [
    "0200",
    "0500",
    "0800",
    "1100",
    "1400",
    "1700",
    "2000",
    "2300",
  ];

  // 현재 시간에서 가능한 base_time을 찾음
  let baseTime = "";
  for (let i = availableTimes.length - 1; i >= 0; i--) {
    const [hour, minute] = [parseInt(availableTimes[i].slice(0, 2)), 0];
    const baseDateTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute
    );

    // 현재 시간보다 이전의 base_time을 찾음
    if (now >= baseDateTime) {
      baseTime = availableTimes[i];
      break;
    }
  }

  // 자정 이전의 base_time을 사용하는 경우 하루 전 날짜로 설정
  let baseDate = now;
  if (now.getHours() < 8) {
    baseDate.setDate(now.getDate() - 1);
    baseTime = "2300";
  }

  // base_date 포맷: YYYYMMDD
  const formattedDate = `${baseDate.getFullYear()}${String(
    baseDate.getMonth() + 1
  ).padStart(2, "0")}${String(baseDate.getDate()).padStart(2, "0")}`;

  const gridCoords = dfs_xy_conv("toXY", latitude, longitude);
  console.log(
    `baseDate : ${formattedDate} base_time : ${baseTime} 격자 좌표: x=${gridCoords.x}, y=${gridCoords.y}`
  );

  try {
    const resp = await axios.get(
      `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst`,
      {
        params: {
          ServiceKey:
            "xYZ80mMcU8S57mCCY/q8sRsk7o7G8NtnfnK7mVEuVxdtozrl0skuhvNf34epviHrru/jiRQ41FokE9H4lK0Hhg==",
          pageNo: 1,
          numOfRows: 450,
          dataType: "JSON",
          base_date: formattedDate,
          base_time: baseTime,
          nx: gridCoords.x,
          ny: gridCoords.y,
        },
      }
    );
    return resp;
  } catch (error) {
    console.error("날씨 정보를 가져오는 데 실패했습니다:", error);
    return null;
  }
};
//날씨정보
function dfs_xy_conv(code, v1, v2) {
  //<!--
  //
  // LCC DFS 좌표변환을 위한 기초 자료
  //
  var RE = 6371.00877; // 지구 반경(km)
  var GRID = 5.0; // 격자 간격(km)
  var SLAT1 = 30.0; // 투영 위도1(degree)
  var SLAT2 = 60.0; // 투영 위도2(degree)
  var OLON = 126.0; // 기준점 경도(degree)
  var OLAT = 38.0; // 기준점 위도(degree)
  var XO = 43; // 기준점 X좌표(GRID)
  var YO = 136; // 기1준점 Y좌표(GRID)
  //
  // LCC DFS 좌표변환 ( code : "toXY"(위경도->좌표, v1:위도, v2:경도), "toLL"(좌표->위경도,v1:x, v2:y) )
  //

  var DEGRAD = Math.PI / 180.0;
  var RADDEG = 180.0 / Math.PI;

  var re = RE / GRID;
  var slat1 = SLAT1 * DEGRAD;
  var slat2 = SLAT2 * DEGRAD;
  var olon = OLON * DEGRAD;
  var olat = OLAT * DEGRAD;

  var sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  var rs = {};
  if (code == "toXY") {
    rs["lat"] = v1;
    rs["lng"] = v2;
    var ra = Math.tan(Math.PI * 0.25 + v1 * DEGRAD * 0.5);
    ra = (re * sf) / Math.pow(ra, sn);
    var theta = v2 * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    rs["x"] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    rs["y"] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  } else {
    rs["x"] = v1;
    rs["y"] = v2;
    var xn = v1 - XO;
    var yn = ro - v2 + YO;
    ra = Math.sqrt(xn * xn + yn * yn);
    if (sn < 0.0) ra = -ra;
    var alat = Math.pow((re * sf) / ra, 1.0 / sn);
    alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

    if (Math.abs(xn) <= 0.0) {
      theta = 0.0;
    } else {
      if (Math.abs(yn) <= 0.0) {
        theta = Math.PI * 0.5;
        if (xn < 0.0) theta = -theta;
      } else theta = Math.atan2(xn, yn);
    }
    var alon = theta / sn + olon;
    rs["lat"] = alat * RADDEG;
    rs["lng"] = alon * RADDEG;
  }
  return rs;
}

const Weather = ({ lat, lon, hlsAddr, onClose }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(true); // iframe 로딩 상태 추가
  const [skyIcon, setSkyIcon] = useState();

  //
  useEffect(() => {
    const req = async () => {
      try {
          const resp =  await fetchWeatherInfo(lat,lon);
          
        
          const groupedData = Array.from(resp.data.response.body.items.item).reduce((acc,item)=>{
          const key = `${item.fcstDate} - ${item.fcstTime}`;
            // 키가 이미 존재하는 경우 기존 배열에 추가, 그렇지 않으면 새 배열 생성
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        },{})

        //그루핑작업하기
        console.log('groupedData',groupedData);
        setWeatherData(groupedData);
      } catch (error) {
        console.error(error);
      }
    };
    req();
  }, []);

  // 날씨 아이콘 설정 함수
  const skyIconHandler = (skyValue) => {
    switch (skyValue) {
      case "1":
        return "NB01.png"; // 맑음
      case "3":
        return "NB03.png"; // 구름 많음
      case "4":
        return "NB04.png"; // 흐림
      default:
        return "NB01.png"; // 기본 맑음
    }
  };

  // PTY(강수) 아이콘 설정 함수
  const ptyIconHandler = (ptyValue) => {
    switch (ptyValue) {
      case "1":
        return { icon: "NB08.png", name: "비" }; // 비
      case "2":
        return { icon: "NB12.png", name: "비/눈" }; // 비눈
      case "3":
        return { icon: "NB11.png", name: "눈" }; //눈
      case "4":
        return { icon: "NB07.png", name: "소나기" }; // 소나기
      default:
        return { icon: null, name: "강수 없음" }; // 기본 맑음
    }
  };


  
  // 바람 방향 계산 함수(UUU, VVV) - 16방위 변환
  const calculateWindDirection = (uuu, vvv) => {
    console.log("uuu", uuu, "vvv", vvv);
    const angle = (270 - Math.atan2(vvv, uuu) * (180 / Math.PI) + 360) % 360;

    console.log("angle", angle);
    const index = Math.floor((angle + 22.5 * 0.5) / 22.5);
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
      "N",
    ];
    return directions[index];
  };

  return (
    <>
      <div className="item">1</div>
      <div className="item">2</div>
      <div className="item">3</div>
      <div className="item">4</div>
    </>
  );
};

export default Weather;
