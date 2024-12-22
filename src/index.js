// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';  // 이제는 기본 CSS 파일만 임포트
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
