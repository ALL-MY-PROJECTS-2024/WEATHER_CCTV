import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";

const PredictionImage = ({ title, instlPos, date, hour, minute, apiNumber, show }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  const loadImage = useCallback(async () => {
    if (!show || retryCount.current >= MAX_RETRIES) return;
    
    setLoading(true);
    setError(false);

    try {
      const response = await axios.get(
        `/api${apiNumber}/get_frame${apiNumber}`,
        {
          params: {
            instl_pos: instlPos,
            date_folder: date,
            hour_folder: hour,
            minute: minute,
            frame_time: 2.5
          },
          responseType: 'blob'
        }
      );

      const imageUrl = URL.createObjectURL(response.data);
      setLoading(false);
      return imageUrl;
    } catch (error) {
      console.error(`Prediction image ${apiNumber} error:`, error);
      setError(true);
      setLoading(false);
      retryCount.current += 1;
      
      if (retryCount.current < MAX_RETRIES) {
        setTimeout(loadImage, 3000);
      }
    }
  }, [show, apiNumber, instlPos, date, hour, minute]);

  useEffect(() => {
    if (show) {
      loadImage();
    }
    return () => {
      retryCount.current = 0;
    };
  }, [show, loadImage]);

  return (
    <div className="item">
      <div className="head">{title}</div>
      <div className="main">
        {loading ? (
          <div className="loading-container">
            <div className="spinner-border text-light" />
            <div>이미지 로딩중...</div>
          </div>
        ) : error ? (
          <div className="error-container">
            <div>이미지를 불러올 수 없습니다.</div>
            {retryCount.current < MAX_RETRIES && (
              <div>재시도 중... ({retryCount.current}/{MAX_RETRIES})</div>
            )}
          </div>
        ) : (
          <img
            src={`/api${apiNumber}/get_frame${apiNumber}?instl_pos=${instlPos}&date_folder=${date}&hour_folder=${hour}&minute=${minute}&frame_time=2.5`}
            alt={title}
            style={{ width: '100%', height: '70%', objectFit: 'cover' }}
            onError={() => setError(true)}
          />
        )}
      </div>
    </div>
  );
};

export default PredictionImage; 