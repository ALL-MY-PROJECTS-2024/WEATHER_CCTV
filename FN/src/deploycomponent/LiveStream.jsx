import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";

const LiveStream = ({ server, rtspAddr }) => {
  const [stream, setStream] = useState({ src: "", id: null });
  const mountedRef = useRef(true);

  const connectStream = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      const response = await axios.get(`${server}/stream-id`, {
        params: { rtspAddr: rtspAddr }
      });

      if (!mountedRef.current) return;

      const { streamId } = response.data;
      setStream({
        src: `${server}/stream/${streamId}?rtspAddr=${rtspAddr}&yolo=false`,
        id: streamId
      });
    } catch (error) {
      console.error("Stream connection error:", error);
      if (mountedRef.current) {
        setTimeout(connectStream, 3000);
      }
    }
  }, [server, rtspAddr]);

  useEffect(() => {
    mountedRef.current = true;
    connectStream();

    const keepAlive = setInterval(async () => {
      if (stream.id && mountedRef.current) {
        try {
          await axios.get(`${server}/stream/${stream.id}/ping`);
        } catch {
          connectStream();
        }
      }
    }, 5000);

    return () => {
      mountedRef.current = false;
      clearInterval(keepAlive);
      
      if (stream.id) {
        axios.post(`${server}/stop-stream`, { streamId: stream.id })
          .catch(err => console.error("Stream cleanup error:", err));
      }
    };
  }, [connectStream, server, stream.id]);

  return (
    <div className="item">
      <div className="head">실시간 영상</div>
      <div className="main">
        {stream.src ? (
          <img
            src={stream.src}
            alt="Live Stream"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={() => mountedRef.current && connectStream()}
          />
        ) : (
          <div className="loading-container">
            <div className="spinner-border text-light" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStream; 