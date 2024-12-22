import React from 'react';

function PathResults({ pathData, metrics }) {
  // pathData가 정의되지 않았거나 배열이 아닐 경우를 방지
  const pathResult = pathData && Array.isArray(pathData) && pathData.length > 0
    ? pathData.join(' → ')
    : '경로 없음';

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">경로 결과</h2>
      {/* pathData가 배열이고 값이 있을 때만 join() 호출 */}
      <p className="text-red- 500 font-bold">추천 경로: {pathResult}</p>
      <table className="table-auto w-full mt-4">
        <thead>
          <tr>
            <th>경로</th>
            <th>지연 시간</th>
            <th>Hop 수</th>
          </tr>
        </thead>
        <tbody>
          {/* metrics가 배열이고 값이 있을 때만 map() 사용 */}
          {metrics && Array.isArray(metrics) && metrics.length > 0 ? (
            metrics.map((metric, index) => (
              <tr key={index}>
                {/* metric.path가 배열일 때만 join() 호출 */}
                <td>{Array.isArray(metric.path) && metric.path.length > 0 ? metric.path.join(' → ') : '경로 없음'}</td>
                <td>{metric.delay}ms</td>
                <td>{metric.hops}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center text-red-500">데이터가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PathResults;
