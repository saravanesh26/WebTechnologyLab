import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter-container">
      <div className="counter-card">
        <h1 className="counter-title">Dynamic Counter</h1>
        <div className="counter-display">
          <span 
            className={`count-value ${count > 0 ? 'positive' : count < 0 ? 'negative' : 'zero'}`}
            style={{ transform: `scale(${1 + Math.abs(count) * 0.02})`, transformOrigin: 'center' }}
          >
            {count}
          </span>
        </div>
        <div className="button-group">
          <button className="btn decrement-btn" onClick={() => setCount(count - 1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Decrease
          </button>
          <button className="btn increment-btn" onClick={() => setCount(count + 1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Increase
          </button>
        </div>
      </div>
    </div>
  );
}
