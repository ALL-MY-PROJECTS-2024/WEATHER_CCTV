import React, { useState, useEffect } from "react";
import LiveStream from "./LiveStream";
import PredictionImage from "./PredictionImage";
import "./CCTVPopup.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const CCTVPopup = ({ lat, lon, hlsAddr, onClose, rtspAddr, instlPos }) => {
  const [server] = useState("/api");
  const [date, setDate] = useState(null);
  const [hour, setHour] = useState(null);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);

  useEffect(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);
    
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const hourStr = String(currentDate.getHours()).padStart(2, "0") + "00";
    
    setDate(`${year}${month}${day}`);
    setHour(hourStr);
  }, []);

  useEffect(() => {
    const timers = [
      { setter: setShow1, delay: 3000 },
      { setter: setShow2, delay: 6000 },
      { setter: setShow3, delay: 9000 }
    ];

    const timeoutIds = timers.map(({ setter, delay }) =>
      setTimeout(() => setter(true), delay)
    );

    return () => timeoutIds.forEach(clearTimeout);
  }, []);

  return (
    <div className="cctv-popup-overlay">
      <div className="cctv-popup">
        <div className="title">
          <span>{instlPos}</span>
          <button onClick={onClose} className="close-btn">X</button>
        </div>
        <div className="body">
          <LiveStream server={server} rtspAddr={rtspAddr} />
          <PredictionImage 
            title="15분 이후 예측 이미지"
            instlPos={instlPos}
            date={date}
            hour={hour}
            minute="00"
            apiNumber={2}
            show={show1}
          />
          <PredictionImage 
            title="30분 이후 예측 이미지"
            instlPos={instlPos}
            date={date}
            hour={hour}
            minute="30"
            apiNumber={3}
            show={show2}
          />
          <PredictionImage 
            title="60분 이후 예측 이미지"
            instlPos={instlPos}
            date={date}
            hour={hour}
            minute="60"
            apiNumber={4}
            show={show3}
          />
        </div>
      </div>
    </div>
  );
};

export default CCTVPopup;
