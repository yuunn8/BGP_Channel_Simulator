import React, { useState } from "react";

function PortSelectionPopup({ node, isSource, onClose, onSave }) {
  const [selectedPort, setSelectedPort] = useState(null);

  // 사용 가능한 포트만 필터링
  const availablePorts = Object.keys(node.data.ports).filter(
    (port) => node.data.ports[port] !== "in-use" // 'in-use'가 아닌 포트만 선택 가능
  );

  const handleSave = () => {
    if (selectedPort) {
      // 선택된 포트를 'in-use' 상태로 업데이트
      const updatedPorts = { ...node.data.ports, [selectedPort]: "in-use" };

      // 부모 컴포넌트로 선택된 포트와 업데이트된 포트 상태 전달
      onSave(selectedPort, updatedPorts);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "20px",
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        zIndex: 10,
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // 그림자 추가
        minWidth: "300px", // 최소 너비 설정
      }}
    >
      <h3>{isSource ? "출발 포트" : "도착 포트"}</h3>
      <div>
        {availablePorts.length > 0 ? (
          availablePorts.map((port) => (
            <div key={port} style={{ marginBottom: "10px" }}>
              <label>
                <input
                  type="radio"
                  name="port"
                  value={port}
                  onChange={() => setSelectedPort(port)}
                  style={{ marginRight: "10px" }} // 간격 조정
                />
                {port}
              </label>
            </div>
          ))
        ) : (
          <p style={{ color: "gray" }}>사용 가능한 포트가 없습니다.</p>
        )}
      </div>

      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <button
          onClick={onClose}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f5f5f5",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
            transition: "background-color 0.2s",
          }}
        >
          취소
        </button>
        <button
          onClick={handleSave}
          disabled={!selectedPort}
          style={{
            padding: "8px 16px",
            backgroundColor: selectedPort ? "black" : "#ddd", // 선택된 포트가 있으면 활성화
            color: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: selectedPort ? "pointer" : "not-allowed",
            transition: "background-color 0.2s",
          }}
        >
          저장
        </button>
      </div>
    </div>
  );
}

export default PortSelectionPopup;
