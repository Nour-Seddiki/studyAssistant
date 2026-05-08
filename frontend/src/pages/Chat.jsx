import { useState, useRef, useEffect } from 'react'
import api from '../lib/api'
import { Brain, Send, Loader2, FileText, HelpCircle, Layers, Trash2, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const MODES = [
  { id: 'questions', label: 'Ask a Question', icon: HelpCircle, color: 'violet', description: 'Get answers to your study questions' },
  { id: 'summary', label: 'Summarize Text', icon: FileText, color: 'indigo', description: 'Paste text to get a concise summary' },
  { id: 'quizzes', label: 'Generate Quiz', icon: Layers, color: 'pink', description: 'Turn content into flashcards' },
]

const colors = {
  violet: { tab: 'border-violet-500 text-violet-300', bg: 'from-violet-600/20 to-indigo-600/20', border: 'border-violet-500/20', btn: 'from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500', icon: 'text-violet-400' },
  indigo: { tab: 'border-indigo-500 text-indigo-300', bg: 'from-indigo-600/20 to-blue-600/20', border: 'border-indigo-500/20', btn: 'from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500', icon: 'text-indigo-400' },
  pink: { tab: 'border-pink-500 text-pink-300', bg: 'from-pink-600/20 to-rose-600/20', border: 'border-pink-500/20', btn: 'from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500', icon: 'text-pink-400' },
}

function Message({ msg }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  if (msg.role === 'user') return (
    <div className="flex justify-end">
      <div className="max-w-[75%] bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm">
        {msg.content}
      </div>
    </div>
  )
  return (
    <div className="flex gap-3 group">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
        <Brain size={14} className="text-violet-400" />
      </div>
      <div className="flex-1 max-w-[80%]">
        <div className="bg-slate-800/60 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-200 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
        <button onClick={copy} className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100">
          {copied ? <><Check size={11} />Copied</> : <><Copy size={11} />Copy</>}
        </button>
      </div>
    </div>
  )
}

export default function Chat() {
  const [mode, setMode] = useState('questions')
  const [question, setQuestion] = useState('')
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const current = MODES.find(m => m.id === mode)
  const c = colors[current.color]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const submit = async (e) => {
    e.preventDefault()
    if (!question.trim()) return
    const userMsg = mode === 'questions' ? question : `[${current.label}] ${question}`
    setMessages(p => [...p, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      let res
      if (mode === 'questions') {
        res = await api.post('/ai/questions', { question })
        setMessages(p => [...p, { role: 'ai', content: res.data.answer }])
      } else if (mode === 'summary') {
        res = await api.post('/ai/summary', { question, text })
        setMessages(p => [...p, { role: 'ai', content: res.data.summary }])
      } else {
        res = await api.post('/ai/quizzes', { question, text })
        setMessages(p => [...p, { role: 'ai', content: res.data.quizzes }])
      }
      setQuestion('')
      setText('')
    } catch {
      setMessages(p => [...p, { role: 'ai', content: '⚠️ Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold flex items-center gap-2">
          <Brain className="text-violet-400" size={24} /> AI Assistant
        </h1>
        <p className="text-slate-400 text-sm mt-1">Your intelligent study companion</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 flex-wrap">
        {MODES.map(m => {
          const cl = colors[m.color]
          const active = mode === m.id
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200
                ${active ? `border-b-2 ${cl.tab} bg-gradient-to-br ${cl.bg} ${cl.border}` : 'border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
              <m.icon size={15} className={active ? cl.icon : ''} />
              {m.label}
            </button>
          )
        })}
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors px-3 py-2 rounded-xl hover:bg-red-500/10">
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {/* Chat messages */}
      <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl p-4 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border} flex items-center justify-center mb-4`}>
              <current.icon size={28} className={c.icon} />
            </div>
            <p className="text-slate-300 font-semibold">{current.label}</p>
            <p className="text-slate-500 text-sm mt-1 max-w-xs">{current.description}</p>
          </div>
        )}
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center">
              <Brain size={14} className="text-violet-400" />
            </div>
            <div className="bg-slate-800/60 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 size={16} className="text-violet-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={submit} className="space-y-2">
        {(mode === 'summary' || mode === 'quizzes') && (
          <textarea
            value={text} onChange={e => setText(e.target.value)} rows={3}
            placeholder="Paste your text or notes here..."
            className="w-full bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all resize-none"
          />
        )}
        <div className="flex gap-3">
          <input
            value={question} onChange={e => setQuestion(e.target.value)}
            placeholder={mode === 'questions' ? 'Ask anything about your studies...' : 'Describe what you want...'}
            className="flex-1 bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
          />
          <button type="submit" disabled={loading || !question.trim()}
            className={`bg-gradient-to-r ${c.btn} disabled:opacity-40 text-white rounded-xl px-5 py-3 flex items-center gap-2 text-sm font-medium transition-all shadow-lg`}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  )
}
