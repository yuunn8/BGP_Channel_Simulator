import React, { useState } from "react";
import NavigationBar from "./components/NavigationBar";
import TopologyCanvas from "./components/TopologyCanvas";
import PortIPSettingsPopup from "./components/PortIPSettingsPopup";

function App({
  validIps,
  onSetSource,
  onSetDestination,
}) {
  const [selectedNodeType, setSelectedNodeType] = useState(null); // 노드 타입
  const [selectedEdgeType, setSelectedEdgeType] = useState(null); // 간선 타입
  const [deleteMode, setDeleteMode] = useState(false); // 삭제 모드
  const [destination, setDestination] = useState(""); // 목적지 IP 상태
  const [paths, setPaths] = useState([]); // 경로 상태
  const [sourceIp, setSourceIp] = useState(""); // 출발지 IP 상태
  const [isRouteCalculated, setIsRouteCalculated] = useState(false); // 경로 계산 완료 여부 상태
  const [isReadyForRouting, setIsReadyForRouting] = useState(false);
  const [ipList, setIpList] = useState([]); // IP 목록 상태 관리
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 팝업 열기 상태 관리
  const [destinationIp, setDestinationIp] = useState(""); // 목적지 IP 상태
  const [portIpList, setPortIpList] = useState([]); // 포트별 IP 리스트
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedNode, setSelectedNode] = useState(null); // 선택된 노드
  const [edges, setEdges] = useState([]); // 간선 데이터
  const [sourceMessage, setSourceMessage] = useState("");
const [destinationMessage, setDestinationMessage] = useState("");
const [sourceError, setSourceError] = useState(""); // 출발지 에러 메시지
const [sourceSuccess, setSourceSuccess] = useState(""); // 출발지 성공 메시지
const [destinationError, setDestinationError] = useState(""); // 목적지 에러 메시지
const [destinationSuccess, setDestinationSuccess] = useState(""); // 목적지 성공 메시지


  // PortIPSettingsPopup에서 받은 포트별 IP 리스트 업데이트 
  const handlePortIpUpdate = (newIpList) => {
    if (JSON.stringify(portIpList) !== JSON.stringify(newIpList)) {
      console.log("Updated IP List:", newIpList);
      setPortIpList(newIpList); // 최신 리스트로 갱신
    }
  };  
  
  const handleSetSource = (e) => {
    e.preventDefault();
    const trimmedSourceIp = sourceIp.trim(); // 공백 제거
    if (portIpList.includes(trimmedSourceIp)) {
      setSourceSuccess("출발지 IP 설정이 성공적으로 완료되었습니다.");
      setSourceError(""); // 에러 메시지 초기화
    } else {
      setSourceError("출발지 IP가 토폴로지에 없습니다. 다시 입력해주세요.");
      setSourceSuccess(""); // 성공 메시지 초기화
    }
  };
  
  const handleSetDestination = (e) => {
    e.preventDefault();
    const trimmedDestinationIp = destinationIp.trim(); // 공백 제거
    if (portIpList.includes(trimmedDestinationIp)) {
      setDestinationSuccess("목적지 IP 설정이 성공적으로 완료되었습니다.");
      setDestinationError(""); // 에러 메시지 초기화
    } else {
      setDestinationError("목적지 IP가 토폴로지에 없습니다. 다시 입력해주세요.");
      setDestinationSuccess(""); // 성공 메시지 초기화
    }
  };
  
  

// 경로 계산 버튼 활성화 조건
const isRouteCalculationReady =
  sourceIp &&
  destinationIp &&
  portIpList.includes(sourceIp) &&
  portIpList.includes(destinationIp);



  const handleSave = (nodeId, updatedPorts, updatedRouterSettings, updatedPcSettings) => {
    console.log("노드 저장", { nodeId, updatedPorts, updatedRouterSettings, updatedPcSettings });
  };
  

   // TopologyCanvas에서 IP 리스트 업데이트
   const updateIpList = (ips) => {
    setIpList(ips);
  };

  const handleBGPSettingComplete = () => {
    setIsReadyForRouting(true); // BGP 설정 완료 시 상태 변경
  };


  const generateRandomBandwidth = () => Math.floor(Math.random() * (10000 - 100 + 1)) + 100;

  const generateRandomLatency = () => Math.floor(Math.random() * (50 - 1 + 1)) + 1;

  // 링크 가중치 계산 (대역폭이 클수록, 지연 시간이 적을수록 가중치가 낮아짐)
  const calculateLinkWeight = (bandwidth, latency) => {
    const bandwidthWeight = 100000 / bandwidth; // 대역폭에 반비례
    const latencyWeight = latency * 10; // 지연시간에 비례 (가중치 증가)
    return (bandwidthWeight + latencyWeight).toFixed(2); // 소수점 2자리로 표시
  };

  const calculatePath = () => {
    // 3개의 경로 데이터를 생성
    const pathsData = Array.from({ length: 3 }, (_, i) => {
      const bandwidth = generateRandomBandwidth();
      const latency = generateRandomLatency();
      const weight = calculateLinkWeight(bandwidth, latency);
      return {
        id: i + 1,
        description: `${i + 1}번 경로: 대역폭 ${bandwidth} Mbps, 지연시간 ${latency} ms, 링크 가중치 ${weight}`,
        weight: parseFloat(weight), // 가중치를 숫자로 저장
      };
    });

    // 가중치가 가장 낮은 경로 찾기
    const bestPath = pathsData.reduce((best, current) =>
      current.weight < best.weight ? current : best
    );

    setPaths([
      ...pathsData.map((path) => path.description),
      `추천 경로: 경로 ${bestPath.id}이 가장 최적입니다.`,
    ]);
    setIsRouteCalculated(true);
  };

  const handleButtonClick = (type) => {
    if (type === "Delete") {
      setDeleteMode((prev) => {
        const newDeleteMode = !prev;
        if (newDeleteMode) {
          setSelectedNodeType(null);
          setSelectedEdgeType(null);
        }
        return newDeleteMode;
      });
    } else if (["Direct", "Crossover", "Serial"].includes(type)) {
      setSelectedEdgeType((prev) => {
        const newEdgeType = prev === type ? null : type;
        if (newEdgeType) {
          setSelectedNodeType(null);
          setDeleteMode(false);
        }
        return newEdgeType;
      });
    } else {
      setSelectedNodeType((prev) => {
        const newNodeType = prev === type ? null : type;
        if (newNodeType) {
          setSelectedEdgeType(null);
          setDeleteMode(false);
        }
        return newNodeType;
      });
    }
  };

  

  // 버튼 스타일 정의
  const buttonStyle = {
    padding: "10px 20px",
    color: "white",
    fontSize: "14px",
    borderRadius: "5px",
    cursor: "pointer",
    border: "none",
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", height: "100vh", display: "flex", flexDirection: "column" }}>
      <NavigationBar />
      <div style={{ marginTop: "20px", padding: "10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
          {/* 출발지 입력창과 설정 버튼 */}
          <form onSubmit={handleSetSource} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "5px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                value={sourceIp}
                onChange={(e) => setSourceIp(e.target.value)}
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
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  backgroundColor: "black",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  opacity: sourceIp.trim() ? 1 : 0.5,
                  pointerEvents: sourceIp.trim() ? "auto" : "none",
                }}
              >
                출발지 설정
              </button>
            </div>
            {/* 출발지 알림 메시지 */}
            {sourceError && <p style={{ color: "red", fontSize: "12px", margin: 0 }}>{sourceError}</p>}
            {sourceSuccess && <p style={{ color: "green", fontSize: "12px", margin: 0 }}>{sourceSuccess}</p>}
          </form>
  
          {/* 목적지 입력창과 설정 버튼 */}
          <form onSubmit={handleSetDestination} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "5px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="text"
                value={destinationIp}
                onChange={(e) => setDestinationIp(e.target.value)}
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
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  backgroundColor: "black",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  opacity: destinationIp.trim() ? 1 : 0.5,
                  pointerEvents: destinationIp.trim() ? "auto" : "none",
                }}
              >
                목적지 설정
              </button>
            </div>
            {/* 목적지 알림 메시지 */}
            {destinationError && <p style={{ color: "red", fontSize: "12px", margin: 0 }}>{destinationError}</p>}
            {destinationSuccess && <p style={{ color: "green", fontSize: "12px", margin: 0 }}>{destinationSuccess}</p>}
          </form>
          {/* 경로 계산 버튼 */}
          <button
            onClick={calculatePath}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              backgroundColor: isRouteCalculationReady ? "black" : "gray",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isRouteCalculationReady ? "pointer" : "not-allowed",
              marginLeft: "20px",
            }}
            disabled={!isRouteCalculationReady}
          >
            경로 계산
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          position: "relative",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            flex: 6,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            backgroundColor: "#f9f9f9",
          }}
        >
          {/* 버튼들 */}
          <div
            style={{
              position: "absolute",
              top: "1px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              display: "flex",
              gap: "10px",
              padding: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: "10px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <button
              onClick={() => handleButtonClick("Router")}
              style={{
                ...buttonStyle,
                backgroundColor: selectedNodeType === "Router" ? "green" : "black",
              }}
            >
              Router
            </button>
            <button
              onClick={() => handleButtonClick("Switch")}
              style={{
                ...buttonStyle,
                backgroundColor: selectedNodeType === "Switch" ? "green" : "black",
              }}
            >
              Switch
            </button>
            <button
              onClick={() => handleButtonClick("PC")}
              style={{
                ...buttonStyle,
                backgroundColor: selectedNodeType === "PC" ? "green" : "black",
              }}
            >
              PC
            </button>
            <button
              onClick={() => handleButtonClick("Direct")}
              style={{
                ...buttonStyle,
                backgroundColor: selectedEdgeType === "Direct" ? "gray" : "black",
              }}
            >
              Direct
            </button>
            <button
              onClick={() => handleButtonClick("Crossover")}
              style={{
                ...buttonStyle,
                backgroundColor: selectedEdgeType === "Crossover" ? "gray" : "black",
              }}
            >
              Crossover
            </button>
            <button
              onClick={() => handleButtonClick("Serial")}
              style={{
                ...buttonStyle,
                backgroundColor: selectedEdgeType === "Serial" ? "red" : "black",
              }}
            >
              Serial
            </button>
            <button
              onClick={() => handleButtonClick("Delete")}
              style={{
                ...buttonStyle,
                backgroundColor: deleteMode ? "blue" : "black",
              }}
            >
              Delete
            </button>
          </div>

          <TopologyCanvas
            selectedNodeType={selectedNodeType}
            setSelectedNodeType={setSelectedNodeType}
            selectedEdgeType={selectedEdgeType}
            setSelectedEdgeType={setSelectedEdgeType}
            deleteMode={deleteMode}
            handleBGPSettingComplete={handleBGPSettingComplete} // BGP 완료 함수 전달
            ipList={portIpList} // 전달
            updateIpList={handlePortIpUpdate} // 전달
          />
        </div>

        {selectedNode && (
  <PortIPSettingsPopup
    node={selectedNode}
    edges={edges}
    onClose={() => setIsPopupOpen(false)}
    onSave={handleSave}
    onUpdateIpList={handlePortIpUpdate} // IP 리스트 업데이트 함수 전달
  />
)}
        <div
          style={{
            flex: 2,
            padding: "50px",
            backgroundColor: "#f8f8f8",
            borderLeft: "1px solid #e0e0e0",
          }}
        >
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>경로 결과</h3>
          {paths.length > 0 ? (
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                fontSize: "14px",
              }}
            >
              {paths.map((path, index) => (
                <li
                  key={index}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    marginBottom: "10px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {path}
                </li>
              ))}
            </ul>
          ) : (
            <p>경로를 계산하려면 목적지 및 출발지를 설정하고 "경로 계산" 버튼을 클릭하세요.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;