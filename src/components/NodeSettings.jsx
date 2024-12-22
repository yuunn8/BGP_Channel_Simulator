import React, { useState } from "react";

function NodeSettings({ selectedNode, onClose, onSave }) {
  const [ip, setIp] = useState(selectedNode?.data?.ip || "");
  const [asNumber, setAsNumber] = useState(selectedNode?.data?.asNumber || ""); // AS 번호 상태
  const [neighbors, setNeighbors] = useState(selectedNode?.data?.neighbors || []); // Neighbor IP 배열 상태
  const [networkIp, setNetworkIp] = useState(selectedNode?.data?.networkIp || ""); // Network IP 상태
  const [mask, setNetworkSubnet] = useState(selectedNode?.data?.networkSubnet || ""); // Mask 상태

  const handleAddNeighbor = () => {
    setNeighbors([...neighbors, { ip: "", asNumber: "" }]);
  };

  const handleNeighborChange = (index, field, value) => {
    const newNeighbors = [...neighbors];
    newNeighbors[index][field] = value;
    setNeighbors(newNeighbors);
  };

  const handleSave = () => {
    onSave({
      ...selectedNode,
      data: {
        ip,
        asNumber,
        neighbors,
        networkIp,
        networkSubnet
      },
    });
  };

  if (!selectedNode) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        zIndex: 1000,
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        minWidth: "300px", // 창 크기 최소값 설정
      }}
    >
      <h3>Node 설정</h3>
      <p>장비: {selectedNode?.data?.label}</p>

      <div style={{ marginBottom: "10px" }}>
        <label>IP 주소</label>
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="IP 입력"
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>AS 번호</label>
        <input
          type="text"
          value={asNumber}
          onChange={(e) => setAsNumber(e.target.value)}
          placeholder="AS 번호 입력"
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Neighbor IPs</label>
        {neighbors.map((neighbor, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <input
              type="text"
              value={neighbor.ip}
              onChange={(e) => handleNeighborChange(index, "ip", e.target.value)}
              placeholder={`Neighbor ${index + 1} IP`}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <input
              type="text"
              value={neighbor.asNumber}
              onChange={(e) => handleNeighborChange(index, "asNumber", e.target.value)}
              placeholder={`Neighbor ${index + 1} AS Number`}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
        ))}
        <button
          onClick={handleAddNeighbor}
          style={{
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Add Neighbor
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Network IP</label>
        <input
          type="text"
          value={networkIp}
          onChange={(e) => setNetworkIp(e.target.value)}
          placeholder="Network IP 입력"
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>Mask</label>
        <input
          type="text"
          value={mask}
          onChange={(e) => setNetworkSubnet(e.target.value)}
          placeholder="Mask 입력"
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={handleSave}
          style={{
            backgroundColor: "blue",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          저장
        </button>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export default NodeSettings;
