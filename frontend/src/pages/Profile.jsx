import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { User, Lock, CheckCircle2, AlertCircle, Shield, Mail, BadgeCheck } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.put('/user/password', passwords)
      setSuccess('Password updated successfully')
      setPasswords({ current_password: '', new_password: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold flex items-center gap-2"><User className="text-violet-400" size={24} />Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account settings</p>
      </div>

      {/* User info card */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-violet-500/20">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{user?.username}</h2>
            <p className="text-slate-400 text-sm capitalize flex items-center gap-1.5 mt-0.5">
              <Shield size={13} className="text-violet-400" /> {user?.role}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow icon={BadgeCheck} label="Status" value={user?.is_verified ? 'Verified' : 'Unverified'} valueClass={user?.is_verified ? 'text-emerald-400' : 'text-amber-400'} />
          <InfoRow icon={User} label="Member since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'} />
        </div>
      </div>

      {/* Change password */}
      <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
          <Lock size={18} className="text-violet-400" /> Change Password
        </h2>
        {success && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl px-4 py-3 mb-4">
            <CheckCircle2 size={15} />{success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={15} />{error}
          </div>
        )}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">Current Password</label>
            <input type="password" required value={passwords.current_password}
              onChange={e => setPasswords(p => ({ ...p, current_password: e.target.value }))}
              className="w-full bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all" />
          </div>
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1.5">New Password</label>
            <input type="password" required minLength={6} value={passwords.new_password}
              onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))}
              className="w-full bg-slate-800/60 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all" />
          </div>
          <button type="submit" disabled={loading}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold rounded-xl px-6 py-2.5 text-sm transition-all">
            {loading ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, valueClass = 'text-slate-200' }) {
  return (
    <div className="flex items-center gap-3 bg-white/3 rounded-xl px-4 py-3">
      <Icon size={15} className="text-slate-500 shrink-0" />
      <div>
        <p className="text-slate-500 text-xs">{label}</p>
        <p className={`text-sm font-medium mt-0.5 ${valueClass}`}>{value}</p>
      </div>
    </div>
  )
}
