import React from "react";
import { Handle } from "reactflow";

const CustomNode = ({ data }) => {
  // 노드 타입 확인
  const label = data?.label || "Unknown"; // 기본값 설정
  const nodeType = label.split(" ")[0]; // 타입 추출

  // 노드 스타일 정의
  const shapeStyles = {
    Router: {
      width: "60px",
      height: "60px",
      borderRadius: "50%", // 원형
      backgroundColor: "#00000",
    },
    Switch: {
      width: "100px",
      height: "40px",
      borderRadius: "8px", // 직사각형
      backgroundColor: "#00000",
    },
    PC: {
      width: "50px",
      height: "50px",
      borderRadius: "8px", // 정사각형
      backgroundColor: "#00000",
    },
    Default: {
      width: "100px",
      height: "50px",
      borderRadius: "0px",
      backgroundColor: "#e0e0e0",
    },
  };

  // 노드 스타일 선택
  const currentStyle = shapeStyles[nodeType] || shapeStyles.Default;

  return (
    <div
      style={{
        ...currentStyle,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid black",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        position: "relative",
      }}
    >
      {label}
      {/* Handle 설정 */}
      <Handle
        type="source"
        position="right"
        style={{
          width: "5px",
          height: "5px",
          backgroundColor: "transparent",
          border: "none",
          position: "absolute",
          right: "-5px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "auto",
        }}
      />
      <Handle
        type="target"
        position="left"
        style={{
          width: "5px",
          height: "5px",
          backgroundColor: "transparent",
          border: "none",
          position: "absolute",
          left: "-5px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "auto",
        }}
      />
    </div>
  );
};

export default CustomNode;
