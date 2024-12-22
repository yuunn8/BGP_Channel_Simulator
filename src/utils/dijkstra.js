export function dijkstra(graph, startNode) {
  const distances = {}; // 시작 노드에서 다른 모든 노드로 가는 최소 거리
  const previousNodes = {}; // 각 노드의 이전 노드 (최단 경로 추적용)
  const nodes = new Set(); // 모든 노드 집합

  // 각 노드에 대해 거리 값을 무한대로 설정하고, startNode의 거리는 0으로 설정
  for (let node in graph) {
    distances[node] = node === startNode ? 0 : Infinity;
    previousNodes[node] = null;
    nodes.add(node);
  }

  while (nodes.size) {
    // 가장 작은 거리의 노드를 찾음
    let minNode = null;
    nodes.forEach(node => {
      if (minNode === null || distances[node] < distances[minNode]) {
        minNode = node;
      }
    });

    if (distances[minNode] === Infinity) break; // 더 이상 경로가 없으면 종료

    // 현재 노드에서 인접한 노드들을 탐색
    const neighbors = graph[minNode];
    for (let neighbor in neighbors) {
      const alt = distances[minNode] + neighbors[neighbor]; // 경로의 새로운 거리
      if (alt < distances[neighbor]) { // 새로운 경로가 더 짧으면 업데이트
        distances[neighbor] = alt;
        previousNodes[neighbor] = minNode;
      }
    }

    // 현재 노드를 처리했으므로 집합에서 제거
    nodes.delete(minNode);
  }

  return { distances, previousNodes };
}

export function getShortestPath(previousNodes, targetNode) {
  const path = [];
  let currentNode = targetNode;

  while (currentNode) {
    path.unshift(currentNode); // 경로에 노드를 추가
    currentNode = previousNodes[currentNode]; // 이전 노드로 이동
  }

  return path;
}

// 스위치 노드를 추가적으로 처리할 수 있도록 그래프 데이터 구조 활용
export function processGraphWithSwitches(graph, switches) {
  // 스위치를 단순히 경로의 중간 노드로 추가
  switches.forEach((switchNode) => {
    if (!graph[switchNode]) {
      console.warn(`Switch ${switchNode} is not connected in the graph.`);
      return;
    }

    const neighbors = graph[switchNode];

    // 스위치의 모든 연결된 노드 간에 경로를 연결 (양방향 처리)
    for (let node1 in neighbors) {
      for (let node2 in neighbors) {
        if (node1 !== node2) {
          const cost = neighbors[node1] + neighbors[node2];

          // 기존 그래프를 업데이트하여 스위치를 통과하는 경로를 추가
          if (!graph[node1]) graph[node1] = {};
          if (!graph[node2]) graph[node2] = {};

          graph[node1][node2] = Math.min(graph[node1][node2] || Infinity, cost);
          graph[node2][node1] = Math.min(graph[node2][node1] || Infinity, cost);
        }
      }
    }
  });

  return graph;
}