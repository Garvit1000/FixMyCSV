import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import DocsPage from './pages/Docs'
const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
            <Route path="/docs" element={<DocsPage />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
