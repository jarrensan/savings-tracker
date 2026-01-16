import { createContext, useContext, useState } from 'react'
import './App.css'

type Theme = "light" | "dark" | "system";
const ThemeContext = createContext<Theme>("system");
const useGetTheme = () => useContext(ThemeContext);

function App() {
  const [count, setCount] = useState(0)
  const [theme, setTheme] = useState<Theme>('dark');
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
