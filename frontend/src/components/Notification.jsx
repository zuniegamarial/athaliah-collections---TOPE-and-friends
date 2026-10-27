import { useEffect } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

export default function Notification({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const styles = type === 'success'
    ? 'bg-green-50 border-green-400 text-green-900'
    : 'bg-red-50 border-red-400 text-red-900'
  const Icon = type === 'success' ? CheckCircle : AlertCircle

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-4 right-4 z-50 flex items-start gap-3 px-4 py-3 border-l-4 rounded shadow-lg ${styles}`}
    >
      <Icon size={20} aria-hidden="true" />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} aria-label="Dismiss notification" className="ml-2">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}