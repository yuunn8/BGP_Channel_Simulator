import React, { useState, useEffect } from "react";
import { isNetworkOrBroadcastAddress } from "../utils/ipUtils"; // 함수 임포트

function PortIPSettingsPopup({ node, edges, onClose, onSave, onUpdateIpList }) {
  const [ports, setPorts] = useState({});
  const [ipList, setIpList] = useState([]);
  const [routerSettings, setRouterSettings] = useState({
    asNumber: "",
    neighbors: [], // 여러 Neighbor IP와 AS 번호를 배열로 관리
    networkIp: "", // 네트워크 광고를 위한 IP
    subnet: "", // 네트워크 광고를 위한 서브넷
    neighborAS: [], // Neighbor의 AS 번호 배열
  });
  const [pcSettings, setPcSettings] = useState({
    ip: "",
    subnet: "",
  });
  const [errors, setErrors] = useState({});

  // 초기값 설정 (포트 및 라우터 설정)
  useEffect(() => {
    if (!node) return;
  
    const updatedPorts = Object.keys(node.data.ports).reduce((acc, port) => {
      const isPortConnected = edges.some(
        (edge) =>
          (edge.source === node.id && edge.data.sourcePort === port) ||
          (edge.target === node.id && edge.data.targetPort === port)
      );
  
      acc[port] = {
        ip: isPortConnected ? (node.data.ports[port]?.ip || "").trim() : "",
        subnet: isPortConnected ? (node.data.ports[port]?.subnet || "").trim() : "",
      };
      return acc;
    }, {});
  
    setPorts(updatedPorts);
  
    const updatedIpList = Object.values(updatedPorts)
      .map((port) => port.ip)
      .filter((ip) => ip); // 빈 값 제거
  
    setIpList(updatedIpList);
    onUpdateIpList(updatedIpList); // 부모 컴포넌트에 리스트 전달

    // 라우터 설정 업데이트
    if (node.id.startsWith("Router")) {
      setRouterSettings({
        asNumber: node.data.asNumber || "",
        neighbors: node.data.neighbors || [],
        networkIp: node.data.networkIp || "",
        subnet: node.data.subnet || "",
        neighborAS: node.data.neighborAS || [],
      });
    }
  
    // PC 설정 업데이트
    if (node.id.startsWith("PC")) {
      setPcSettings({
        ip: node.data.ports.f0?.ip || "",
        subnet: node.data.ports.f0?.subnet || "",
      });
    }
  }, [node, edges, onUpdateIpList]);
  

  const connectedPorts = Object.keys(ports).filter((port) =>
    edges.some(
      (edge) =>
        (edge.source === node.id && edge.data.sourcePort === port) ||
        (edge.target === node.id && edge.data.targetPort === port)
    )
  );

  const handleRouterSettingChange = (field, value, index = null) => {
    setRouterSettings((prev) => {
      if (field === "neighbors") {
        const updatedNeighbors = [...prev.neighbors];
        if (index !== null) {
          updatedNeighbors[index] = value;
        } else {
          updatedNeighbors.push(value);
        }
        return { ...prev, neighbors: updatedNeighbors };
      } else if (field === "neighborAS") {
        const updatedNeighborAS = [...prev.neighborAS];
        if (index !== null) {
          updatedNeighborAS[index] = value;
        } else {
          updatedNeighborAS.push(value);
        }
        return { ...prev, neighborAS: updatedNeighborAS };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const handleRemoveNeighbor = (index) => {
  setRouterSettings((prev) => ({
    ...prev,
    neighbors: prev.neighbors.filter((_, idx) => idx !== index),
    neighborAS: prev.neighborAS.filter((_, idx) => idx !== index),
  }));
};


  const handleInputChange = (port, field, value) => {
    if (!connectedPorts.includes(port)) {
      return; // 포트가 연결되어 있지 않으면 입력 불가
    }
    setPorts((prev) => ({
      ...prev,
      [port]: {
        ...prev[port],
        [field]: value,
      },
    }));
  };

  const validateInputs = () => {
    const newErrors = {};

    // 라우터 설정이 완료되었는지 확인
    if (node.id.startsWith("Router")) {
      if (!routerSettings.asNumber.trim()) {
        newErrors.asNumber = "AS 번호를 입력해주세요.";
      }
      if (routerSettings.neighbors.length === 0) {
        newErrors.neighbor = "Neighbor IP를 입력해주세요.";
      }
      if (routerSettings.neighbors.some((neighbor, idx) => !routerSettings.neighborAS[idx]?.trim())) {
        newErrors.neighborAS = "각 Neighbor AS 번호를 입력해주세요.";
      }

      // 네트워크 광고 설정 확인
      if (!routerSettings.networkIp.trim()) {
        newErrors.networkIp = "네트워크 광고 IP를 입력해주세요.";
      }
      if (!routerSettings.subnet.trim()) {
        newErrors.subnet = "서브넷 마스크를 입력해주세요.";
      }
    }

    // PC 설정이 완료되었는지 확인
    if (node.id.startsWith("PC")) {
      if (!pcSettings.ip.trim()) {
        newErrors.pcIp = "PC의 IP 주소를 입력해주세요.";
      }
      if (!pcSettings.subnet.trim()) {
        newErrors.pcSubnet = "PC의 서브넷 마스크를 입력해주세요.";
      }

      // PC IP와 서브넷 마스크가 네트워크 IP나 브로드캐스트 IP일 경우 경고
      if (isNetworkOrBroadcastAddress(pcSettings.ip, pcSettings.subnet)) {
        newErrors.pcIp = "입력된 IP는 네트워크 주소나 브로드캐스트 주소일 수 없습니다.";
      }
    }

    // 포트에 대한 IP와 서브넷 마스크가 채워졌는지 확인
    Object.entries(ports).forEach(([port, { ip, subnet }]) => {
      if (!ip.trim()) {
        newErrors[port] = `${port}의 IP를 입력해주세요.`;
      }
      if (!subnet.trim()) {
        newErrors[port] = `${port}의 서브넷 마스크를 입력해주세요.`;
      }

      // IP가 네트워크 주소나 브로드캐스트 주소인 경우
      if (isNetworkOrBroadcastAddress(ip, subnet)) {
        newErrors[port] = `${port}의 입력된 IP는 네트워크 주소나 브로드캐스트 주소일 수 없습니다.`;
      }
    });

    // 모든 오류가 없으면 유효성 검사 통과
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  

  // 저장 버튼 클릭 시
  const handleSave = () => {
    const updatedIpList = Object.values(ports)
    .map((port) => port.ip.trim()) // 공백 제거
    .filter(Boolean); // 유효한 IP만 포함

  if (updatedIpList.length > 0) {
    onUpdateIpList(updatedIpList); // 부모 컴포넌트에 리스트 전달
  }

  // 기존 저장 로직 유지
  const updatedPorts = Object.keys(ports).reduce((acc, port) => {
    acc[port] = {
      ip: ports[port].ip.trim(),
      subnet: ports[port].subnet.trim(),
    };
    return acc;
  }, {});

    // 라우터 또는 PC 데이터 처리
    const updatedRouterSettings = node.id.startsWith("Router")
      ? {
          asNumber: routerSettings.asNumber,
          neighbors: routerSettings.neighbors,
          neighborAS: routerSettings.neighborAS,
          networkIp: routerSettings.networkIp,
          subnet: routerSettings.subnet,
        }
      : null;
  
    const updatedPcSettings = node.id.startsWith("PC")
      ? {
          ip: pcSettings.ip.trim(),
          subnet: pcSettings.subnet.trim(),
        }
      : null;
  
    onSave(node.id, updatedPorts, updatedRouterSettings, updatedPcSettings, routerSettings, pcSettings);
  
    onClose(); // 팝업 닫기
  };
  


  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "20px",
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "12px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        zIndex: 10,
        width: "400px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
        {node.id.startsWith("Router") ? "IP 및 라우터 설정" : "IP 설정"} ({node.data.label})
      </h3>

      {connectedPorts.length > 0 ? (
        <>
          {connectedPorts.map((port) => (
            <div key={port} style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                {port}:
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="IP 주소"
                  value={ports[port]?.ip || ""}
                  onChange={(e) => handleInputChange(port, "ip", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: errors[port] ? "1px solid red" : "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
                <input
                  type="text"
                  placeholder="서브넷 마스크"
                  value={ports[port]?.subnet || ""}
                  onChange={(e) => handleInputChange(port, "subnet", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: errors[port] ? "1px solid red" : "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>
              {errors[port] && <p style={{ color: "red", marginTop: "5px" }}>{errors[port]}</p>}
            </div>
          ))}

          {node.id.startsWith("Router") && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>AS 번호:</label>
                <input
                  type="text"
                  value={routerSettings.asNumber}
                  onChange={(e) => handleRouterSettingChange("asNumber", e.target.value)} // AS 번호 수정 처리
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
                {errors.asNumber && <p style={{ color: "red" }}>{errors.asNumber}</p>}
              </div>

              {/* Neighbor 설정 */}
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Neighbor:</label>
                {routerSettings.neighbors.map((neighbor, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <input
                      type="text"
                      value={neighbor}
                      onChange={(e) => handleRouterSettingChange("neighbors", e.target.value, index)}
                      placeholder="Neighbor IP"
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    />
                    <input
                      type="text"
                      value={routerSettings.neighborAS[index] || ""}
                      onChange={(e) => handleRouterSettingChange("neighborAS", e.target.value, index)}
                      placeholder="Neighbor AS"
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    />
                    <button
                      onClick={() => handleRemoveNeighbor(index)}
                      style={{
                        background: "#333",  // 검정색 배경
                        border: "none",
                        color: "white",
                        padding: "8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
    onClick={() => handleRouterSettingChange("neighbors", "")}
    style={{
        background: "black",
        border: "none",
        color: "white",
        padding: "8px 136px",
        borderRadius: "4px",
        cursor: "pointer",
        marginTop: "10px",
    }}
>
    Neighbor 추가
</button>
              </div>

              {/* 네트워크 광고 설정을 한 줄로 변경 */}
              <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
    <div style={{ width: "50%" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>네트워크 광고:</label>
        <input
            type="text"
            value={routerSettings.networkIp}
            onChange={(e) => handleRouterSettingChange("networkIp", e.target.value)}
            placeholder="IP 주소"
            style={{
                width: "100%",
                padding: "8px",
                border: errors.networkIp ? "1px solid red" : "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
            }}
        />
        {errors.networkIp && <p style={{ color: "red" }}>{errors.networkIp}</p>}
    </div>
    <div style={{ width: "50%" }}>
        <input
            type="text"
            value={routerSettings.subnet}
            onChange={(e) => handleRouterSettingChange("subnet", e.target.value)}
            placeholder="서브넷 마스크"
            style={{
                width: "100%",
                padding: "8px",
                border: errors.subnet ? "1px solid red" : "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                marginTop: "26px",
            }}
        />
        {errors.subnet && <p style={{ color: "red" }}>{errors.subnet}</p>}
        
    </div>
</div>

            </div>
          )}
        </>
      ) : (
        <p>이 포트는 네트워크에 연결되지 않았습니다.</p>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            backgroundColor: "black",
            border: "none",
            color: "white",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          저장
        </button>
        <button
          onClick={onClose}
          style={{
            padding: "10px 20px",
            backgroundColor: "gray",
            border: "none",
            color: "white",
            cursor: "pointer",
            borderRadius: "4px",
            marginLeft: "10px",
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default PortIPSettingsPopup;
