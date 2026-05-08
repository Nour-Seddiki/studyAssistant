import { useState, useEffect } from 'react'
import api from '../lib/api'
import { History, Brain, Search, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/ai/history').then(r => setHistory(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = history.filter(h =>
    h.question.toLowerCase().includes(search.toLowerCase()) ||
    h.response.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-2"><History className="text-violet-400" size={24} />AI History</h1>
          <p className="text-slate-400 text-sm mt-1">{history.length} interactions</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search history..."
            className="bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm w-64 focus:outline-none focus:border-violet-500/50 transition-all" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Brain size={48} className="text-slate-700 mb-4" />
          <p className="text-slate-400 font-medium">{search ? 'No matching results' : 'No AI history yet'}</p>
          <p className="text-slate-600 text-sm mt-1">{search ? 'Try a different search' : 'Start chatting with the AI assistant'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(h => {
            const open = expanded === h.id
            return (
              <div key={h.id} className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all">
                <button onClick={() => setExpanded(open ? null : h.id)} className="w-full flex items-center gap-4 p-4 text-left">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <Brain size={14} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium line-clamp-1">{h.question}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{new Date(h.timestamp).toLocaleString()}</p>
                  </div>
                  {open ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                </button>
                {open && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="border-t border-white/5 pt-4">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">Question</div>
                      <p className="text-slate-300 text-sm mb-4 bg-white/3 rounded-xl p-3">{h.question}</p>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">AI Response</div>
                      <div className="text-slate-300 text-sm bg-white/3 rounded-xl p-3 prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{h.response}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
