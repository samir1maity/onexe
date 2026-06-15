'use client'

import { useState } from 'react'
import { Percent, Gift, DollarSign, Loader2, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, Save } from 'lucide-react'

interface Settings {
  id: string
  taxEnabled: boolean
  taxPercentage: number
  referralReward: number
  registrationBonus: number
}

interface Props { settings: Settings }

export default function AdminSettingsClient({ settings: initial }: Props) {
  const [settings, setSettings] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const save = async () => {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) { setMsg({ type: 'error', text: data.error || 'Failed to save' }); return }
      setSettings(data.settings)
      setMsg({ type: 'success', text: 'Settings saved successfully!' })
      setTimeout(() => setMsg(null), 3000)
    } catch {
      setMsg({ type: 'error', text: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Configure global platform parameters</p>
      </div>

      {msg && (
        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* Tax Settings */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Percent className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Transfer Tax</h2>
            <p className="text-xs text-gray-400">Applied to user-to-user transfers when enabled</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-white/3 border border-white/5">
          <div>
            <p className="text-sm font-medium text-white">Tax Deduction</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {settings.taxEnabled ? 'Currently active — tax is deducted on all transfers' : 'Currently disabled — transfers have no tax'}
            </p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, taxEnabled: !settings.taxEnabled })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              settings.taxEnabled
                ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            {settings.taxEnabled
              ? <><ToggleRight className="w-5 h-5" /> ON</>
              : <><ToggleLeft className="w-5 h-5" /> OFF</>
            }
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Tax Percentage (%)</label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="number"
              className="input-dark pl-9"
              placeholder="e.g. 2.5"
              min="0"
              max="100"
              step="0.01"
              value={settings.taxPercentage}
              onChange={(e) => setSettings({ ...settings, taxPercentage: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {settings.taxEnabled
              ? `₹${settings.taxPercentage}% will be deducted from each transfer`
              : 'Tax is OFF — this value will be used when tax is enabled'}
          </p>
        </div>
      </div>

      {/* Referral Settings */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Gift className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Referral Reward</h2>
            <p className="text-xs text-gray-400">Amount given to referrer when referred user is approved</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Reward Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
            <input
              type="number"
              className="input-dark pl-7"
              placeholder="e.g. 50"
              min="0"
              step="0.001"
              value={settings.referralReward}
              onChange={(e) => setSettings({ ...settings, referralReward: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Added to wallet only — does not affect trading graph</p>
        </div>
      </div>

      {/* Registration Bonus */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Registration Bonus</h2>
            <p className="text-xs text-gray-400">Starting amount given to new users on approval</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Bonus Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
            <input
              type="number"
              className="input-dark pl-7"
              placeholder="e.g. 100"
              min="0"
              step="0.001"
              value={settings.registrationBonus}
              onChange={(e) => setSettings({ ...settings, registrationBonus: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Added to wallet when admin approves a new user</p>
        </div>
      </div>

      {/* Preview */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Settings Preview</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Tax Status', value: settings.taxEnabled ? 'Enabled' : 'Disabled', highlight: settings.taxEnabled },
            { label: 'Tax Rate', value: `${settings.taxPercentage}%` },
            { label: 'Referral Reward', value: `₹${settings.referralReward}` },
            { label: 'Reg. Bonus', value: `₹${settings.registrationBonus}` },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex justify-between p-3 rounded-xl bg-white/3 border border-white/5">
              <span className="text-xs text-gray-400">{label}</span>
              <span className={`text-xs font-semibold ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="btn-primary flex items-center justify-center gap-2" onClick={save} disabled={loading}>
        {loading
          ? <><Loader2 className="w-4 h-4 spinner" /> Saving...</>
          : <><Save className="w-4 h-4" /> Save Settings</>
        }
      </button>
    </div>
  )
}
