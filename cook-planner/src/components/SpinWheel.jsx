import { useState, useRef, useEffect } from 'react'

const BREAKFASTS = [
  'Idli Sambar', 'Poha', 'Upma', 'Aloo Paratha', 'Masala Dosa',
  'Chole Bhature', 'Bread Upma', 'Sabudana Khichdi', 'Ragi Dosa',
  'Egg Bhurji Roti', 'Vermicelli Upma', 'Pesarattu',
]

const LUNCHES = [
  'Dal Chawal', 'Rajma Chawal', 'Roti Sabzi Dal', 'Curd Rice',
  'Paneer Butter Masala + Roti', 'Pulao + Raita', 'Biryani',
  'Khichdi', 'Sambar Rice', 'Chicken Curry Rice',
]

const DINNERS = [
  'Chapati + Dal Tadka', 'Roti + Paneer Sabzi', 'Khichdi',
  'Chapati + Aloo Matar', 'Rice + Rasam', 'Roti + Egg Curry',
  'Dal Makhani + Roti', 'Vegetable Pulao', 'Chapati + Chole',
]

const COLORS = [
  '#FF6B6B','#FF8E53','#FFC64D','#6BCB77','#4D96FF',
  '#C77DFF','#FF6BD6','#4ECDC4','#FFD166','#06D6A0',
  '#EF476F','#118AB2',
]

function SpinWheelCanvas({ items, spinning, result, onSpinEnd }) {
  const canvasRef = useRef(null)
  const angleRef = useRef(0)
  const velRef = useRef(0)
  const rafRef = useRef(null)
  const spinningRef = useRef(false)

  const numSlices = items.length
  const sliceAngle = (2 * Math.PI) / numSlices

  function draw(canvas, angle) {
    const ctx = canvas.getContext('2d')
    const size = canvas.width
    const cx = size / 2, cy = size / 2, r = size / 2 - 8

    ctx.clearRect(0, 0, size, size)

    // Shadow
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 16
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.restore()

    items.forEach((item, i) => {
      const start = angle + i * sliceAngle
      const end = start + sliceAngle

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end)
      ctx.closePath()
      ctx.fillStyle = COLORS[i % COLORS.length]
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Text
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(start + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${Math.max(10, Math.min(13, 130 / numSlices))}px Inter, sans-serif`
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 3
      const maxLen = 14
      const label = item.length > maxLen ? item.slice(0, maxLen) + '…' : item
      ctx.fillText(label, r - 12, 4)
      ctx.restore()
    })

    // Center circle
    ctx.beginPath()
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI)
    ctx.fillStyle = '#1A1A1A'
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 13px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('🎲', cx, cy + 5)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    draw(canvas, angleRef.current)
  }, [items])

  useEffect(() => {
    if (!spinning) return
    if (spinningRef.current) return
    spinningRef.current = true

    const canvas = canvasRef.current
    velRef.current = 0.25 + Math.random() * 0.2
    const targetIndex = Math.floor(Math.random() * items.length)
    // Compute target angle so that targetIndex slice points up (at -PI/2)
    const totalSpins = 5 + Math.random() * 3
    const targetAngle = -(targetIndex * sliceAngle) - Math.PI / 2 - sliceAngle / 2 + totalSpins * 2 * Math.PI

    let current = angleRef.current
    const startAngle = current
    const distance = targetAngle - (startAngle % (2 * Math.PI)) + 2 * Math.PI * Math.ceil(totalSpins)
    let elapsed = 0
    const duration = 4000 + Math.random() * 1000

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 4)
    }

    let lastTime = null
    function animate(ts) {
      if (!lastTime) lastTime = ts
      const dt = ts - lastTime
      lastTime = ts
      elapsed += dt

      const t = Math.min(elapsed / duration, 1)
      const angle = startAngle + distance * easeOut(t)
      angleRef.current = angle
      draw(canvas, angle)

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        spinningRef.current = false
        onSpinEnd(items[targetIndex])
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [spinning])

  return (
    <div className="wheel-container">
      {/* Pointer */}
      <div className="wheel-pointer">▼</div>
      <canvas ref={canvasRef} width={300} height={300} className="wheel-canvas" />
    </div>
  )
}

export default function SpinWheel({ days, onApplyCombo, spinDay, setSpinDay }) {
  const [mode, setMode] = useState('breakfast') // 'breakfast' or 'combo'
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [comboResult, setComboResult] = useState(null)
  const [spinCount, setSpinCount] = useState(0)
  const [applyDay, setApplyDay] = useState(spinDay || days[0])

  const wheelItems = mode === 'breakfast' ? BREAKFASTS : BREAKFASTS

  function spin() {
    setResult(null)
    setComboResult(null)
    setSpinning(false)
    setTimeout(() => setSpinning(true), 50)
    setSpinCount(c => c + 1)
  }

  function handleSpinEnd(item) {
    setSpinning(false)
    if (mode === 'breakfast') {
      setResult(item)
    } else {
      // Pick random lunch and dinner too
      const lunch = LUNCHES[Math.floor(Math.random() * LUNCHES.length)]
      const dinner = DINNERS[Math.floor(Math.random() * DINNERS.length)]
      setComboResult({ Breakfast: item, Lunch: lunch, Dinner: dinner })
    }
  }

  function applyResult() {
    if (mode === 'breakfast' && result) {
      onApplyCombo(applyDay, { Breakfast: result })
    } else if (comboResult) {
      onApplyCombo(applyDay, comboResult)
    }
  }

  return (
    <div className="spin-panel">
      <div className="spin-header">
        <h2 className="suggestion-title">🎲 Can't Decide? Let Fate Choose!</h2>
        <p className="suggestion-sub">Spin the wheel for a meal — once a week, let the universe plan your food</p>
      </div>

      <div className="spin-controls">
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'breakfast' ? 'active' : ''}`}
            onClick={() => { setMode('breakfast'); setResult(null); setComboResult(null) }}
          >
            🥞 Breakfast Pick
          </button>
          <button
            className={`mode-btn ${mode === 'combo' ? 'active' : ''}`}
            onClick={() => { setMode('combo'); setResult(null); setComboResult(null) }}
          >
            🍱 Full Day Combo
          </button>
        </div>

        <div className="spin-day-row">
          <span className="apply-label">Spin day:</span>
          <select
            className="day-select"
            value={applyDay}
            onChange={e => { setApplyDay(e.target.value); setSpinDay(e.target.value) }}
          >
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="wheel-area">
        <SpinWheelCanvas
          key={spinCount}
          items={BREAKFASTS}
          spinning={spinning}
          result={result}
          onSpinEnd={handleSpinEnd}
        />
        <button className="spin-btn" onClick={spin} disabled={spinning}>
          {spinning ? 'Spinning…' : '🎲 Spin!'}
        </button>
      </div>

      {(result || comboResult) && !spinning && (
        <div className="spin-result">
          {mode === 'breakfast' && result && (
            <div className="result-card">
              <p className="result-emoji">🎉</p>
              <p className="result-meal">Breakfast: <strong>{result}</strong></p>
              <div className="result-actions">
                <select className="day-select" value={applyDay} onChange={e => setApplyDay(e.target.value)}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button className="apply-result-btn" onClick={applyResult}>Apply to {applyDay}</button>
              </div>
            </div>
          )}
          {mode === 'combo' && comboResult && (
            <div className="result-card">
              <p className="result-emoji">🎉</p>
              <div className="combo-meals">
                {Object.entries(comboResult).map(([meal, name]) => (
                  <p key={meal} className="result-meal"><span className="meal-label-sm">{meal}:</span> <strong>{name}</strong></p>
                ))}
              </div>
              <div className="result-actions">
                <select className="day-select" value={applyDay} onChange={e => setApplyDay(e.target.value)}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button className="apply-result-btn" onClick={applyResult}>Apply full day to {applyDay}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
