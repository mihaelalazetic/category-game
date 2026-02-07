import { useState } from 'react'
import './App.css'
import GameBoard from './components/GameBoard'
import { LanguageProvider } from './context/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <div className="app">
        <GameBoard />
      </div>
    </LanguageProvider>
  )
}

export default App
