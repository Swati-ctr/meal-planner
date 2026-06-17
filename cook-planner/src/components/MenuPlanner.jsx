import { useState } from 'react'
import AudioNote from './AudioNote'
import axios from "axios"
import { useEffect } from "react"


const QUANTITY_CONFIG = {
  chapati: { unit: 'pieces', placeholder: 'No. of chapatis', step: 1, default: 6 },
  roti: { unit: 'pieces', placeholder: 'No. of rotis', step: 1, default: 6 },
  rice: { unit: 'cups', placeholder: 'Cups of rice', step: 0.5, default: 2 },
  idli: { unit: 'pieces', placeholder: 'No. of idlis', step: 2, default: 8 },
  dosa: { unit: 'pieces', placeholder: 'No. of dosas', step: 1, default: 4 },
  poha: { unit: 'cups', placeholder: 'Cups of poha', step: 0.5, default: 2 },
  upma: { unit: 'cups', placeholder: 'Cups of rava', step: 0.5, default: 2 },
  dal: { unit: 'cups', placeholder: 'Cups of dal', step: 0.5, default: 1.5 },
  khichdi: { unit: 'cups', placeholder: 'Cups of rice+dal', step: 0.5, default: 2 },
  pasta: { unit: 'cups', placeholder: 'Cups of pasta', step: 0.5, default: 2 },
  eggs: { unit: 'pieces', placeholder: 'No. of eggs', step: 1, default: 4 },
  paratha: { unit: 'pieces', placeholder: 'No. of parathas', step: 1, default: 4 },
  puri: { unit: 'pieces', placeholder: 'No. of puris', step: 2, default: 8 },
  naan: { unit: 'pieces', placeholder: 'No. of naans', step: 1, default: 4 },
}

function detectQuantityItems(mealText) {
  if (!mealText) return []
  const text = mealText.toLowerCase()
  const found = []
  for (const [key, cfg] of Object.entries(QUANTITY_CONFIG)) {
    if (text.includes(key)) found.push({ key, ...cfg })
  }
  return found
}


function QuantityFields({ meal, quantities, onChange }) {
  const items = detectQuantityItems(meal)
  if (items.length === 0) return null

  return (
    <div className="qty-fields">
      {items.map(item => (
        <div key={item.key} className="qty-field-row">
          <label className="qty-field-label">{item.placeholder}:</label>
          <div className="qty-field-input-wrap">
            <button className="qty-stepper" onClick={() => {
              const cur = quantities[item.key] ?? item.default
              onChange(item.key, Math.max(item.step, +(cur - item.step).toFixed(1)))
            }}>−</button>
            <input
              type="number"
              className="qty-field-input"
              min={item.step}
              step={item.step}
              value={quantities[item.key] ?? item.default}
              onChange={e => onChange(item.key, +e.target.value)}
            />
            <button className="qty-stepper" onClick={() => {
              const cur = quantities[item.key] ?? item.default
              onChange(item.key, +(cur + item.step).toFixed(1))
            }}>+</button>
            <span className="qty-unit">{item.unit}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MenuPlanner({ menuData, setMenuData, days, meals }) {

useEffect(() => {
  async function fetchActivePlan() {
    const token = localStorage.getItem("token")

    try {
      const res = await axios.get(
  "https://meal-planner-jvf1.onrender.com/api/weekly-plans/active",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const plan = res.data?.plan

      if (plan?.menuData) {
        setMenuData(prev => ({
          ...prev,
          ...plan.menuData
        }))
      }

    } catch (err) {
      console.log("Load error:", err)
    }
  }

  fetchActivePlan()
}, [])
  function update(day, field, value) {
    setMenuData(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

const handleShareWhatsApp = () => {
  if (!menuData || !days || !meals) return;

  const link = "https://meal-planner-sigma-bay.vercel.app/meal-plan/active";

let message = "🍱 *My Weekly Meal Plan*\n\n";
 days.forEach(day => {
    message += `📅 ${day}\n`;

    meals.forEach(meal => {
      const value = menuData?.[day]?.[meal];
      if (value) {
        message += `- ${meal}: ${value}\n`;
      }
    });

    message += "\n";
  });

  message += `👉 View full plan: ${link}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank");
}

  function updateQty(day, meal, key, value) {
    setMenuData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        quantities: {
          ...(prev[day].quantities || {}),
          [meal]: {
            ...((prev[day].quantities || {})[meal] || {}),
            [key]: value
          }
        }
      }
    }))
  }

  function saveAudio(day, field, url) {
    setMenuData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        audios: { ...(prev[day].audios || {}), [field]: url }
      }
    }))
  }

  function deleteAudio(day, field) {
    setMenuData(prev => {
      const audios = { ...(prev[day].audios || {}) }
      delete audios[field]
      return { ...prev, [day]: { ...prev[day], audios } }
    })
  }

  return (  
    <div>
      <div className="top-bar">
      <p className="section-label">Mon – Sat meal plan</p>

      <button className="share-btn" onClick={handleShareWhatsApp}>
        Share on WhatsApp 📲
      </button>
    </div>
      <p className="section-label">Mon – Sat meal plan</p>

    
      {days.map(day => (
        <div key={day} className="day-card">
          <div className="day-header">
            <span className="day-label">{day}</span>
          </div>
          <div className="meal-grid">
            {meals.map(meal => (
              <div key={meal} className="meal-block">
                <div className="meal-row">
                  <span className="meal-type">{meal}</span>
                  <input
                    className="meal-input"
                    type="text"
                    placeholder={placeholders[meal]}
                    value={menuData?.[day]?.[meal] || ""}
                    onChange={e => update(day, meal, e.target.value)}
                  />
                </div>
                <QuantityFields
                  meal={menuData?.[day]?.[meal] || ""}
                  quantities={(menuData?.[day]?.quantities || {})[meal] || {}}
                  onChange={(key, val) => updateQty(day, meal, key, val)}
                />
              </div>
            ))}
          </div>

          <div className="note-audio-row">
            <textarea
              className="note-input"
              rows={1}
              placeholder="Notes for cook (spice level, allergies, preferences…)"
              value={menuData?.[day]?.note || ""}       
       onChange={e => update(day, 'note', e.target.value)}
            />
            <AudioNote
              label={`Voice note for ${day}`}
              audioUrl={menuData?.[day]?.audios?.note || ""}
              onSave={(url) => saveAudio(day, 'note', url)}
              onDelete={() => deleteAudio(day, 'note')}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const placeholders = {
  Breakfast: 'e.g. idli sambar, poha, upma…',
  Lunch: 'e.g. rice, dal, sabzi, roti…',
  Dinner: 'e.g. chapati, paneer curry…',
}