import React from 'react';
import FinancialInput from './components/FinancialInput.js'; 

function App() {
  return (
    <div className="App">
      <header className="App-header" style={{ padding: '20px', backgroundColor: '#282c34', color: 'white' }}>
        <h1>💰 금융 포터 (FinPorter)</h1>
        <p>개인 맞춤형 예적금 추천 서비스</p>
      </header>
      
      <main style={{ padding: '40px' }}>
        
        <FinancialInput />
      </main>

      <footer >
      </footer>
    </div>
  );
}

export default App;