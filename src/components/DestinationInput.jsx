import React, { useState, useEffect } from "react";

function IpInput({ validIps, onSetSource, onSetDestination }) {
  const [sourceIp, setSourceIp] = useState("");
  const [destinationIp, setDestinationIp] = useState("");
  const [sourceMessage, setSourceMessage] = useState("");
  const [destinationMessage, setDestinationMessage] = useState("");

  useEffect(() => {
    setSourceMessage(""); // IP 입력이 변경될 때마다 메시지를 초기화
  }, [sourceIp]);

  useEffect(() => {
    setDestinationMessage(""); // IP 입력이 변경될 때마다 메시지를 초기화
  }, [destinationIp]);

  const handleSourceChange = (e) => {
    setSourceIp(e.target.value);
  };

  const handleDestinationChange = (e) => {
    setDestinationIp(e.target.value);
  };

  const handleSourceSubmit = (e) => {
    e.preventDefault();
    if (validIps.includes(sourceIp)) {
      setSourceMessage("출발지 IP 설정이 완료되었습니다.");
      onSetSource(sourceIp);
    } else {
      setSourceMessage("입력한 IP는 유효하지 않습니다.");
    }
  };

  const handleDestinationSubmit = (e) => {
    e.preventDefault();
    if (validIps.includes(destinationIp)) {
      setDestinationMessage("목적지 IP 설정이 완료되었습니다.");
      onSetDestination(destinationIp);
    } else {
      setDestinationMessage("입력한 IP는 유효하지 않습니다.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
      {/* 출발지 IP 입력 */}
      <form onSubmit={handleSourceSubmit} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="text"
          value={sourceIp}
          onChange={handleSourceChange}
          placeholder="출발지 IP를 입력하세요."
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "white",
            cursor: "text",
          }}
        />
        <button
          type="submit"
          disabled={!sourceIp.trim()}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          출발지 설정
        </button>
      </form>
      {sourceMessage && <p style={{ color: "green" }}>{sourceMessage}</p>} {/* 출발지 설정 완료 메시지 */}

      {/* 목적지 IP 입력 */}
      <form onSubmit={handleDestinationSubmit} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="text"
          value={destinationIp}
          onChange={handleDestinationChange}
          placeholder="목적지 IP를 입력하세요."
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "white",
            cursor: "text",
          }}
        />
        <button
          type="submit"
          disabled={!destinationIp.trim()}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          목적지 설정
        </button>
      </form>
      {destinationMessage && <p style={{ color: "green" }}>{destinationMessage}</p>} {/* 목적지 설정 완료 메시지 */}
    </div>
  );
}

export default IpInput;
