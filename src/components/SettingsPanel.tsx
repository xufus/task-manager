import { useState } from 'react'
import type { AppSettings } from '../types'

interface Props {
  settings: AppSettings
  onUpdate: (updates: Partial<AppSettings>) => void
  onClose: () => void
}

export default function SettingsPanel({ settings, onUpdate, onClose }: Props) {
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-5 w-96" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">设置</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Claude API Key
            </label>
            <div className="flex gap-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="px-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
              >{showKey ? '隐藏' : '显示'}</button>
            </div>
            <p className="text-xs text-gray-400 mt-1">用于 AI 日报和周报功能，保存在本地浏览器</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">主题</label>
            <select
              value={settings.theme}
              onChange={e => onUpdate({ theme: e.target.value as AppSettings['theme'] })}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none"
            >
              <option value="system">跟随系统</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => { onUpdate({ apiKey }); onClose() }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >保存</button>
          <button onClick={onClose} className="flex-1 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg py-2 text-sm transition-colors text-gray-700 dark:text-gray-300">
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
