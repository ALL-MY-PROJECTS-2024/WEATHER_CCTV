import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";

const LiveStream = ({ server, rtspAddr }) => {
  const [streamSrc, setStreamSrc] = useState("");
  const streamIdRef = useRef(null);
  const mountedRef = useRef(true);

  const initializeStream = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      // 1. 먼저 스트림 ID를 얻습니다
      const response = await axios.get(`${server}/stream-id`, {
        params: { rtspAddr }
      });

      if (!mountedRef.current) return;

      const { streamId } = response.data;
      streamIdRef.current = streamId;

      // 2. 스트림 소스 URL을 설정합니다
      setStreamSrc(`${server}/stream/${streamId}?rtspAddr=${rtspAddr}&yolo=false`);
    } catch (error) {
      console.error("Stream initialization error:", error);
      if (mountedRef.current) {
        setTimeout(initializeStream, 3000);
      }
    }
  }, [server, rtspAddr]);

  useEffect(() => {
    mountedRef.current = true;
    initializeStream();

    return () => {
      mountedRef.current = false;
      
      // 컴포넌트 언마운트 시 스트림 정리
      if (streamIdRef.current) {
        axios.post(`${server}/stop-stream`, {
          streamId: streamIdRef.current
        }).catch(err => console.error("Error stopping stream:", err));
      }
    };
  }, [initializeStream]);

  const handleImageError = useCallback(() => {
    if (!mountedRef.current) return;
    console.log("Stream image error, retrying...");
    initializeStream();
  }, [initializeStream]);

  return (
    <div className="item">
      <div className="head">실시간 영상</div>
      <div className="main">
        {!streamSrc ? (
          <div className="loading-container">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">영상 로딩중...</span>
            </div>
          </div>
        ) : (
          <img
            src={streamSrc}
            alt="Live Stream"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
            onError={handleImageError}
          />
        )}
      </div>
    </div>
  );
};

export default LiveStream; 