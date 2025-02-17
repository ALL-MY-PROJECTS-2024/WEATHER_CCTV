import React, { useRef, useEffect } from 'react';
import "./GaugeChart.scss";

const GaugeChart = ({ floodRiskInfo }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 30;
    const radius = 100;
    const innerRadius = 60;
    const fontFamily = 'Pretendard, Arial, sans-serif';

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sections = [
      { color: 'rgba(255, 99, 71, 1)', text: '위험', startAngle: -Math.PI, endAngle: -0.75 * Math.PI },
      { color: 'rgba(255, 193, 7, 1)', text: '경계', startAngle: -0.75 * Math.PI, endAngle: -0.5 * Math.PI },
      { color: 'rgba(75, 0, 130, 1)', text: '주의', startAngle: -0.5 * Math.PI, endAngle: -0.25 * Math.PI },
      { color: 'rgba(76, 175, 80, 1)', text: '안전', startAngle: -0.25 * Math.PI, endAngle: 0 },
    ];

    const riskAngleMap = {
      '위험': -0.875 * Math.PI,
      '경계': -0.625 * Math.PI,
      '주의': -0.375 * Math.PI,
      '안전': -0.125 * Math.PI,
    };
    const targetAngle = riskAngleMap[floodRiskInfo?.info] || riskAngleMap[floodRiskInfo?.info];
    
    let currentAngle = -Math.PI;
    const step = (targetAngle - currentAngle) / 10;

    const animateNeedle = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sections.forEach(({ color, text, startAngle, endAngle }) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        const angle = (startAngle + endAngle) / 2;
        const textX = centerX + (radius + innerRadius) / 2 * Math.cos(angle);
        const textY = centerY + (radius + innerRadius) / 2 * Math.sin(angle);

        ctx.fillStyle = 'white';
        ctx.font = `12px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, textX, textY);
      });

      const needleColor = sections.find(s => s.startAngle <= currentAngle && currentAngle < s.endAngle)?.color || 'gray';

      const needleLength = innerRadius + 3;
      const needleWidth = 10;

      ctx.beginPath();
      ctx.moveTo(
        centerX + needleWidth * Math.cos(currentAngle + Math.PI / 2),
        centerY + needleWidth * Math.sin(currentAngle + Math.PI / 2)
      );
      ctx.lineTo(
        centerX + needleLength * Math.cos(currentAngle),
        centerY + needleLength * Math.sin(currentAngle)
      );
      ctx.lineTo(
        centerX + needleWidth * Math.cos(currentAngle - Math.PI / 2),
        centerY + needleWidth * Math.sin(currentAngle - Math.PI / 2)
      );
      ctx.closePath();
      ctx.fillStyle = needleColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
      ctx.fillStyle = needleColor;
      ctx.fill();

      if (Math.abs(currentAngle - targetAngle) > 0.01) {
        currentAngle += step;
        requestAnimationFrame(animateNeedle);
      }
    };

    animateNeedle();
  }, [floodRiskInfo]);

  const getMessageByRiskLevel = (floodRiskInfo) => {
    if (!floodRiskInfo || !floodRiskInfo.info) return '';
    
    switch(floodRiskInfo.info) {
      case '위험':
        return '경고: 현재 매우 위험한 침수 상황입니다.';
      case '경계':
        return '주의: 현재 경계가 필요한 침수 수준입니다.';
      case '주의':
        return '유의: 현재 침수 가능성이 있는 상태입니다.';
      case '안전':
        return '안전: 현재 침수 위험이 없습니다.';
      default:
        return '';
    }
  };

  return (
    <div style={{ textAlign: 'center', backgroundColor: "white", borderRadius: "5px" }}>
      <div className="title" style={{fontWeight:"800", padding: "20px 10px", textAlign: "left", display: "flex", justifyContent: "left", alignItems: "center", height: "35px",fontSize:"1.3rem" }}>
        <img src="https://safecity.busan.go.kr/vue/img/ico-falv.47714d6f.svg" alt="icon" />
        &nbsp;도시 침수 위험 상태
      </div>
      <div style={{ padding: "0 5px", height: "2px", borderBottom: "1px solid gray", width: "90%", backgroundColor: "gray",margin:"0 auto" }}></div>
      <div style={{fontSize:"1.1rem",marginTop:"10px",fontWeight:"600"}}>
        { floodRiskInfo && (
          <>
            {floodRiskInfo.Dong || ''}  
            &nbsp;
            {floodRiskInfo.Gu ? "|" : ""}  
            &nbsp;
            {floodRiskInfo.Gu || ''} 
          </>
        )}
      </div>
      <canvas ref={canvasRef} width="250" height="140" />
      <p style={{ color: 'black', fontSize: '11px', fontWeight: "400", fontFamily: 'Pretendard-Regular', position: "relative", top: "-15px" }}>
        {getMessageByRiskLevel(floodRiskInfo)}
      </p>
    </div>
  );
};

export default GaugeChart;
