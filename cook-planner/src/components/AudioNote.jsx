import { useState, useRef, useEffect } from 'react'

export default function AudioNote({ label = 'Voice note', audioUrl, onSave, onDelete }) {
  const [recording, setRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(!!audioUrl)
  const [localUrl, setLocalUrl] = useState(audioUrl || null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const mediaRef = useRef(null)
  const audioRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    if (audioUrl) { setLocalUrl(audioUrl); setHasRecording(true) }
  }, [audioUrl])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setLocalUrl(url)
        setHasRecording(true)
        onSave && onSave(url, blob)
        stream.getTracks().forEach(t => t.stop())
      }
      mediaRef.current = mr
      mr.start()
      setRecording(true)
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } catch (e) {
      alert('Microphone access denied. Please allow mic permissions.')
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    setRecording(false)
    clearInterval(timerRef.current)
  }

  function togglePlay() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  function deleteRecording() {
    setLocalUrl(null)
    setHasRecording(false)
    setPlaying(false)
    onDelete && onDelete()
  }

  function fmt(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  return (
    <div className="audio-note">
      {localUrl && (
        <audio
          ref={audioRef}
          src={localUrl}
          onEnded={() => setPlaying(false)}
          onLoadedMetadata={e => setDuration(Math.round(e.target.duration))}
          style={{ display: 'none' }}
        />
      )}

      {!hasRecording && !recording && (
        <button className="audio-record-btn" onClick={startRecording} title={label}>
          🎙️ <span>Record voice note</span>
        </button>
      )}

      {recording && (
        <div className="audio-recording">
          <span className="rec-dot" />
          <span className="rec-time">{fmt(elapsed)}</span>
          <button className="audio-stop-btn" onClick={stopRecording}>■ Stop</button>
        </div>
      )}

      {hasRecording && !recording && (
        <div className="audio-playback">
          <button className="audio-play-btn" onClick={togglePlay}>
            {playing ? '⏸' : '▶'}
          </button>
          <div className="audio-label">Voice note {duration > 0 ? `(${fmt(duration)})` : ''}</div>
          <button className="audio-del-btn" onClick={deleteRecording} title="Delete recording">🗑</button>
        </div>
      )}
    </div>
  )
}
