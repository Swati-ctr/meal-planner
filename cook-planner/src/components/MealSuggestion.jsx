import { useState } from 'react'

const SITUATION_PRESETS = [
  { id: 'sick', emoji: '🤒', label: 'Feeling sick', desc: 'Light, easy to digest' },
  { id: 'legday', emoji: '🦵', label: 'Leg day', desc: 'High protein, energy' },
  { id: 'period', emoji: '🌸', label: 'Period cramps', desc: 'Iron-rich, comforting' },
  { id: 'heat', emoji: '☀️', label: 'Hot weather', desc: 'Cooling, light meals' },
  { id: 'guests', emoji: '👨‍👩‍👧', label: 'Guests coming', desc: 'Festive, crowd-pleasing' },
  { id: 'fasting', emoji: '🙏', label: 'Fasting day', desc: 'Saatvik, no onion/garlic' },
  { id: 'quick', emoji: '⚡', label: 'Short on time', desc: 'Quick & easy meals' },
  { id: 'kids', emoji: '👶', label: 'Kids at home', desc: 'Kid-friendly, mild' },
]

const FALLBACK_SUGGESTIONS = {
  sick: {
    Breakfast: ['Moong dal khichdi', 'Plain poha with ginger tea', 'Sabudana khichdi'],
    Lunch: ['Rice + moong dal + curd', 'Soft idli with coconut chutney', 'Daliya with vegetables'],
    Dinner: ['Light vegetable soup + toast', 'Rice kanji (congee)', 'Moong dal soup with roti'],
  },
  legday: {
    Breakfast: ['Egg bhurji with multigrain roti', 'Paneer paratha with curd', 'Sprouted moong chilla'],
    Lunch: ['Brown rice + rajma + salad', 'Chicken curry + chapati + dal', 'Soya chunk sabzi + rice'],
    Dinner: ['Paneer tikka + roti + salad', 'Dal makhani + brown rice', 'Egg curry + chapati'],
  },
  period: {
    Breakfast: ['Ragi dosa with sambar', 'Dates + nuts porridge', 'Spinach poha with jaggery tea'],
    Lunch: ['Spinach dal + rice + ghee', 'Rajma chawal with salad', 'Palak paneer + roti'],
    Dinner: ['Beetroot sabzi + roti + dal', 'Chicken soup + rice', 'Masoor dal + rice + curd'],
  },
  heat: {
    Breakfast: ['Curd rice with pomegranate', 'Watermelon + overnight oats', 'Cucumber poha'],
    Lunch: ['Curd rice + raw mango chutney', 'Raita + light dal + rice', 'Buttermilk + idli'],
    Dinner: ['Mung dal khichdi + lassi', 'Cucumber raita + roti', 'Light vegetable pulao'],
  },
  guests: {
    Breakfast: ['Chole bhature', 'Masala dosa with sambar & chutney', 'Aloo puri'],
    Lunch: ['Dal makhani + paneer butter masala + naan + rice', 'Biryani + raita + pickle', 'Chole + puri + kheer'],
    Dinner: ['Roti + shahi paneer + dal tadka + dessert', 'Pulao + mixed veg curry + raita', 'Fried rice + manchurian'],
  },
  fasting: {
    Breakfast: ['Sabudana khichdi', 'Fruit chaat with rock salt', 'Kuttu atta dosa'],
    Lunch: ['Sabudana khichdi + curd', 'Aloo sabzi + kuttu roti', 'Fruit raita + makhana'],
    Dinner: ['Makhana kheer', 'Sabudana vada + curd', 'Sama rice + aloo'],
  },
  quick: {
    Breakfast: ['Bread upma', 'Instant poha', 'Egg toast + banana'],
    Lunch: ['Dal chawal (pressure cooker)', 'Roti + leftover sabzi', 'Maggi + boiled egg'],
    Dinner: ['Khichdi', 'Chapati + dahi + pickle', 'Rice + dal tadka'],
  },
  kids: {
    Breakfast: ['Aloo paratha with butter', 'Banana pancakes', 'Bread dosa with ketchup'],
    Lunch: ['Mac and cheese style pasta', 'Roti rolls with paneer', 'Dal rice with ghee'],
    Dinner: ['Pizza paratha', 'Vegetable upma', 'Soft idli with mild sambar'],
  },
}

export default function MealSuggestion({ onApplyToDay, days }) {
  const [selected, setSelected] = useState(null)
  const [customSituation, setCustomSituation] = useState('')
  const [suggestions, setSuggestions] = useState(null)
  const [loading, setLoading] = useState(false)
  const [applyDay, setApplyDay] = useState(days[0])
  const [appliedDay, setAppliedDay] = useState(null)
  const [mode, setMode] = useState(null) // 'ai' or 'fallback'

  async function getSuggestions(situationId, situationLabel) {
    setLoading(true)
    setSuggestions(null)
    setAppliedDay(null)

    // Try AI first
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 600,
          messages: [{
            role: 'user',
            content: `You are a helpful Indian household meal planner. Suggest 3 options each for Breakfast, Lunch, and Dinner for someone who is: "${situationLabel}". Focus on practical Indian home cooking. Respond ONLY with valid JSON in this exact format, no markdown, no extra text:
{"Breakfast":["meal1","meal2","meal3"],"Lunch":["meal1","meal2","meal3"],"Dinner":["meal1","meal2","meal3"]}`
          }]
        })
      })
      if (response.ok) {
        const data = await response.json()
        const text = data.content[0].text.trim()
        const parsed = JSON.parse(text)
        setSuggestions(parsed)
        setMode('ai')
        setLoading(false)
        return
      }
    } catch (e) {}

    // Fallback
    const fb = FALLBACK_SUGGESTIONS[situationId]
    if (fb) {
      setSuggestions(fb)
      setMode('fallback')
    } else {
      setSuggestions(FALLBACK_SUGGESTIONS['quick'])
      setMode('fallback')
    }
    setLoading(false)
  }

  function handlePreset(preset) {
    setSelected(preset.id)
    setCustomSituation('')
    getSuggestions(preset.id, preset.label + ': ' + preset.desc)
  }

  function handleCustom() {
    if (!customSituation.trim()) return
    setSelected('custom')
    getSuggestions('quick', customSituation.trim())
  }

  function applyToDay(meal, mealName) {
    onApplyToDay(applyDay, meal, mealName)
    setAppliedDay(applyDay + '_' + meal)
  }

  return (
    <div className="suggestion-panel">
      <div className="suggestion-header">
        <h2 className="suggestion-title">What's the situation today?</h2>
        <p className="suggestion-sub">Get meal ideas tailored to how you're feeling or what's happening</p>
      </div>

      <div className="situation-grid">
        {SITUATION_PRESETS.map(p => (
          <button
            key={p.id}
            className={`situation-btn ${selected === p.id ? 'active' : ''}`}
            onClick={() => handlePreset(p)}
          >
            <span className="situation-emoji">{p.emoji}</span>
            <span className="situation-label">{p.label}</span>
            <span className="situation-desc">{p.desc}</span>
          </button>
        ))}
      </div>

      <div className="custom-situation">
        <input
          type="text"
          placeholder="Or describe your own situation… (e.g. marathon tomorrow, celebrating birthday)"
          value={customSituation}
          onChange={e => setCustomSituation(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCustom()}
          className="custom-input"
        />
        <button className="suggest-btn" onClick={handleCustom} disabled={!customSituation.trim()}>
          Suggest
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-dots"><span/><span/><span/></div>
          <p>Finding the right meals for you…</p>
        </div>
      )}

      {suggestions && !loading && (
        <div className="suggestions-result">
          <div className="result-header">
            <p className="section-label">Suggested meals</p>
            {mode === 'ai' && <span className="ai-badge">✨ AI</span>}
            <div className="apply-row">
              <span className="apply-label">Apply to:</span>
              <select className="day-select" value={applyDay} onChange={e => setApplyDay(e.target.value)}>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {['Breakfast', 'Lunch', 'Dinner'].map(meal => (
            <div key={meal} className="suggestion-meal-block">
              <p className="suggestion-meal-label">{meal}</p>
              <div className="suggestion-options">
                {suggestions[meal]?.map((opt, i) => (
                  <div key={i} className="suggestion-option">
                    <span>{opt}</span>
                    <button
                      className={`apply-btn ${appliedDay === applyDay + '_' + meal && suggestions[meal][i] === opt ? 'applied' : ''}`}
                      onClick={() => applyToDay(meal, opt)}
                    >
                      {appliedDay === applyDay + '_' + meal ? '✓ Applied' : '+ Use'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
