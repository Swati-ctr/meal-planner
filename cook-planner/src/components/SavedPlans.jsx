import { useState, useEffect, useCallback } from 'react'
import { weeklyPlansApi } from '../api'

export default function SavedPlans({ menuData, groceryItems, onLoad }) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [renameId, setRenameId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [msg, setMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchPlans = useCallback(async () => {
    try {
      const { data } = await weeklyPlansApi.getAll()
      setPlans(data.plans)
    } catch {
      setMsg('❌ Failed to load saved plans')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  function flash(message) {
    setMsg(message)
    setTimeout(() => setMsg(''), 3000)
  }

  async function savePlan() {
    const name = newPlanName.trim() || `Plan – ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
    setSaving(true)
    try {
      await weeklyPlansApi.create({ name, menuData, groceryItems })
      setNewPlanName('')
      flash('✅ Plan saved!')
      fetchPlans()
    } catch {
      flash('❌ Failed to save plan')
    } finally {
      setSaving(false)
    }
  }

  async function loadPlan(plan) {
    try {
      const { data } = await weeklyPlansApi.getById(plan._id)
      await weeklyPlansApi.activate(plan._id)
      onLoad(data.plan.menuData, data.plan.groceryItems)
      flash(`✅ Loaded "${plan.name}"`)
      fetchPlans()
    } catch {
      flash('❌ Failed to load plan')
    }
  }

  async function overwritePlan(plan) {
    try {
      await weeklyPlansApi.update(plan._id, { menuData, groceryItems })
      flash(`✅ "${plan.name}" overwritten`)
    } catch {
      flash('❌ Failed to overwrite plan')
    }
  }

  async function startRename(plan) {
    setRenameId(plan._id)
    setRenameValue(plan.name)
  }

  async function confirmRename(id) {
    if (!renameValue.trim()) return
    try {
      await weeklyPlansApi.rename(id, renameValue.trim())
      flash('✅ Renamed!')
      setRenameId(null)
      fetchPlans()
    } catch {
      flash('❌ Failed to rename')
    }
  }

  async function duplicatePlan(plan) {
    try {
      await weeklyPlansApi.duplicate(plan._id)
      flash(`✅ Duplicated "${plan.name}"`)
      fetchPlans()
    } catch {
      flash('❌ Failed to duplicate')
    }
  }

  async function deletePlan(id) {
    try {
      await weeklyPlansApi.delete(id)
      flash('✅ Plan deleted')
      setConfirmDelete(null)
      fetchPlans()
    } catch {
      flash('❌ Failed to delete')
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="saved-plans">
      <div className="sp-header">
        <h2 className="sp-title">📋 Saved Weekly Plans</h2>
        <p className="sp-sub">Save snapshots of your current menu to reuse anytime</p>
      </div>

      {/* Save current as new plan */}
      <div className="sp-save-row">
        <input
          type="text"
          className="sp-name-input"
          placeholder="Plan name (e.g. Monsoon Week, Diet Plan…)"
          value={newPlanName}
          onChange={e => setNewPlanName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && savePlan()}
        />
        <button className="sp-save-btn" onClick={savePlan} disabled={saving}>
          {saving ? 'Saving…' : '💾 Save Current Plan'}
        </button>
      </div>

      {msg && <div className="sp-msg">{msg}</div>}

      {loading ? (
        <div className="sp-loading">Loading plans…</div>
      ) : plans.length === 0 ? (
        <div className="sp-empty">
          <p>No saved plans yet.</p>
          <p className="sp-empty-sub">Fill in your weekly menu above and save it here!</p>
        </div>
      ) : (
        <div className="sp-list">
          {plans.map(plan => (
            <div key={plan._id} className={`sp-card ${plan.isActive ? 'sp-active' : ''}`}>
              <div className="sp-card-main">
                {renameId === plan._id ? (
                  <div className="sp-rename-row">
                    <input
                      className="sp-rename-input"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && confirmRename(plan._id)}
                      autoFocus
                    />
                    <button className="sp-rename-confirm" onClick={() => confirmRename(plan._id)}>✓</button>
                    <button className="sp-rename-cancel" onClick={() => setRenameId(null)}>✕</button>
                  </div>
                ) : (
                  <div className="sp-card-info">
                    <span className="sp-plan-name">
                      {plan.isActive && <span className="sp-active-badge">Active</span>}
                      {plan.name}
                    </span>
                    <span className="sp-plan-date">Saved {formatDate(plan.updatedAt)}</span>
                  </div>
                )}
              </div>

              <div className="sp-card-actions">
                <button className="sp-action-btn sp-load" onClick={() => loadPlan(plan)} title="Load this plan">
                  📂 Load
                </button>
                <button className="sp-action-btn sp-overwrite" onClick={() => overwritePlan(plan)} title="Overwrite with current menu">
                  🔄 Update
                </button>
                <button className="sp-action-btn sp-rename-btn" onClick={() => startRename(plan)} title="Rename">
                  ✏️
                </button>
                <button className="sp-action-btn sp-dup" onClick={() => duplicatePlan(plan)} title="Duplicate">
                  📑
                </button>
                {confirmDelete === plan._id ? (
                  <>
                    <button className="sp-action-btn sp-delete-confirm" onClick={() => deletePlan(plan._id)}>
                      Yes, delete
                    </button>
                    <button className="sp-action-btn sp-delete-cancel" onClick={() => setConfirmDelete(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="sp-action-btn sp-delete" onClick={() => setConfirmDelete(plan._id)} title="Delete">
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
