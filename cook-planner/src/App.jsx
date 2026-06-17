import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import MenuPlanner from './components/MenuPlanner'
import GroceryList from './components/GroceryList'
import MealSuggestion from './components/MealSuggestion'
import SpinWheel from './components/SpinWheel'
import SavedPlans from './components/SavedPlans'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MEALS = ['Breakfast', 'Lunch', 'Dinner']

function initMenu() {
  const data = {}
  DAYS.forEach(day => {
    data[day] = { note: '', quantities: {}, audios: {} }
    MEALS.forEach(meal => { data[day][meal] = '' })
  })
  return data
}

function buildWhatsAppText(menuData, groceryItems, days, meals, cookName) {
  let text = `🍽️ *Cook Planner – Weekly Menu*\n`
  if (cookName) text += `For: ${cookName}\n`
  text += '\n'
  days.forEach(day => {
    const d = menuData[day]
    const hasMeals = meals.some(m => d[m])
    if (!hasMeals) return
    text += `*${day}*\n`
    meals.forEach(m => {
      if (d[m]) {
        text += `  ${m}: ${d[m]}`
        const qs = (d.quantities || {})[m] || {}
        const qParts = Object.entries(qs).map(([k, v]) => `${v} ${k}`).join(', ')
        if (qParts) text += ` (${qParts})`
        text += '\n'
      }
    })
    if (d.note) text += `  📝 ${d.note}\n`
    text += '\n'
  })
  if (groceryItems.length > 0) {
    text += '🛒 *Grocery List*\n'
    groceryItems.filter(i => !i.checked).forEach(i => {
      text += `  • ${i.name}${i.qty !== '—' ? ' – ' + i.qty : ''}\n`
    })
  }
  return encodeURIComponent(text)
}

// Protected route wrapper
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="app-loading">Loading…</div>
  return user ? children : <Navigate to="/login" replace />
}

function MainApp() {
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('menu')
  const [menuData, setMenuData] = useState(initMenu)
  const [groceryItems, setGroceryItems] = useState([])
  const [groceryAudio, setGroceryAudio] = useState(null)
  const [spinDay, setSpinDay] = useState('Saturday')

  function applyToDay(day, meal, mealName) {
    setMenuData(prev => ({ ...prev, [day]: { ...prev[day], [meal]: mealName } }))
  }

  function applyCombo(day, combo) {
    setMenuData(prev => ({ ...prev, [day]: { ...prev[day], ...combo } }))
  }

  function speakMenu() {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    let text = 'Weekly menu. '
    DAYS.forEach(day => {
      const d = menuData[day]
      const hasMeals = MEALS.some(m => d[m])
      if (!hasMeals) return
      text += `${day}. `
      MEALS.forEach(m => { if (d[m]) text += `${m}: ${d[m]}. ` })
      if (d.note) text += `Note: ${d.note}. `
    })
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = 'en-IN'
    utt.rate = 0.85
    window.speechSynthesis.speak(utt)
  }

  function handleLoadPlan(newMenuData, newGrocery) {
    setMenuData(newMenuData || initMenu())
    setGroceryItems(newGrocery || [])
    setTab('menu')
  }

  const cookName = user?.cookName || ''
  const cookPhone = user?.cookPhone || ''
  const whatsappText = buildWhatsAppText(menuData, groceryItems, DAYS, MEALS, cookName)
  const whatsappUrl = cookPhone
    ? `https://wa.me/${cookPhone}?text=${whatsappText}`
    : `https://wa.me/?text=${whatsappText}`

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-top">
            <div>
              <h1 className="logo-title">🍳 Meal Planner</h1>
              <p className="logo-sub">Plan meals & manage groceries for your cook</p>
            </div>
            <div className="header-actions">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
                <span>📲</span> {cookName ? `Send to ${cookName}` : 'Send to Cook'}
              </a>
              <div className="user-menu">
                <span className="user-name">👤 {user?.name}</span>
                <div className="user-dropdown">
                  <button onClick={() => setTab('settings')}>⚙️ Settings</button>
                  <button onClick={logout} className="logout-btn">🚪 Logout</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="tabs">
          {[
            { id: 'menu', label: '📅 Weekly Menu' },
            { id: 'grocery', label: '🛒 Grocery', badge: groceryItems.filter(i => !i.checked).length },
            { id: 'suggest', label: '✨ Suggest' },
            { id: 'spin', label: '🎲 Spin' },
            { id: 'plans', label: '📋 Saved Plans' },
            { id: 'settings', label: '⚙️ Settings' },
          ].map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
              {t.badge > 0 && <span className="badge">{t.badge}</span>}
            </button>
          ))}
        </div>

        {tab === 'menu' && (
          <div>
            <div className="menu-top-actions">
              <button className="tts-btn" onClick={speakMenu}>🔊 Read menu aloud</button>
            </div>
            <MenuPlanner menuData={menuData} setMenuData={setMenuData} days={DAYS} meals={MEALS} />
          </div>
        )}
        {tab === 'grocery' && (
          <GroceryList
            items={groceryItems}
            setItems={setGroceryItems}
            groceryAudio={groceryAudio}
            setGroceryAudio={setGroceryAudio}
          />
        )}
        {tab === 'suggest' && (
          <MealSuggestion days={DAYS} onApplyToDay={applyToDay} user={user} />
        )}
        {tab === 'spin' && (
          <SpinWheel days={DAYS} onApplyCombo={applyCombo} spinDay={spinDay} setSpinDay={setSpinDay} />
        )}
        {tab === 'plans' && (
          <SavedPlans menuData={menuData} groceryItems={groceryItems} onLoad={handleLoadPlan} />
        )}
        {tab === 'settings' && <SettingsPage />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<PrivateRoute><MainApp /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
