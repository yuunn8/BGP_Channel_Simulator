import React, { useState, useEffect, useMemo } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";
import PortSelectionPopup from "./PortSelectionPopup";
import PortIPSettingsPopup from "./PortIPSettingsPopup";

function TopologyCanvas({ selectedNodeType, selectedEdgeType, deleteMode, ipList, updateIpList  }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [startNode, setStartNode] = useState(null);
  const [startPort, setStartPort] = useState(null);
  const [nodeCounts, setNodeCounts] = useState({ Router: 1, Switch: 1, PC: 1 });
  const [portPopup, setPortPopup] = useState({ visible: false, node: null, isSource: true });
  const [ipPopup, setIpPopup] = useState({ visible: false, node: null });
  const [routerSettings, setRouterSettings] = useState({});
  const [pcSettings, setPcSettings] = useState({});
  const [connectedPorts, setConnectedPorts] = useState({});

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({}), []);

  

  useEffect(() => {
    const initialNodes = [
      {
        id: "Router-1",
        type: "custom",
        position: { x: 100, y: 100 },
        data: { label: "Router 1", ports: { "g0/1": "", "g0/2": "" } },
      },
      {
        id: "Switch-1",
        type: "custom",
        position: { x: 300, y: 100 },
        data: { label: "Switch 1", ports: [...Array(10).fill().map((_, i) => `f0/${i + 1}`), "g0/1", "g0/2"] },
      },
      {
        id: "PC-1",
        type: "custom",
        position: { x: 500, y: 100 },
        data: { label: "PC 1", ports: { "f0": "" } },
      },
    ];
    setNodes(initialNodes);
  }, []);
  

  useEffect(() => {
    if (edges.length > 0 && nodes.length > 0) {
      const allIps = nodes
        .flatMap((node) => Object.values(node.data.ports).map((port) => port.ip))
        .filter(Boolean); // 유효한 IP만 포함
      if (JSON.stringify(ipList) !== JSON.stringify(allIps)) {
        updateIpList(allIps); // IP 리스트 업데이트
      }
    }
  }, [edges, nodes, ipList, updateIpList]); // 의존성 배열에 추가

  const handleNodeClick = (event, node) => {
    if (deleteMode) {
      deleteNodeAndEdges(node.id);
      return;
    }

    if (selectedEdgeType === "Serial") {
      if (!startNode) {
        if (!node.id.startsWith("Router")) {
          alert("Serial 간선은 라우터끼리만 연결할 수 있습니다.");
          return;
        }
        setStartNode(node);
        const availablePorts = { "s0/1/0": "", "s0/1/1": "" };
        setPortPopup({
          visible: true,
          node: { ...node, data: { ...node.data, ports: availablePorts } },
          isSource: true,
        });
      } else {
        if (!node.id.startsWith("Router")) {
          alert("Serial 간선은 라우터끼리만 연결할 수 있습니다.");
          resetConnectionState();
          return;
        }
        const availablePorts = { "s0/1/0": "", "s0/1/1": "" };
        setPortPopup({
          visible: true,
          node: { ...node, data: { ...node.data, ports: availablePorts } },
          isSource: false,
        });
      }
      return;
    }

    if (!selectedEdgeType && node.id.startsWith("Router")) {
      setRouterSettings({
          asNumber: node.data.asNumber || "",
          neighbors: node.data.neighbors || [],
          neighborAS: node.data.neighborAS || [],
          networkIp: node.data.networkIp || "",
          subnet: node.data.subnet || "",
      });
      setIpPopup({ visible: true, node });
  } else if (!selectedEdgeType && node.id.startsWith("PC")) {
      setPcSettings({
          ip: node.data.ports.f0?.ip || "",
          subnet: node.data.ports.f0?.subnet || "",
      });
      setIpPopup({ visible: true, node });
  }
    if (selectedEdgeType) {
      if (!startNode) {
        setStartNode(node);
        setPortPopup({ visible: true, node, isSource: true });
      } else if (startNode.id === node.id) {
        alert("동일한 노드에서 출발 포트와 도착 포트를 동시에 지정할 수 없습니다.");
        resetConnectionState();
      } else {
        setPortPopup({ visible: true, node, isSource: false });
      }
    }
  };

  const handleCanvasClick = (event) => {
    if (!selectedNodeType) return;

    const bounds = event.target.getBoundingClientRect();
    const position = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };

    const newNode = createNode(selectedNodeType, position);

    setNodes((prevNodes) => [...prevNodes, newNode]);
    setNodeCounts((prevCounts) => ({
      ...prevCounts,
      [selectedNodeType]: prevCounts[selectedNodeType] + 1,
    }));
  };

  const handlePortSelection = (selectedPort) => {
    if (portPopup.isSource) {
      if (portInUse(startNode.id, selectedPort)) {
        alert("이미 연결된 포트는 사용할 수 없습니다.");
        return;
      }
      setStartPort(selectedPort);
    } else {
      if (portInUse(portPopup.node.id, selectedPort)) {
        alert("이미 연결된 포트는 사용할 수 없습니다.");
        return;
      }
      createEdge(startNode, portPopup.node, startPort, selectedPort);
      resetConnectionState();
    }

    setPortPopup({ visible: false, node: null });
  };

  const portInUse = (nodeId, port) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node?.data?.ports[port] === "in-use";
  };

  const createNode = (type, position) => {
    const id = `${type}-${nodeCounts[type]}`;
    const ports =
      type === "PC"
        ? { "f0": "" }
        : type === "Switch"
        ? [...Array(10).fill().map((_, i) => `f0/${i + 1}`), "g0/1", "g0/2"]
        : { "g0/1": "", "g0/2": "" };

    return {
      id,
      type: "custom",
      position,
      data: { label: `${type} ${nodeCounts[type]}`, ports },
    };
  };

  const createEdge = (sourceNode, targetNode, sourcePort, targetPort) => {
    let edgeStyle;
  
    if (selectedEdgeType === "Direct") {
      edgeStyle = { stroke: "black", strokeWidth: 2,strokeDasharray: undefined };
    } else if (selectedEdgeType === "Crossover") {
      edgeStyle = { stroke: "black", strokeWidth: 2, strokeDasharray: "5,5" };
    } else if (selectedEdgeType === "Serial") {
      edgeStyle = { stroke: "red", strokeWidth: 2, strokeDasharray: undefined };
    }
  
    const labelText = `${sourceNode.data.label} (${sourcePort}) <-> ${targetNode.data.label} (${targetPort})`;
  
    const newEdge = {
      id: `edge-${sourceNode.id}-${targetNode.id}`,
      source: sourceNode.id,
      target: targetNode.id,
      animated: false,
      style: edgeStyle, // 간선 스타일 적용
      label: labelText,
      labelStyle: {
        fontSize: 10,
        fill: "black",
        background: "white",
        padding: "2px 4px",
        borderRadius: "4px",
        border: "1px solid gray",
      },
      data: { sourcePort, targetPort },
    };
  
    setEdges((prevEdges) => [...prevEdges, newEdge]);
  
    updatePortStatus(sourceNode.id, sourcePort, "in-use");
    updatePortStatus(targetNode.id, targetPort, "in-use");
  };
  

  
  

  const updatePortStatus = (nodeId, port, status) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ports: {
                  ...node.data.ports,
                  [port]: status === "in-use" ? "in-use" : "",
                },
              },
            }
          : node
      )
    );
  };

  const deleteNodeAndEdges = (nodeId) => {
    const connectedEdges = edges.filter((edge) => edge.source === nodeId || edge.target === nodeId);
    connectedEdges.forEach((edge) => {
      updatePortStatus(edge.source, edge.data.sourcePort, "");
      updatePortStatus(edge.target, edge.data.targetPort, "");
    });

    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
    setEdges((prevEdges) => prevEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  };
  

  const handleEdgeClick = (event, edge) => {
    if (deleteMode) {
      // 간선 삭제
      setEdges((prevEdges) => prevEdges.filter((e) => e.id !== edge.id));

      // 연결된 포트를 다시 사용 가능 상태로 업데이트
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === edge.source) {
            return {
              ...node,
              data: {
                ...node.data,
                ports: {
                  ...node.data.ports,
                  [edge.data.sourcePort]: "",
                },
              },
            };
          }
          if (node.id === edge.target) {
            return {
              ...node,
              data: {
                ...node.data,
                ports: {
                  ...node.data.ports,
                  [edge.data.targetPort]: "",
                },
              },
            };
          }
          return node;
        })
      );
    }
  };

  const resetConnectionState = () => {
    setStartNode(null);
    setStartPort(null);
  };

  const handleSaveSettings = (nodeId, updatedPorts, updatedRouterSettings, updatedPcSettings) => {
    setNodes((prevNodes) =>
        prevNodes.map((node) =>
            node.id === nodeId
                ? {
                      ...node,
                      data: {
                          ...node.data,
                          ports: updatedPorts,
                          ...(updatedRouterSettings || {}), // Router 설정 저장
                          ...(updatedPcSettings || {}), // PC 설정 저장
                      },
                  }
                : node
        )
    );
};


  
  
  const handleClosePopup = () => {
    setIpPopup({ visible: false, node: null }); // 팝업 닫기
  };

  return (
    <div
      style={{
        height: "500px",
        width: "100%",
        border: "1px solid black",
        position: "relative",
      }}
      onClick={handleCanvasClick}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onNodeDragStop={(event, node) => {
          setNodes((prevNodes) =>
            prevNodes.map((n) => (n.id === node.id ? { ...node } : n))
          );
        }}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
     {portPopup.visible && (
      <PortSelectionPopup
        node={portPopup.node}
        isSource={portPopup.isSource}
        onClose={() => setPortPopup({ visible: false, node: null })}
        onSave={handlePortSelection}
      />
    )}
    {ipPopup.visible && (
      <PortIPSettingsPopup
      node={ipPopup.node || {}} // node가 없을 경우 기본값으로 빈 객체 전달
      edges={edges}
      onClose={handleClosePopup}
      onSave={(nodeId, updatedPorts, updatedRouterSettings, updatedPcSettings) => {
        handleSaveSettings(nodeId, updatedPorts, updatedRouterSettings, updatedPcSettings);
      }}
      onUpdateIpList={(updatedIpList) => {
        console.log("Updated IP List: ", updatedIpList); // 디버깅용
      }}
    />
  )}
</div>
  );
}

export default TopologyCanvas;