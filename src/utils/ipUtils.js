// IP를 숫자 배열로 변환하는 함수
export const ipToArray = (ip) => ip.split('.').map(Number);

// 숫자 배열을 다시 IP 문자열로 변환하는 함수
export const arrayToIp = (arr) => arr.join('.');

// 네트워크 주소 계산 함수
export const calculateNetworkAddress = (ip, subnet) => {
  const ipParts = ipToArray(ip); // IP를 배열로 변환
  const subnetParts = ipToArray(subnet); // 서브넷 마스크를 배열로 변환

  // 네트워크 주소는 IP와 서브넷 마스크의 AND 연산 결과
  const networkAddress = ipParts.map((octet, i) => octet & subnetParts[i]);
  return arrayToIp(networkAddress); // 배열을 IP 문자열로 변환 후 반환
};

// 브로드캐스트 주소 계산 함수
export const calculateBroadcastAddress = (ip, subnet) => {
  const ipParts = ipToArray(ip); // IP를 배열로 변환
  const subnetParts = ipToArray(subnet); // 서브넷 마스크를 배열로 변환

  // 브로드캐스트 주소는 네트워크 주소 | (~서브넷 마스크)
  const broadcastAddress = ipParts.map((octet, i) => octet | (~subnetParts[i] & 255));
  return arrayToIp(broadcastAddress); // 배열을 IP 문자열로 변환 후 반환
};

// 네트워크 및 브로드캐스트 주소 여부를 확인하는 함수
export const isNetworkOrBroadcastAddress = (ip, subnet) => {
  const networkAddress = calculateNetworkAddress(ip, subnet);
  const broadcastAddress = calculateBroadcastAddress(ip, subnet);

  // 입력 IP가 네트워크 주소나 브로드캐스트 주소인지 확인
  return ip === networkAddress || ip === broadcastAddress;
};
