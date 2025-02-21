import React, { useState, useEffect } from "react";
import axios from "axios";

import "./CCTVPopup.scss";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS import
import floodingData from "../dataSet/FLOODING.json";

import flooding from "../dataSet/FLOODING.json";

const CCTVPopup = ({ lat, lon, hlsAddr, onClose, rtspAddr, instlPos }) => {
  const [streamSrc, setStreamSrc] = useState("");
  const [yolo,setYolo] = useState(false)
  const [streamId, setStreamId] = useState(""); // Added to manage streamId
  
  // const [server] = useState("http://localhost");
  // const [server] = useState("http://43.200.90.76");
    
  //docker 용 http://flask-opencv-container
  const [server] = useState("/api");



  const [r1 , setR1] = useState()
  const [r2 , setR2] = useState()
  const [r3 , setR3] = useState()
  const [show1 , setShow1] = useState(false)
  const [show2 , setShow2] = useState(false)
  const [show3 , setShow3] = useState(false)
  
  //
  const [date,setDate] = useState(null)
  const [hour,setHour] = useState(null)
  
  useEffect(() => {
    // Fetch the stream ID when the component mounts
    const fetchStreamId = async () => {
      let yoloFlag = false;
      for (const item of floodingData) {
        if (item.rtspAddr === rtspAddr) {
          yoloFlag = true;
          break; // No need to continue once a match is found
        }
      }
      // setYolo(yoloFlag);
      setYolo(false);
      yoloFlag=false;

      try {
        const response = await axios.get(`${server}/stream-id`, {
          params: { rtspAddr: rtspAddr },
        });
        const { streamId } = response.data;
        setStreamId(streamId);
        setStreamSrc(
          `${server}/stream/${streamId}?rtspAddr=${rtspAddr}&yolo=${yoloFlag}`
          // 
        );
      } catch (error) {
        console.error("Failed to fetch stream ID:", error);
      }
    };

    fetchStreamId();
  }, []);

  //
  useEffect(() => {
    const fetchVideoFile = async () => {
      // 비디오 파일 경로를 요청하여 첫 번째 비디오 파일을 받아옴
      try {
        // 현재 날짜를 "YYYYMMDD" 형식으로 계산
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 1); 

        const year = currentDate.getFullYear(); // 연도 (예: 2024)
        const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // 월 (01~12)
        const day = String(currentDate.getDate()).padStart(2, "0"); // 일 (01~31)
        const hourStr = String(currentDate.getHours()).padStart(2, "0") + "00";
        const dateStr = `${year}${month}${day}`; // "20241222" 형태로 날짜 생성
        
        setDate(dateStr);
        setHour(hourStr)
        

      } catch (error) {
        console.error("Failed to fetch video files:", error);
      }
    };
    
    fetchVideoFile();
   
  }, [rtspAddr, instlPos]);

  // 
  useEffect(()=>{
    const random1 = Math.floor(Math.random() * 3) + 1;
    const random2 = Math.floor(Math.random() * 4) + 3;
    const random3 = Math.floor(Math.random() * 4) + 9;

    setR1(random1)
    setR2(random2)
    setR3(random3)

    console.log(random1,random2,random3)
  },[])

  // 
  useEffect(()=>{
    // setTimeout으로 랜덤 시간 후에 비디오를 띄운다
    const timer = setTimeout(() => {
      
      setShow1(true);
      console.log("!");
    }, r1*1000);
    
    // 컴포넌트 언마운트 시 타이머 클리어
    return () => clearTimeout(timer);    

  })
  useEffect( ()=>{
    // setTimeout으로 랜덤 시간 후에 비디오를 띄운다
    const timer =  setTimeout(() => {
      setShow2(true);
      console.log("!!");
    }, r2*1000);

    // 컴포넌트 언마운트 시 타이머 클리어
    return () => clearTimeout(timer);    

  })
  useEffect(()=>{
    // setTimeout으로 랜덤 시간 후에 비디오를 띄운다
    const timer = setTimeout(() => {

      setShow3(true);
      console.log("!!!");

    }, r3*1000);

    // 컴포넌트 언마운트 시 타이머 클리어
    return () => clearTimeout(timer);    

  })


  const closeHandler = async () => {
    // Stop the stream using the stream ID
    try {
      if (streamId) {
        await axios.post(`${server}/stop-stream`, { streamId });
        console.log("Stream stopped successfully");
      }
      onClose(); // Close the popup
    } catch (error) {
      console.error("Failed to stop stream:", error);
    }
  };

  return (
    <div className="cctv-popup-overlay">
      <div className="cctv-popup">
        <div className="title">
          <span style={{ color: "white", fontSize: "1.5rem" }}>{instlPos}</span>
          <button onClick={closeHandler} className="close-btn">
            X
          </button>
        </div>

        {/* 스트리밍 이미지를 계속 표시하거나 다른 내용을 그대로 유지 */}
        <div className="body">
          {/*  */}
          <div className="item">
            <div className="head">{"실시간 영상"}</div>
            <div className="main">
              {streamSrc && (
                <img
                  src={streamSrc}
                  alt="Streaming Video"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
          </div>

          {/*  */}
          <div className="item">
            <div className="head">{"15분 이후 예측 이미지"}</div>
            <div className="main">
              {/* 여기 c:\video\ instlPos 폴더안에 20241222 안의 첫번째폴더안의 비디오를 출력 */}
             
             {show1==true?
             (<>
             <img 
                src={`/api2/get_frame2?instl_pos=${instlPos}&date_folder=${date}&hour_folder=${hour}&minute=00&frame_time=2.5`}
                alt="Frame Image"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                }} />
             </>)
             :
             (
             
              <div style={{height:"100%",display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
              <div class="spinner-border text-light" role="status">
                  <span class="visually-hidden">FRAME 수집중입니다..</span>
              </div>
              <div style={{color:"white",width:"200px",textAlign:"center"}}>FRAME 수집중입니다...</div>
              </div>
            
            )}

            </div>
          </div>
          {/*  */}
          <div className="item">
            <div className="head">{"30분 이후 예측 이미지"}</div>
            <div className="main">
              
              {show2?
              (<>
                <img 
                    src={`/api3/get_frame3?instl_pos=${instlPos}&date_folder=${date}&hour_folder=${hour}&minute=30&frame_time=2.5`}
                    alt="Frame Image"
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                    }} />
              
              </>)
              :
              (
              
                <div style={{height:"100%",display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
                    <div class="spinner-border text-light" role="status">
                        <span class="visually-hidden">FRAME 수집중입니다..</span>
                    </div>
                    <div style={{color:"white",width:"200px",textAlign:"center"}}>FRAME 수집중입니다...</div>
                </div>
            
            )}


            </div>
          </div>

          {/*  */}
          <div className="item">
            <div className="head">{"60분 이후 예측 이미지"}</div>
            <div className="main">
                
              {show3?
                (<>
                    <img 
                    src={`/api4/get_frame4?instl_pos=${instlPos}&date_folder=${date}&hour_folder=${hour}&minute=60&frame_time=2.5`}
                    alt="Frame Image"
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                    }} />
                
                </>)
                :
                (
                <div style={{height:"100%",display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
                    <div class="spinner-border text-light" role="status">
                        <span class="visually-hidden">FRAME 수집중입니다..</span>
                    </div>
                    <div style={{color:"white",width:"200px",textAlign:"center"}}>FRAME 수집중입니다...</div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CCTVPopup;