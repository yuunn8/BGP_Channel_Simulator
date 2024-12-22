const NodeModal = ({ selectedNode, onSave }) => {
  const [ip, setIp] = useState(selectedNode?.data?.ip || '');
  const [asNumber, setAsNumber] = useState(selectedNode?.data?.asNumber || ''); // AS 번호
  const [neighbors, setNeighbors] = useState(selectedNode?.data?.neighbors || ['']); // Neighbor IP 배열
  const [neighborAsNumbers, setNeighborAsNumbers] = useState(selectedNode?.data?.neighborAsNumbers || ['']); // Neighbor AS 번호 배열
  const [networkIp, setNetworkIp] = useState(selectedNode?.data?.networkIp || ''); // 네트워크 IP
  const [networkSubnet, setNetworkSubnet] = useState(selectedNode?.data?.networkSubnet || ''); // 네트워크 서브넷

  useEffect(() => {
    if (selectedNode) {
      setIp(selectedNode.data.ip || '');
      setAsNumber(selectedNode.data.asNumber || '');
      setNeighbors(selectedNode.data.neighbors || ['']);
      setNeighborAsNumbers(selectedNode.data.neighborAsNumbers || ['']);
      setNetworkIp(selectedNode.data.networkIp || '');
      setNetworkSubnet(selectedNode.data.networkSubnet || '');
    }
  }, [selectedNode]);

  const handleSave = () => {
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        ip, // 사용자 입력 IP
        asNumber, // AS 번호
        neighbors, // 여러 개의 Neighbor IP 배열
        neighborAsNumbers, // 여러 개의 Neighbor AS 번호 배열
        networkIp, // 네트워크 IP
        networkSubnet, // 네트워크 서브넷
      },
    };

    onSave(updatedNode); // 부모 컴포넌트로 업데이트된 노드 전달
  };

  const handleAddNeighbor = () => {
    setNeighbors([...neighbors, '']); // 새 Neighbor IP 추가
    setNeighborAsNumbers([...neighborAsNumbers, '']); // 새 Neighbor AS 번호 추가
  };

  const handleRemoveNeighbor = (index) => {
    const updatedNeighbors = neighbors.filter((_, i) => i !== index); // Neighbor IP 삭제
    const updatedNeighborAsNumbers = neighborAsNumbers.filter((_, i) => i !== index); // Neighbor AS 번호 삭제

    setNeighbors(updatedNeighbors);
    setNeighborAsNumbers(updatedNeighborAsNumbers);
  };

  const handleNeighborChange = (index, value) => {
    const updatedNeighbors = [...neighbors];
    updatedNeighbors[index] = value;
    setNeighbors(updatedNeighbors);
  };

  const handleNeighborAsNumberChange = (index, value) => {
    const updatedNeighborAsNumbers = [...neighborAsNumbers];
    updatedNeighborAsNumbers[index] = value;
    setNeighborAsNumbers(updatedNeighborAsNumbers);
  };

  return (
    <div style={{ display: selectedNode ? 'block' : 'none', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
      <h3>노드 속성 수정</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <label>IP 주소</label>
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="Enter IP"
          style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>AS 번호</label>
        <input
          type="text"
          value={asNumber}
          onChange={(e) => setAsNumber(e.target.value)}
          placeholder="Enter AS Number"
          style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Neighbor IP</label>
        {neighbors.map((neighbor, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            <input
              type="text"
              value={neighbor}
              onChange={(e) => handleNeighborChange(index, e.target.value)}
              placeholder="Enter Neighbor IP"
              style={{ width: '80%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <button onClick={() => handleRemoveNeighbor(index)} style={{ backgroundColor: 'red', color: 'white', padding: '5px', cursor: 'pointer' }}>삭제</button>
          </div>
        ))}
        <button onClick={handleAddNeighbor} style={{ backgroundColor: 'green', color: 'white', padding: '5px 10px', cursor: 'pointer' }}>Neighbor 추가</button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Neighbor AS 번호</label>
        {neighborAsNumbers.map((neighborAsNumber, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            <input
              type="text"
              value={neighborAsNumber}
              onChange={(e) => handleNeighborAsNumberChange(index, e.target.value)}
              placeholder="Enter Neighbor AS Number"
              style={{ width: '80%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <button onClick={() => handleRemoveNeighbor(index)} style={{ backgroundColor: 'red', color: 'white', padding: '5px', cursor: 'pointer' }}>삭제</button>
          </div>
        ))}
        <button onClick={handleAddNeighbor} style={{ backgroundColor: 'green', color: 'white', padding: '5px 10px', cursor: 'pointer' }}>AS 번호 추가</button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>네트워크 IP</label>
        <input
          type="text"
          value={networkIp}
          onChange={(e) => setNetworkIp(e.target.value)}
          placeholder="Enter Network IP"
          style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>네트워크 서브넷</label>
        <input
          type="text"
          value={networkSubnet}
          onChange={(e) => setNetworkSubnet(e.target.value)}
          placeholder="Enter Network Subnet"
          style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={handleSave}
          style={{
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          저장
        </button>
        <button
          onClick={() => onSave(null)} // 닫기 버튼 처리
          style={{
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default NodeModal;
