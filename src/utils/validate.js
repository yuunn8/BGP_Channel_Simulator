export const validateIpInTopology = (ip, nodes) => {
    for (const node of nodes) {
      for (const port of Object.values(node.data.ports)) {
        if (port === ip) {
          return true; // IP가 노드에 존재함
        }
      }
    }
    return false; // IP가 노드에 존재하지 않음
  };
  