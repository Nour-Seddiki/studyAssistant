import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import {
  Clock, Brain, CheckCircle, TrendingUp, Zap, Calendar
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 flex items-start gap-4 hover:border-white/10 transition-all duration-200 group">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-white text-2xl font-bold mt-0.5 group-hover:text-violet-300 transition-colors">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/sessions/').catch(() => ({ data: [] })),
      api.get('/ai/history').catch(() => ({ data: [] })),
    ]).then(([s, h]) => {
      setSessions(s.data)
      setHistory(h.data)
    }).finally(() => setLoading(false))
  }, [])

  const totalHours = sessions.reduce((a, s) => a + (s.duration || 0), 0).toFixed(1)
  const completed = sessions.filter(s => s.is_complete).length
  const subjects = [...new Set(sessions.map(s => s.subject))].length
  const aiQueries = history.length
  const recent = sessions.slice(0, 5)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-3xl font-bold tracking-tight">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">{user?.username}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's your learning overview</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5">
          <Calendar size={15} className="text-violet-400" />
          <span className="text-slate-300 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Total Study Time" value={`${totalHours}h`} sub={`${sessions.length} sessions`} color="bg-gradient-to-br from-violet-600 to-violet-700" />
        <StatCard icon={CheckCircle} label="Completed" value={completed} sub={`of ${sessions.length} sessions`} color="bg-gradient-to-br from-emerald-600 to-emerald-700" />
        <StatCard icon={TrendingUp} label="Subjects" value={subjects} sub="unique topics" color="bg-gradient-to-br from-indigo-600 to-indigo-700" />
        <StatCard icon={Brain} label="AI Queries" value={aiQueries} sub="total interactions" color="bg-gradient-to-br from-pink-600 to-pink-700" />
      </div>

      {/* Recent sessions + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent sessions */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
            <Clock size={18} className="text-violet-400" /> Recent Sessions
          </h2>
          {recent.length === 0 ? (
            <div className="text-center py-10">
              <Clock size={36} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">No study sessions yet</p>
              <p className="text-slate-600 text-sm mt-1">Start tracking your study time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map(s => (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <span className="text-violet-300 font-bold text-xs">{s.subject[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium text-sm truncate">{s.subject}</p>
                    <p className="text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-slate-300 text-sm font-medium">{s.duration}h</span>
                    <div className={`text-xs mt-0.5 ${s.is_complete ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {s.is_complete ? 'Done' : 'In progress'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
            <Zap size={18} className="text-yellow-400" /> Quick Actions
          </h2>
          <div className="space-y-3">
            {[
              { href: '/chat', label: 'Ask AI a question', icon: Brain, gradient: 'from-violet-600/20 to-indigo-600/20', border: 'border-violet-500/20', text: 'text-violet-300', iconColor: 'text-violet-400' },
              { href: '/sessions', label: 'Log study session', icon: Clock, gradient: 'from-emerald-600/20 to-teal-600/20', border: 'border-emerald-500/20', text: 'text-emerald-300', iconColor: 'text-emerald-400' },
              { href: '/chat', label: 'Generate a quiz', icon: CheckCircle, gradient: 'from-pink-600/20 to-rose-600/20', border: 'border-pink-500/20', text: 'text-pink-300', iconColor: 'text-pink-400' },
            ].map(({ href, label, icon: Icon, gradient, border, text, iconColor }) => (
              <a key={href + label} href={href}
                className={`flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r ${gradient} border ${border} hover:opacity-80 transition-opacity`}>
                <Icon size={17} className={iconColor} />
                <span className={`text-sm font-medium ${text}`}>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
