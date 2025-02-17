import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api/axiosConfig'; // 새로운 api 인스턴스 임포트



import { union } from "@turf/turf"; // 기본 내보내기가 아닌 union 모듈만 임포트
import * as turf from "@turf/turf";


import { Link } from "react-router-dom";

// COMPONENT
import ShowMap from "./ShowMap";
import Weather from "./Weather";
import GaugeChart from "./GaugeChart";
import FloodingMapOverlay from "./FloodingMapOverlay";
import CCTVPopup from "./CCTVPopup";

//Dataset
import busanGeoJson from "../dataSet/busan.json";
import floodingData from "../dataSet/FLOODING.json";
import busanRiverGeoJson from "../dataSet/river.json";
import cctv1Data from "../dataSet/CCTV1.json";

import axios from "axios";

//DATASET_TEST

import "./Home.scss";

//leaflet
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet"; // 클릭 이벤트 추가를 위해 useMapEvents import
import "leaflet/dist/leaflet.css"; // Leaflet CSS import
import "leaflet.markercluster";

import "proj4";
import "proj4leaflet";
import L, { CRS, bounds, geoJSON } from "leaflet";

//------------------------------------------------------------------------
// 쓰로틀링
//------------------------------------------------------------------------
const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
};

//------------------------------------------------------------------------
// 날씨 정보 가져오기 - 초단기 실황조회
//------------------------------------------------------------------------
const fetchWeatherInfo_Ultra = async (latitude, longitude) => {
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

  let baseDate = new Date(now);
  let baseTime = `${String(now.getHours()).padStart(2, "0")}${String(
    Math.floor(now.getMinutes() / 10) * 10
  ).padStart(2, "0")}`;

  // 주어진 `availableTimes` 중 가장 가까운 이전 시간 찾기
  for (let i = availableTimes.length - 1; i >= 0; i--) {
    if (baseTime >= availableTimes[i]) {
      baseTime = availableTimes[i];
      break;
    }
  }

  // 자정 이전의 경우 날짜 조정
  if (baseTime === "2300" && now.getHours() < 2) {
    baseDate.setDate(baseDate.getDate() - 1);
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
      `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst`,
      {
        params: {
          ServiceKey:
            "xYZ80mMcU8S57mCCY/q8sRsk7o7G8NtnfnK7mVEuVxdtozrl0skuhvNf34epviHrru/jiRQ41FokE9H4lK0Hhg==",
          pageNo: 1,
          numOfRows: 100,
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

//------------------------------------------------------------------------
// 날씨 정보 가져오기 - 날씨 방향 처리
//------------------------------------------------------------------------
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

//------------------------------------------------------------------------
// 마커 클러스터 그룹
//------------------------------------------------------------------------
// 마커 크기를 동적으로 계산하는 함수
const getMarkerIconSize = () => {
  const isMobile = window.innerWidth <= 768; // 화면 너비가 768px 이하인 경우를 모바일로 간주
  return isMobile
    ? { iconSize: [30, 30], shadowSize: [30, 30] }
    : { iconSize: [40, 40], shadowSize: [50, 50] };
};
const getMarkerIconSize2 = () => {
  const isMobile = window.innerWidth <= 768; // 화면 너비가 768px 이하인 경우를 모바일로 간주
  return isMobile
    ? { iconSize: [25, 41], shadowSize: [25, 41] }
    : { iconSize: [25, 41], shadowSize: [25, 41] };
};
// 마커 아이콘 생성 함수
const createCCTV1MarkerIcon = () => {
  const { iconSize, shadowSize } = getMarkerIconSize(); // 마커와 그림자의 크기를 모두 가져옴
  return new L.Icon({
    iconUrl:
      "https://safecity.busan.go.kr/vue/img/gis_picker_cctv_city.a17cfe5e.png",
    iconSize: iconSize, // 동적으로 마커 크기 설정
    iconAnchor: [iconSize[0] / 2, iconSize[1]], // 아이콘의 중심이 앵커에 맞도록 설정
    popupAnchor: [0, -iconSize[1]], // 팝업이 아이콘 위로 적절하게 뜨도록 설정
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    shadowSize: shadowSize, // 동적으로 그림자 크기 설정
  });
};

// FLOODING ICON
const createFLOODINGMarkerIcon = () => {
  const { iconSize, shadowSize } = getMarkerIconSize2(); // 마커와 그림자의 크기를 모두 가져옴
  return new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    iconSize: iconSize, // 동적으로 마커 크기 설정
    iconAnchor: [iconSize[0] / 2, iconSize[1]], // 아이콘의 중심이 앵커에 맞도록 설정
    popupAnchor: [0, -iconSize[1]], // 팝업이 아이콘 위로 적절하게 뜨도록 설정
    shadowUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowSize: shadowSize, // 동적으로 그림자 크기 설정
  });
};

const Home = () => {
  const [centerPosition, setCenterPosition] = useState({
    lat: 35.1795543,
    lng: 129.0756416,
  });
  //기본맵
  const [map, setMap] = useState(null);

  //기본타일
  const [tileState, setTileState] = useState(true);
  const [tile, setTile] = useState(null);

  //경계구역 표시(WMS)
  const [sig_layerState, setSig_layerState] = useState(false);
  const [sig_layer, setSig_layer] = useState(null);

  //침수이미지 내수(상세경계지역역)
  const [jsonLayer, setJsonLayer] = useState(null);
  const [geojsonLayerState, setGeojsonLayerState] = useState(true);
  const [selectedMapLayer, setSelectedMapLayer] = useState(null);
  const [selectedMapLayerCenter, setSelectedMapLayerCenter] = useState(null);
  const [도시지역, set도시지역] = useState([
    "북구",
    "중구",
    "동래구",
    "사상구",
  ]);
  //침수이미지 외수
  const [jsonRiverLayer, setJsonRiverLayer] = useState(null);
  const [geojsonRiverLayerState, setGeojsonRiverLayerState] = useState(false);
  const [selectedRiverMapLayer, setSelectedRiverMapLayer] = useState(null);
  const [selectedRiverMapLayerCenter, setSelectedRiverMapLayerCenter] =
    useState(null);
  const [외수지역, set외수지역] = useState(["수영강", "온천천", "동강"]);
  //
  //침수지역오버레이
  const [floodRiskInfo, setFloodRiskInfo] = useState(null);

  //침수
  const [floodingState, setFloodingState] = useState(false);
  const [clusterFLOODING, setClusterFLOODING] = useState([]);
  const [selectedFLOODING, setSelectedFLOODING] = useState(null); // 선택된 CCTV 정보 상태 추가
  //CCTV1
  const [CCTV01State, setCCTV01State] = useState(false);
  const [clusterCCTV1, setClusterCCTV1] = useState([]); //재난
  const [selectedCCTV, setSelectedCCTV] = useState(null); // 선택된 CCTV 정보 상태 추가

  //YOLO
  const [yolo, setYolo] = useState(null);
  const [yoloState, setYoloState] = useState(false);

  //침수 이미지 오버레이
  const [floodingImgState, setFloodingImgState] = useState(false);

  //표시여부
  const [displayMap, setDisplayMap] = useState(true);

  //지도
  const [selectedShowMap, setSelectedShowMap] = useState(null);

  //

  //오늘날씨
  //PTY (초단기) 없음(0), 비(1), 비/눈(2), 눈(3),소나기(4) , 빗방울(5), 빗방울눈날림(6), 눈날림(7)
  const PTY_LIST = [
    { icon: "sunny", text: "맑음", color: "" },
    { icon: "rainy", text: "비", color: "gray" },
    { icon: "rainy_snow", text: "비/눈", color: "" },
    { icon: "snowing", text: "눈", color: "white" },
    { icon: "rainy_light", text: "소나기", color: "" },
    { icon: "water_drop", text: "빗방울", color: "" },
    { icon: "weather_mix", text: "빗방울/눈날림", color: "" },
    { icon: "snowing_heavy", text: "눈날림", color: "" },
  ];
  const [todayWeather, setTodayWeather] = useState(null);
  const [todayWindDirectionInfo, setTodayWindDirectionInfo] = useState(null);
  const [todayLocation, setTodayLocation] = useState("");


  const fetchFloodRiskInfo = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://safecity.busan.go.kr/iots/base/gisAlarm.do?latitude=${latitude}&longitude=${longitude}`
      );
      setFloodRiskInfo(response.data);
      console.log("Flood Risk Info:", response.data);
    } catch (error) {
      console.error("Failed to fetch flood risk info:", error);
      setFloodRiskInfo({ Dong: "서비스 지역을 벗어났습니다.", info: "" });
    }
  };
  const throttledFetchFloodRiskInfo = useCallback(
    throttle(fetchFloodRiskInfo, 300),
    []
  );

  // //----------------------------
  // // 인증확인
  // //----------------------------
  // const navigate = useNavigate();
  // // useEffect에서 API 검증 호출
  // useEffect(() => {
  //   const validateToken = async () => {
  //     try {
  //       // 토큰 유효성 검증을 위한 별도 엔드포인트 호출
  //       const resp = await axios.get("/auth/validate", {
  //         withCredentials: true,
  //       });
  //       console.log("토큰 검증 성공:", resp);
        
  //     } catch (error) {
  //       console.log("토큰 검증 실패:", error);
  //       //실패시 /login 이동
  //       navigate("/login"); 
  //     }
  //   };
  //   validateToken();

    
  // }, [navigate,tileState,sig_layerState,geojsonLayerState,geojsonRiverLayerState,floodingState,CCTV01State]); // navigate를 의존성 배열에 추가



  //----------------------------
  // 기본 지도
  //----------------------------
  useEffect(() => {
    if (map == null) {
      // 지도 생성
      const newCenter = {
        lat: centerPosition.lat + 0.017, // 1km 아래로 이동
        lng: centerPosition.lng,
      };

      // 좌표계 정의
      const EPSG5181 = new L.Proj.CRS(
        "EPSG:5181",
        "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
        {
          resolutions: [
            2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25,
          ],
          origin: [-30000, -60000],
          bounds: L.bounds(
            [-30000 - Math.pow(2, 19) * 4, -60000],
            [-30000 + Math.pow(2, 19) * 5, -60000 + Math.pow(2, 19) * 5]
          ),
        }
      );

      const mapInstance = L.map("map", {
        center: [newCenter.lat, newCenter.lng],
        crs: EPSG5181,
        zoom: 5,
        minZoom: 1, // 최소 줌 레벨
        maxZoom: 18, // 최대 줌 레벨 추가
        worldCopyJump: false,
      });

      // Map 객체를 상태로 저장
      setMap(mapInstance);

      // 지도 이동 시 이벤트
      mapInstance.on("moveend", () => {
        const center = mapInstance.getCenter();
        setCenterPosition({ lat: center.lat, lng: center.lng });
        throttledFetchFloodRiskInfo(center.lat, center.lng);
      });
    }
  }, [map]);

  //-----------------------------------
  // 지도 타일 넣기
  //-----------------------------------
  useEffect(() => {
    if (map) {
      if (tileState) {
        // Add a base tile layer (OpenStreetMap)
        const tileLayer = L.tileLayer(
          "http://map{s}.daumcdn.net/map_2d/1807hsm/L{z}/{y}/{x}.png",
          {
            minZoom: 1,
            maxZoom: 13,
            zoomReverse: true,
            zoomOffset: 1,
            subdomains: "0123",
            continuousWorld: true,
            tms: true,
            attribution: "&copy; OpenStreetMap contributors",
          }
        ).addTo(map);
        setTile(tileLayer);

        console.log("tilestate true ,tile null");
      } else {
        // 타일 레이어가 이미 존재하고, 상태가 false일 경우 제거
        if (tile) {
          map.removeLayer(tile);
          setTile(null);
        }
      }
    }
  }, [tileState, map]);

  //----------------------------
  //침수구역 표시여부
  //----------------------------
  useEffect(() => {
    if (map) {
      //---------------------------
      //법정동 표시용
      //---------------------------
      // console.log('displayMap',displayMap)
      if (displayMap) {
        if (!sig_layerState) {
          const wmsLayer = L.tileLayer.wms(
            "https://safecity.busan.go.kr/geoserver/iots/wms",
            {
              layers: "iots:sig_layer",
              format: "image/png",
              transparent: true,
              version: "1.1.1",
              attribution: "&copy; Safe City Busan GeoServer",
              styles: "",
              zIndex: 100,
            }
          );

          wmsLayer.addTo(map);

          setSig_layer(wmsLayer);
          setSig_layerState(!sig_layerState);
          console.log("create layer..");
        }
      } else {
        map.removeLayer(sig_layer);
        setSig_layerState(!sig_layerState);
      }
    }
  }, [map, selectedMapLayerCenter, displayMap]);

  //----------------------------
  //침수 이미지 내수 표시(GEOJSON)
  //----------------------------
  useEffect(() => {
    if (map) {
      if (geojsonLayerState) {
        if (!jsonLayer) {
          // GeoJSON 레이어 추가(클릭- 이벤트처리용)
          const geojsonLayer = L.geoJSON(busanGeoJson, {
            style: function (feature) {
              const districtName = feature.properties.adm_nm; // 법정동명
              let isHighlighted = false;

              for (const index in 도시지역) {
                isHighlighted = districtName.includes(도시지역[index]);
                if (isHighlighted) break;
              }

              //console.log(districtName,isHighlighted);

              if (isHighlighted) {
                return {
                  color: "",
                  fillColor: "gray",
                  fillOpacity: 0.5,
                  weight: 0,
                };
              } else {
                return {
                  color: "",
                  fillColor: "",
                  fillOpacity: 0,
                  weight: 1,
                };
              }
            },
            filter: function (feature, layer) {
              // 특정 기준으로 필터링 (예: 특정 속성을 가진 데이터만 표시)
              //console.log('feature',feature)북구, 중구, 동래구, 사상구

              return feature;
            },
          })
            .bindPopup(function (layer) {
              const description =
                layer.feature.properties.description ||
                "No description available";
              console.log("layer", layer);
              return `<div>${layer.feature.properties.adm_nm}</div>`; // HTML 문자열 반환
            })
            .on("click", function (e) {
              const names = e.layer.feature.properties.adm_nm.split(" ");
              const bounds = e.layer.getBounds();
              const center = bounds.getCenter();

              setSelectedMapLayer(e.layer);
              //
              setSelectedMapLayerCenter(center);
              //
              const location = names[1] + " " + names[2];
              setTodayLocation(location);

              //console.log(names[1])
              if (도시지역.includes(names[1])) {
                console.log("clicked..", names[1]);

                //중구지역
                if (names[1].includes("중구")) {
                  setSelectedShowMap({ addr: "중구" });
                }
              }
            })
            .addTo(map);
          setJsonLayer(geojsonLayer);
        } else {
          //jsonLayer 가 있으면
          map.addLayer(jsonLayer);
        }
      } else {
        if (jsonLayer) {
          map.removeLayer(jsonLayer);
        }
      }
    }
  }, [map, geojsonLayerState]);

  //-----------------------------------
  //
  //-----------------------------------
  useEffect(() => {
    if (selectedMapLayer) {
      // //Set the background of the clicked area

      //기존 표시된 스타일 전부 제거
      if (jsonLayer) {
        jsonLayer.eachLayer((layer) => {
          const districtName = layer.feature.properties.adm_nm; // 법정동명
          let isHighlighted = false;

          for (const index in 도시지역) {
            isHighlighted = districtName.includes(도시지역[index]);
            if (isHighlighted) {
              break;
            }
          }

          if (isHighlighted) {
            layer.setStyle({
              color: "",
              fillColor: "gray",
              fillOpacity: 0.5,
              weight: 0,
            });
          } else {
            if (layer.setStyle) {
              layer.setStyle({
                color: "",
                fillColor: "",
                fillOpacity: 0,
                weight: 1,
              });
            }
          }
        });
      }

      selectedMapLayer.setStyle({
        color: "gray",
        weight: 1,
        fillColor: "#40FF00",
        fillOpacity: 0.2,
      });
    }
    return () => {};
  }, [selectedMapLayer]);

  //-----------------------------------
  //  침수이미지 외수  - 수영강 동두천 동강
  //-----------------------------------
  useEffect(() => {
    if (map) {
      if (geojsonRiverLayerState) {
        if (!jsonRiverLayer) {
          // GeoJSON 레이어 추가(클릭- 이벤트처리용)
          const geojsonRiverLayer = L.geoJSON(busanRiverGeoJson, {
            style: function (feature) {
              return {
                color: "royalblue", // 테두리 색 (파란색)
                weight: 1.5, // 테두리 두께
                opacity: 1, // 테두리 투명도
                fillColor: "#ffffff", // 내부 채우기 색 (흰색)
                fillOpacity: 0, // 내부 투명도
              };
            },
            filter: function (feature, layer) {
              return feature;
            },
          })
            .bindPopup(function (layer) {
              // const description =
              //   layer.feature.properties.description ||
              //   "No description available";
              // console.log("layer", layer);
              // return `<div>${layer.feature.properties.adm_nm}</div>`; // HTML 문자열 반환
            })
            .on("click", function (e) {
              console.log(e);

              const bounds = e.layer.getBounds();
              const center = bounds.getCenter();
              // //
              setSelectedRiverMapLayer(e.layer);
              //
              setSelectedRiverMapLayerCenter(center);
            })
            .addTo(map);
          setJsonRiverLayer(geojsonRiverLayer);
        } else {
          //jsonLayer 가 있으면
          map.addLayer(jsonRiverLayer);
        }
      } else {
        if (jsonRiverLayer) {
          map.removeLayer(jsonRiverLayer);
        }
      }
    }
  }, [map, geojsonRiverLayerState]);

  //-----------------------------------
  // 오늘날씨 정보 표시
  //-----------------------------------

  useEffect(() => {
    if (geojsonLayerState && tileState) {
      const req = async () => {
        try {
          const resp = await fetchWeatherInfo_Ultra(
            selectedMapLayerCenter.lat,
            selectedMapLayerCenter.lng
          );
          const data = resp.data.response.body.items;
          console.log("data", data);
          setTodayWeather(data);

          //바람 정보 받기
          const uuuValue = data.item[4].obsrValue;
          const vvvValue = data.item[6].obsrValue;

          const windDirectionText = calculateWindDirection(uuuValue, vvvValue); // 방향 텍스트
          // UUU와 VVV 값을 이용하여 바람의 각도(도) 계산
          const angle =
            (270 - Math.atan2(vvvValue, uuuValue) * (180 / Math.PI) + 360) %
            360;
          const windSpeed = data.item[7].obsrValue;

          // console.log({uuuValue,vvvValue,windDirectionText,angle,windSpeed})
          setTodayWindDirectionInfo({
            uuuValue,
            vvvValue,
            windDirectionText,
            angle,
            windSpeed,
          });
          //
        } catch (error) {
          console.error("날씨 정보를 가져오는 데 실패했습니다:", error);
          setTodayWeather(null);
          setTodayWindDirectionInfo(null);
          return null;
        }
      };
      req();
    }
  }, [selectedMapLayerCenter]);

  //-----------------------------------
  // 침수 구역선택시
  //-----------------------------------
  //
  //
  //

  //-----------------------------------
  // 침수 위험 CCTV
  //-----------------------------------
  useEffect(() => {
    const fetchCCTVData = async () => {
      try {
        setClusterFLOODING(
          floodingData.map((item) => ({ ...item, type: "FLOODING" }))
        );
        setClusterCCTV1(cctv1Data.map((item) => ({ ...item, type: "CCTV1" })));
      } catch (error) {}
    };
    fetchCCTVData();
  }, []);

  //-----------------------------------
  // FLODDING 클러스터링
  //-----------------------------------
  useEffect(() => {
    if (map && floodingState) {
      const clusterGroup3 = L.markerClusterGroup({
        maxClusterRadius: 100, // 클러스터링 반경을 100미터로 설정 (값을 원하는 대로 조정)
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          let clusterClass = "marker-cluster-icon-small"; // CCTV2 아이콘 기본 클래스
          if (count >= 10 && count < 50) {
            clusterClass = "marker-cluster-icon-medium";
          } else if (count >= 50) {
            clusterClass = "marker-cluster-icon-large";
          }

          return new L.DivIcon({
            html: `<div className="custom-cluster-icon ${clusterClass}">${count}</div>`,
            className: "custom-cluster-icon", // 공통 스타일 클래스
            color: "royalblue",
            iconSize: L.point(40, 40), // 기본 크기 설정
          });
        },
      });

      clusterFLOODING.forEach((marker) => {
        L.marker([marker.lat, marker.lon], { icon: createFLOODINGMarkerIcon() })
          .on("click", () => {
            //
            setSelectedFLOODING(marker); //
          })
          .addTo(clusterGroup3);
      });

      map.addLayer(clusterGroup3);

      return () => {
        map.removeLayer(clusterGroup3);
      };
    }
  }, [map, floodingState, clusterFLOODING]);

  //-----------------------------------
  // CCTV1 클러스터링
  //-----------------------------------
  useEffect(() => {
    if (map && CCTV01State) {
      const clusterGroup1 = L.markerClusterGroup({
        maxClusterRadius: 100, // 클러스터링 반경을 100미터로 설정 (값을 원하는 대로 조정)
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          let clusterClass = "marker-cluster-icon-small"; // 기본 아이콘 클래스

          if (count >= 10 && count < 50) {
            clusterClass = "marker-cluster-icon-medium";
          } else if (count >= 50) {
            clusterClass = "marker-cluster-icon-large";
          }

          return new L.DivIcon({
            html: `<div class="custom-cluster-icon ${clusterClass}">${count}</div>`,
            className: "custom-cluster-icon", // 공통 스타일 클래스
            iconSize: L.point(40, 40), // 기본 크기 설정
          });
        },
      });

      clusterCCTV1.forEach((marker) => {
        let yoloFlag = false;
        const newMaker = L.marker([marker.lat, marker.lon], {
          icon: createCCTV1MarkerIcon(),
        })

          .on("click", () => {
            setSelectedCCTV(marker);
          })
          .on("mouseover", (e) => {
            // 재난감지 구역확인
            for (const item of floodingData) {
              if (item.rtspAddr === marker.rtspAddr) {
                setYolo(newMaker);
                yoloFlag = true;

                break; // No need to continue once a match is found
              }
            }
            if (yoloFlag) {
              newMaker
                .bindPopup(
                  `<span style="padding:2px 2px;background-color:rgba(144, 43, 34, 0.7);color:white;">[객체탐지]</span>   ${marker.instlPos}`
                )
                .openPopup();
            } else {
              newMaker.bindPopup(`${marker.instlPos}`).openPopup();
            }
          })
          .on("mouseout", () => {
            newMaker.closePopup();
          })
          .addTo(clusterGroup1);

        // // 해당 마커와 매칭되는 폴리곤을 찾아 연결
        // cctv1Data.features.forEach((feature) => {
        //   if (feature.properties.name === marker.name) {
        //     polygonLayer = L.geoJSON(feature, {
        //       style: {
        //         fillColor: "blue",
        //         fillOpacity: 0.5,
        //         color: "blue",
        //         weight: 1,
        //       },
        //     }).addTo(map);

        //     // 폴리곤을 뒤로 보내기
        //     polygonLayer.bringToBack();
        //   }
        // });
      });

      map.addLayer(clusterGroup1);

      return () => {
        map.removeLayer(clusterGroup1);
      };
    }
  }, [map, CCTV01State, clusterCCTV1]);

  return (
    <div className="wrapper">
      <header>
        <div className="top-header">
          <div className="logo">
            <img src={`${process.env.PUBLIC_URL}/logo.jpg`} alt="Logo" />
          </div>
        </div>

        <div className="title">
          <span>부산</span> 침수위험 <span>AI</span> 예측 서비스 플랫폼
        </div>

        <nav style={{ border: "1px solid" }}>
          <ul>
            {/* 
            <li>메뉴1</li>
            <li>메뉴2</li>
            <li>메뉴3</li>
 */}

    
{/* 
    
            <li className="etc">
              <Link to="/logout">
                <span className="material-symbols-outlined">logout</span>
              </Link>
            </li>
  */}


          </ul>
        </nav>
      </header>

      <main>
        <div className="left">
          <div className="map-item">
            <div className="gaugeChart-block">
              <GaugeChart level={95} floodRiskInfo={floodRiskInfo} />
            </div>

            <div
              id="map"
              style={{ backgroundColor: "#393F4F", objectFit: "contain" }}
            ></div>

            {/*  */}
            {selectedShowMap && <ShowMap />}

            {/* CCTVPOPUP*/}
            {/* 재난감시 CCTV 팝업 */}
            {selectedCCTV && (
              <CCTVPopup
                lat={selectedCCTV.lat}
                lon={selectedCCTV.lon}
                hlsAddr={selectedCCTV.hlsAddr}
                rtspAddr={selectedCCTV.rtspAddr}
                instlPos={selectedCCTV.instlPos}
                onClose={() => setSelectedCCTV(null)}
              />
            )}
          </div>

          <div className="map-control-item">
            {/* 지도표시시 */}

            <div className="item" key="1">
              <Link
                onClick={(e) => {
                  setTileState(!tileState);
                }}
              >
                {tileState ? (
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#40FF00" }}
                  >
                    package_2
                  </span>
                ) : (
                  <span className="material-symbols-outlined">package_2</span>
                )}
              </Link>
            </div>

            {/* 경계구역표시 */}
            <div className="item" key="2">
              <Link
                onClick={(e) => {
                  setDisplayMap(!displayMap);
                }}
              >
                {displayMap ? (
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#40FF00" }}
                  >
                    package_2
                  </span>
                ) : (
                  <span className="material-symbols-outlined">package_2</span>
                )}
              </Link>
            </div>

            {/* 침수이미지 내수 setGeojsonLayerState */}

            <div className="item" key="3">
              <Link
                onClick={(e) => {
                  setGeojsonLayerState(!geojsonLayerState);
                }}
              >
                {geojsonLayerState ? (
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#40FF00" }}
                  >
                    package_2
                  </span>
                ) : (
                  <span className="material-symbols-outlined">package_2</span>
                )}
              </Link>
            </div>

            {/* 침수이미지 내수 setGeojsonLayerState */}

            {/* 
            <div className="item" key="4">
              <Link
                onClick={(e) => {
                  setGeojsonRiverLayerState(!geojsonRiverLayerState);
                }}
              >
                {geojsonRiverLayerState ? (
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#40FF00" }}
                  >
                    package_2
                  </span>
                ) : (
                  <span className="material-symbols-outlined">package_2</span>
                )}
              </Link>
            </div>
 */}

            {/* 침수이미지 내수  setGeojsonLayerState */}

            {/*                       
            <div className="item" key="5">
              <Link
                onClick={(e) => {
                  setFloodingState(!floodingState);
                }}
              >
                {floodingState ? (
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#40FF00" }}
                  >
                    package_2
                  </span>
                ) : (
                  <span className="material-symbols-outlined">package_2</span>
                )}
              </Link>
            </div>
            */}

            {/* 재난감시 CCTV   */}
            <div className="item" key="6">
              <Link
                onClick={(e) => {
                  setCCTV01State(!CCTV01State);
                }}
              >
                {CCTV01State ? (
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#40FF00" }}
                  >
                    package_2
                  </span>
                ) : (
                  <span className="material-symbols-outlined">package_2</span>
                )}
              </Link>
            </div>

            <div className="item" key="7">
              <FloodingMapOverlay
                map={map}
                //침수지도
                floodRiskInfo={floodRiskInfo}
                floodingImgState={floodingImgState}
                setFloodingImgState={setFloodingImgState}
                //FLOODING예측
                floodingState={floodingState}
                setFloodingState={setFloodingState}
              />
            </div>
          </div>

          {/* 날씨표시 */}
          <div className="weather-item">
            <div
              className="item title"
              style={{
                height: "100px",
                color: "white",
                fontSize: ".7rem",
                border: "0",
              }}
            >
              {todayLocation}
            </div>
            <div className="item" key="1">
              {/* T1H -기온,  PTY - 강수형태 */}
              {tileState && geojsonLayerState && todayWeather != null ? (
                <div>
                  {/* icon */}
                  <div className="icon">
                    <span
                      className="material-symbols-outlined icon"
                      style={{ color: "#40FF00" }}
                    >
                      {PTY_LIST[Number(todayWeather.item[0].obsrValue)].icon}
                    </span>
                  </div>
                  {/* data */}
                  <div className="obsrValue">
                    <span>
                      {PTY_LIST[Number(todayWeather.item[0].obsrValue)].text}
                    </span>
                    <span style={{ color: "gray" }}>|</span>
                    <span>{todayWeather.item[3].obsrValue} ℃</span>
                  </div>
                </div>
              ) : (
                <div>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#40FF00" }}
                  >
                    -
                  </span>
                  <div style={{ textAlign: "center", color: "white" }}>
                    <span>-</span> 
                  </div>
                </div>
              )}
            </div>
            <div className="item" key="2">
              {/* UUU - 동서바람성분 , VVV -남북바람성분  VEC- 풍향 ,WSD -풍속*/}
              {tileState && geojsonLayerState && todayWeather != null ? (
                <div>
                  {/* icon */}
                  <div className="icon">
                    <img
                      className="icon"
                      src={`${process.env.PUBLIC_URL}/images/weather/ic_wd_48x.png`}
                      alt="바람방향"
                      style={{
                        width: "45px",
                        height: "45px",
                        transform: `rotate(${todayWindDirectionInfo.angle}deg)`, // 각도에 따라 이미지 회전
                        backgroundColor: "#40FF00",
                        padding: "7px",
                        borderRadius: "35px",
                      }}
                    />
                  </div>
                  {/* data */}
                  <div>
                    <div className="obsrValue">
                      <span>{todayWeather.item[7].obsrValue} m/s</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#40FF00" }}
                  ></span>
                  <div style={{ textAlign: "center", color: "white" }}>
                    <span>-</span>
                  </div>
                </div>
              )}
            </div>

            <div className="item" key="3">
              {/* REH-습도  */}
              {tileState && geojsonLayerState && todayWeather != null ? (
                <div>
                  {/* icon */}
                  <div className="icon">
                    <span
                      className="material-symbols-outlined icon"
                      style={{
                        fontSize: "4rem",
                        color: "skyblue",
                        color: "white",
                      }}
                    >
                      humidity_low
                    </span>
                  </div>
                  {/* data */}
                  <div className="obsrValue">
                    <span>습도</span>
                    <span style={{ color: "gray" }}>|</span>
                    <span>{todayWeather.item[1].obsrValue} %</span>
                  </div>
                </div>
              ) : (
                <div>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#40FF00" }}
                  >
                    -
                  </span>
                  <div style={{ textAlign: "center", color: "white" }}>
                    <span>-</span> 
                  </div>
                </div>
              )}
            </div>

            <div className="item" key="4">
              {/* RN1 - 1시간 강수량   */}

              {tileState && geojsonLayerState && todayWeather != null ? (
                <div>
                  {/* icon */}
                  <div className="icon">
                    <span
                      className="material-symbols-outlined icon"
                      style={{
                        fontSize: "4rem",
                        color: "skyblue",
                        color: "white",
                      }}
                    >
                      umbrella
                    </span>
                  </div>
                  {/* data */}
                  <div>
                    <div className="obsrValue">
                      <span >강수량</span>
                      <span
                        style={{
                          color: "gray",
                        }}
                      >
                        |
                      </span>
                      <span >
                        {todayWeather.item[2].obsrValue} mm
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#40FF00" }}
                  >
                    -
                  </span>
                  <div style={{ textAlign: "center", color: "white" }}>
                    <span>-</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/*  */}

        {/*        
        <div className="right">
          <div className="videoBlock" style={{ overflow: "hidden" }}>
            {selectedFLOODING ? (
              <침수위험지역
                lat={selectedFLOODING.lat}
                lon={selectedFLOODING.lon}
                hlsAddr={selectedFLOODING.hlsAddr}
                instl_pos={selectedFLOODING.instl_pos}
                setSelectedFLOODING={setSelectedFLOODING}
              />
            ) : (
              <>
                <div style={{ color: "white" }} className="empty">
                  <span className="material-symbols-outlined">pause</span>
                </div>
              </>
            )}
          </div>
          
        
          <div>
            <div>
              <img src="" />
            </div>
          </div>
        </div>
         */}
      </main>
    </div>
  );
};

export default Home;
