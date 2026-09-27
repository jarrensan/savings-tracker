import { useState } from 'react'
import './App.css'


function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <div>
        <h1>Savings Tracker</h1>
        <p>Welcome to savings tracker application!</p>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          <div>count is {count}</div>
        </button>
        <button>

        </button>
      </div>
    </>
  )
}

export default App
