import { useState } from 'react'
import AudioNote from './AudioNote'

const CATS = {
  veg:   'Veg / Fruit',
  dairy: 'Dairy',
  meat:  'Meat / Fish',
  spice: 'Spice / Dal',
  other: 'Other',
}

let nextId = 1

export default function GroceryList({ items, setItems, groceryAudio, setGroceryAudio }) {
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [cat, setCat] = useState('veg')

  function addItem() {
    const trimmed = name.trim()
    if (!trimmed) return
    setItems(prev => [...prev, {
      id: nextId++,
      name: trimmed,
      qty: qty.trim() || '—',
      cat,
      checked: false,
    }])
    setName('')
    setQty('')
  }

  function toggle(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
  }

  function remove(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function speakList() {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const text = items.filter(i => !i.checked)
      .map(i => `${i.name}, ${i.qty === '—' ? '' : i.qty + ' ' + CATS[i.cat]}`)
      .join('. ')
    const utt = new SpeechSynthesisUtterance('Grocery list: ' + text)
    utt.lang = 'en-IN'
    utt.rate = 0.9
    window.speechSynthesis.speak(utt)
  }

  const pending = items.filter(i => !i.checked).length
  const done = items.filter(i => i.checked).length
  const sorted = [...items].sort((a, b) => a.checked - b.checked)

  return (
    <div className="grocery-section">
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{items.length}</div>
          <div className="stat-lbl">total items</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{pending}</div>
          <div className="stat-lbl">to buy</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{done}</div>
          <div className="stat-lbl">bought</div>
        </div>
      </div>

      <div className="grocery-voice-section">
        <p className="section-label">Voice instructions for cook</p>
        <div className="grocery-audio-row">
          <AudioNote
            label="Record grocery instructions"
            audioUrl={groceryAudio}
            onSave={(url) => setGroceryAudio(url)}
            onDelete={() => setGroceryAudio(null)}
          />
          {items.length > 0 && (
            <button className="tts-btn" onClick={speakList} title="Read list aloud">
              🔊 Read list aloud
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="section-label">Add item</p>
        <div className="add-row">
          <input
            type="text"
            placeholder="Item name (e.g. tomatoes)"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
          />
          <input
            className="qty-input"
            type="text"
            placeholder="Qty"
            value={qty}
            onChange={e => setQty(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
          />
          <select className="cat-select" value={cat} onChange={e => setCat(e.target.value)}>
            {Object.entries(CATS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button className="add-btn" onClick={addItem}>+ Add</button>
        </div>
      </div>

      <div>
        <p className="section-label">Shopping list</p>
        {items.length === 0 ? (
          <div className="empty-state">No items yet — add something above</div>
        ) : (
          <div className="grocery-list">
            {sorted.map(item => (
              <div key={item.id} className={`grocery-item ${item.checked ? 'done' : ''}`}>
                <input
                  type="checkbox"
                  className="grocery-checkbox"
                  checked={item.checked}
                  onChange={() => toggle(item.id)}
                  aria-label={`Mark ${item.name} as bought`}
                />
                <span className="item-name">{item.name}</span>
                <span className={`cat-badge cat-${item.cat}`}>{CATS[item.cat]}</span>
                <span className="item-qty">{item.qty}</span>
                <button className="del-btn" onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
