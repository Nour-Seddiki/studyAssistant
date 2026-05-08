import { useState, useEffect } from 'react'
import api from '../lib/api'
import { ShieldCheck, Users, Clock, Trash2, Loader2, Search } from 'lucide-react'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [sessions, setSessions] = useState([])
  const [tab, setTab] = useState('users')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([api.get('/admin/users'), api.get('/admin/sessions')])
      .then(([u, s]) => { setUsers(u.data); setSessions(s.data) })
      .finally(() => setLoading(false))
  }, [])

  const deleteUser = async (id) => {
    setDeleting(`u-${id}`)
    try { await api.delete(`/admin/users/${id}`); setUsers(p => p.filter(u => u.id !== id)) }
    finally { setDeleting(null) }
  }

  const deleteSession = async (id) => {
    setDeleting(`s-${id}`)
    try { await api.delete(`/admin/sessions/${id}`); setSessions(p => p.filter(s => s.id !== id)) }
    finally { setDeleting(null) }
  }

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  const filteredSessions = sessions.filter(s => s.subject.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold flex items-center gap-2"><ShieldCheck className="text-amber-400" size={24} />Admin Panel</h1>
        <p className="text-slate-400 text-sm mt-1">{users.length} users &bull; {sessions.length} sessions</p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {[['users', Users, 'Users'], ['sessions', Clock, 'Sessions']].map(([id, Icon, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border
                ${tab === id ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 text-sm w-48 focus:outline-none focus:border-amber-500/50 transition-all" />
        </div>
      </div>

      {tab === 'users' && (
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-slate-400 font-medium px-5 py-3">User</th>
                <th className="text-left text-slate-400 font-medium px-5 py-3 hidden sm:table-cell">Role</th>
                <th className="text-left text-slate-400 font-medium px-5 py-3 hidden md:table-cell">Status</th>
                <th className="text-right text-slate-400 font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/20 flex items-center justify-center text-violet-300 font-bold text-xs shrink-0">
                        {u.username[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-200 font-medium">{u.username}</p>
                        <p className="text-slate-500 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${u.role === 'admin' ? 'bg-amber-500/15 text-amber-400' : 'bg-violet-500/15 text-violet-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`text-xs ${u.is_verified ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {u.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => deleteUser(u.id)} disabled={deleting === `u-${u.id}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      {deleting === `u-${u.id}` ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'sessions' && (
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-slate-400 font-medium px-5 py-3">Subject</th>
                <th className="text-left text-slate-400 font-medium px-5 py-3 hidden sm:table-cell">Duration</th>
                <th className="text-left text-slate-400 font-medium px-5 py-3 hidden md:table-cell">Status</th>
                <th className="text-right text-slate-400 font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSessions.map(s => (
                <tr key={s.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-slate-200 font-medium">{s.subject}</p>
                    <p className="text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-300 hidden sm:table-cell">{s.duration}h</td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`text-xs font-medium ${s.is_complete ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {s.is_complete ? 'Complete' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => deleteSession(s.id)} disabled={deleting === `s-${s.id}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      {deleting === `s-${s.id}` ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
