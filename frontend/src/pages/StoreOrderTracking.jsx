import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, Navigation, RefreshCw } from 'lucide-react'
import { api } from '../api'
import OrderLocationMap from '../components/OrderLocationMap'

const REFRESH_MS = 10000

const formatTime = (value) => {
  if (!value) return '—'
  const date = new Date(value.replace(' ', 'T') + 'Z')
  return isNaN(date) ? value : date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const buttonClass =
  'inline-flex items-center justify-center whitespace-nowrap min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl font-semibold transition duration-200 hover:opacity-90 active:scale-[0.98]'

export default function StoreOrderTracking() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [needsLogin, setNeedsLogin] = useState(false)
  const [checking, setChecking] = useState(false)
  const [route, setRoute] = useState(null)

  const load = useCallback(() => {
    setChecking(true)
    return api.storeOrderLocation(id)
      .then(res => {
        setData(res)
        setError('')
        setNeedsLogin(false)
      })
      .catch(err => {
        if (err.status === 401 || err.status === 403) setNeedsLogin(true)
        else setError(err.data?.error || err.message || 'Could not load live location.')
      })
      .finally(() => {
        setLoading(false)
        setChecking(false)
      })
  }, [id])

  useEffect(() => {
    load()
    const timer = setInterval(load, REFRESH_MS)
    return () => clearInterval(timer)
  }, [load])

  useEffect(() => {
    api.storeOrderRoute(id)
      .then(setRoute)
      .catch(() => setRoute(null))
  }, [id])

  if (needsLogin) {
    return (
      <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6 pb-12">
        <div className="mx-auto w-full max-w-md min-w-0 pt-10">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 text-center space-y-4">
            <p className="text-white font-semibold break-words">Please sign in to track this order.</p>
            <Link to="/store-auth" style={{ backgroundColor: '#8F5A1D' }} className={`${buttonClass} w-full sm:w-auto font-bold tracking-wider text-white`}>
              SIGN IN
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const latest = data?.latest
  const history = data?.history || []

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 sm:space-y-6 pb-12">
      <div className="mx-auto w-full max-w-5xl min-w-0 space-y-4 sm:space-y-6">
        <Link to="/store/orders" className={`${buttonClass} w-fit text-blue-300`}>
          <ArrowLeft size={15} /> Back to Orders
        </Link>

        <div className="bg-slate-800 border border-slate-700 p-4 sm:p-6 rounded-2xl flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white tracking-wide flex flex-wrap items-center gap-2">
              <Navigation className="text-blue-400 shrink-0" size={22} /> Live Delivery Tracker
            </h2>
            <p className="text-xs text-slate-300 mt-1 break-words">
              {data?.order_number ? `Order ${data.order_number}` : 'Tracking your order'} · updates every 10 seconds
            </p>
          </div>
          <button
            onClick={load}
            disabled={checking}
            className={`${buttonClass} w-full sm:w-auto gap-2 border border-blue-500/30 text-blue-300 hover:bg-blue-500/10 disabled:opacity-50`}
          >
            <RefreshCw size={14} className={checking ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {error && (
          <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl break-words">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="min-w-0 bg-slate-800 border border-slate-700 rounded-2xl p-3 sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white min-w-0">
                  <MapPin size={16} className="text-blue-400 shrink-0" />
                  Store → Customer · rider route
                </p>
                {latest && (
                  <p className="flex min-w-0 items-center gap-1.5 text-xs text-slate-300 truncate" title={`Last update ${formatTime(latest.recorded_at)}`}>
                    <Clock size={13} className="shrink-0" /> Last update {formatTime(latest.recorded_at)}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
                <p className="min-w-0 break-words text-slate-300">
                  <span className="font-semibold text-emerald-300">Store:</span> {route?.store?.address || data?.store?.address || '—'}
                </p>
                <p className="min-w-0 break-words text-slate-300">
                  <span className="font-semibold text-red-300">Deliver to:</span> {route?.destination?.address || data?.destination?.address || '—'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-3 text-[11px] text-slate-300">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" /> Store</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" /> Customer</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" /> Rider</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-blue-500 shrink-0" /> Route</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 bg-amber-500 shrink-0" /> Rider trail</span>
              </div>
              <OrderLocationMap
                history={history}
                route={route?.route || []}
                origin={route?.store || data?.store}
                destination={route?.destination || data?.destination}
                className="h-[280px] w-full sm:h-[360px] lg:h-[440px] rounded-xl overflow-hidden border border-slate-700"
              />
              {!latest && (
                <p className="text-center text-xs text-slate-400 mt-3 break-words">
                  The rider has not shared a location yet. The store and customer pins are shown above.
                </p>
              )}
              {route?.source === 'direct' && (
                <p className="text-center text-xs text-slate-400 mt-3 break-words">
                  Road routing is unavailable, so a direct line between the pins is shown.
                </p>
              )}
            </div>

            {history.length > 1 && (
              <div className="min-w-0 bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Recent location updates</h3>
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {[...history].reverse().slice(0, 8).map((ping, idx) => (
                    <div key={`${ping.recorded_at}-${idx}`} className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 border-b border-slate-700/70 pb-2">
                      <span className="min-w-0 truncate font-mono" title={`${Number(ping.latitude).toFixed(5)}, ${Number(ping.longitude).toFixed(5)}`}>
                        {Number(ping.latitude).toFixed(5)}, {Number(ping.longitude).toFixed(5)}
                      </span>
                      <span className="min-w-0 truncate" title={formatTime(ping.recorded_at)}>{formatTime(ping.recorded_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
