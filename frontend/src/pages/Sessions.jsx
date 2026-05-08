import { useState, useEffect } from 'react'
import api from '../lib/api'
import { Clock, Plus, Pencil, Trash2, X, CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react'

const EMPTY = { subject: '', starting_time: '', ending_time: '', duration: '', note: '', is_complete: false }

function SessionModal({ session, onClose, onSave }) {
  const [form, setForm] = useState(session || EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (session?.id) {
        const { data } = await api.put(`/sessions/${session.id}`, form)
        onSave(data, 'update')
      } else {
        const { data } = await api.post('/sessions/', form)
        onSave(data, 'create')
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save session')
    } finally {
      setLoading(false)
    }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">{session?.id ? 'Edit Session' : 'New Session'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={15} />{error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Subject</label>
            <input required value={form.subject} onChange={e => f('subject', e.target.value)}
              placeholder="e.g. Mathematics" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">Start Time</label>
              <input required type="datetime-local" value={form.starting_time} onChange={e => f('starting_time', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">End Time</label>
              <input required type="datetime-local" value={form.ending_time} onChange={e => f('ending_time', e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Duration (hours)</label>
            <input required type="number" step="0.1" min="0" value={form.duration} onChange={e => f('duration', e.target.value)}
              placeholder="e.g. 1.5" className="input-field" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Notes</label>
            <textarea rows={3} value={form.note} onChange={e => f('note', e.target.value)}
              placeholder="What did you study?" className="input-field resize-none" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => f('is_complete', !form.is_complete)}
              className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${form.is_complete ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 bg-white/5'}`}>
              {form.is_complete && <CheckCircle2 size={13} className="text-white" />}
            </div>
            <span className="text-slate-300 text-sm">Mark as completed</span>
          </label>
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin" />Saving...</> : (session?.id ? 'Update Session' : 'Create Session')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | {} | session obj
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    api.get('/sessions/').then(r => setSessions(r.data)).finally(() => setLoading(false))
  }, [])

  const handleSave = (data, type) => {
    if (type === 'create') setSessions(p => [data, ...p])
    else setSessions(p => p.map(s => s.id === data.id ? data : s))
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await api.delete(`/sessions/${id}`)
      setSessions(p => p.filter(s => s.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-2"><Clock className="text-violet-400" size={24} />Study Sessions</h1>
          <p className="text-slate-400 text-sm mt-1">{sessions.length} total sessions</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all shadow-lg shadow-violet-500/20">
          <Plus size={16} /> New Session
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Clock size={48} className="text-slate-700 mb-4" />
          <p className="text-slate-400 font-medium">No sessions yet</p>
          <p className="text-slate-600 text-sm mt-1">Log your first study session to track progress</p>
          <button onClick={() => setModal({})} className="mt-4 flex items-center gap-2 bg-violet-600/20 border border-violet-500/20 text-violet-300 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-violet-600/30 transition-colors">
            <Plus size={15} /> Create Session
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sessions.map(s => (
            <div key={s.id} className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all duration-200 group flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <span className="text-violet-300 font-bold text-sm">{s.subject[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{s.subject}</p>
                    <p className="text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg shrink-0 ${s.is_complete ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {s.is_complete ? <CheckCircle2 size={11} /> : <Circle size={11} />}
                  {s.is_complete ? 'Done' : 'Active'}
                </span>
              </div>
              {s.note && <p className="text-slate-400 text-xs line-clamp-2 bg-white/3 rounded-lg px-3 py-2">{s.note}</p>}
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-300 text-sm font-medium flex items-center gap-1.5">
                  <Clock size={13} className="text-violet-400" /> {s.duration}h
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    {deleting === s.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <SessionModal session={modal?.id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  )
}
