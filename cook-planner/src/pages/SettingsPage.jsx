import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api'

const ALLERGY_OPTIONS = [
  { value: 'gluten', label: '🌾 Gluten' },
  { value: 'dairy', label: '🥛 Dairy' },
  { value: 'nuts', label: '🥜 Nuts' },
  { value: 'shellfish', label: '🦐 Shellfish' },
  { value: 'eggs', label: '🥚 Eggs' },
  { value: 'soy', label: '🫘 Soy' },
  { value: 'fish', label: '🐟 Fish' },
  { value: 'sesame', label: '🌿 Sesame' },
]

const DIET_OPTIONS = [
  { value: 'vegetarian', label: '🥦 Vegetarian' },
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'jain', label: '🙏 Jain' },
  { value: 'no-onion-garlic', label: '🧅 No Onion/Garlic' },
  { value: 'gluten-free', label: '🌾 Gluten-Free' },
  { value: 'low-carb', label: '🥩 Low Carb' },
]

export default function SettingsPage() {
  const { user, updateUser } = useAuth()

  const [profile, setProfile] = useState({
    name: user?.name || '',
    cookName: user?.cookName || '',
    cookPhone: user?.cookPhone || '',
    allergies: user?.allergies || [],
    dietaryPreferences: user?.dietaryPreferences || [],
  })
  const [profileMsg, setProfileMsg] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  function toggleAllergy(value) {
    setProfile(p => ({
      ...p,
      allergies: p.allergies.includes(value)
        ? p.allergies.filter(a => a !== value)
        : [...p.allergies, value]
    }))
  }

  function toggleDiet(value) {
    setProfile(p => ({
      ...p,
      dietaryPreferences: p.dietaryPreferences.includes(value)
        ? p.dietaryPreferences.filter(d => d !== value)
        : [...p.dietaryPreferences, value]
    }))
  }

  async function saveProfile(e) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg('')
    try {
      await updateUser(profile)
      setProfileMsg('✅ Profile saved successfully!')
    } catch (err) {
      setProfileMsg('❌ ' + (err.response?.data?.message || 'Error saving profile'))
    } finally {
      setProfileLoading(false)
    }
  }

  async function changePassword(e) {
    e.preventDefault()
    setPwMsg('')
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg('❌ Passwords do not match')
      return
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg('❌ Password must be at least 6 characters')
      return
    }
    setPwLoading(true)
    try {
      await authApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      setPwMsg('✅ Password changed successfully!')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      setPwMsg('❌ ' + (err.response?.data?.message || 'Error changing password'))
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="settings-page">
      {/* Profile Section */}
      <form onSubmit={saveProfile} className="settings-card">
        <h2 className="settings-section-title">👤 Your Profile</h2>

        <div className="settings-field">
          <label>Your Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            placeholder="Your full name"
          />
        </div>

        <h3 className="settings-subsection">🧑‍🍳 Cook Profile</h3>
        <p className="settings-help">Used for WhatsApp sharing with your cook</p>

        <div className="settings-row">
          <div className="settings-field">
            <label>Cook's Name</label>
            <input
              type="text"
              value={profile.cookName}
              onChange={e => setProfile(p => ({ ...p, cookName: e.target.value }))}
              placeholder="e.g. Ramesh"
            />
          </div>
          <div className="settings-field">
            <label>Cook's WhatsApp</label>
            <input
              type="tel"
              value={profile.cookPhone}
              onChange={e => setProfile(p => ({ ...p, cookPhone: e.target.value }))}
              placeholder="e.g. 919876543210"
            />
          </div>
        </div>

        <h3 className="settings-subsection">🚫 Allergy Preferences</h3>
        <p className="settings-help">These will be noted in meal suggestions</p>
        <div className="tag-grid">
          {ALLERGY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`tag-btn ${profile.allergies.includes(opt.value) ? 'active' : ''}`}
              onClick={() => toggleAllergy(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <h3 className="settings-subsection">🥗 Dietary Preferences</h3>
        <div className="tag-grid">
          {DIET_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`tag-btn ${profile.dietaryPreferences.includes(opt.value) ? 'active' : ''}`}
              onClick={() => toggleDiet(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {profileMsg && <p className="settings-msg">{profileMsg}</p>}
        <button type="submit" className="settings-save-btn" disabled={profileLoading}>
          {profileLoading ? 'Saving…' : 'Save Profile'}
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={changePassword} className="settings-card">
        <h2 className="settings-section-title">🔒 Change Password</h2>

        <div className="settings-field">
          <label>Current Password</label>
          <input
            type="password"
            value={pwForm.currentPassword}
            onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
            placeholder="Enter current password"
            required
          />
        </div>
        <div className="settings-field">
          <label>New Password</label>
          <input
            type="password"
            value={pwForm.newPassword}
            onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
            placeholder="Min 6 characters"
            required
          />
        </div>
        <div className="settings-field">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={pwForm.confirm}
            onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
            placeholder="Repeat new password"
            required
          />
        </div>

        {pwMsg && <p className="settings-msg">{pwMsg}</p>}
        <button type="submit" className="settings-save-btn" disabled={pwLoading}>
          {pwLoading ? 'Changing…' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}
