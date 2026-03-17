import React from 'react';
import FinancialInput from './components/FinancialInput'; // 질문자님과 팀원 4의 작업물

function App() {
  return (
    <div className="App">
      <header className="App-header" style={{ padding: '20px', backgroundColor: '#282c34', color: 'white' }}>
        <h1>💰 금융 포터 (FinPorter)</h1>
        <p>개인 맞춤형 예적금 추천 서비스</p>
      </header>
      
      <main style={{ padding: '40px' }}>
        {/* 질문자님과 팀원 4님이 만든 입력 폼을 여기에 배치 */}
        <FinancialInput />
      </main>

      <footer >
      </footer>
    </div>
  );
}

export default App;