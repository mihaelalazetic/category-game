import { useContext } from 'react'
import { LanguageContext } from '../context/LanguageContext'
import './LanguageSelector.css'

export default function LanguageSelector() {
  const { language, setLanguage } = useContext(LanguageContext)

  return (
    <div className="language-selector">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="lang-select"
        title="Select language"
      >
        <option value="en">🇺🇸</option>
        <option value="mk">🇲🇰</option>
      </select>
    </div>
  )
}
