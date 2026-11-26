import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet'
import { STORE_LOCATION } from '../config'

const storeIcon = L.divIcon({
  className: 'order-location-pin',
  html: '<span style="display:flex;width:26px;height:26px;align-items:center;justify-content:center;border-radius:50%;background:#059669;border:3px solid white;box-shadow:0 2px 8px rgba(15,23,42,0.4);color:white;font-size:10px;font-weight:800;">S</span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const customerIcon = L.divIcon({
  className: 'order-location-pin',
  html: '<span style="display:flex;width:26px;height:26px;align-items:center;justify-content:center;border-radius:50%;background:#dc2626;border:3px solid white;box-shadow:0 2px 8px rgba(15,23,42,0.4);color:white;font-size:10px;font-weight:800;">C</span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const courierIcon = L.divIcon({
  className: 'order-location-pin',
  html: '<span style="display:flex;width:26px;height:26px;align-items:center;justify-content:center;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 2px 8px rgba(15,23,42,0.4);color:white;font-size:10px;font-weight:800;">R</span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const DEFAULT_CENTER = [STORE_LOCATION.latitude, STORE_LOCATION.longitude]

const normalizePoints = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map(p => Array.isArray(p) ? [Number(p[0]), Number(p[1])] : [Number(p.latitude), Number(p.longitude)])
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng))

function FitMap({ bounds }) {
  const map = useMap()
  const key = bounds.map(p => `${p[0]},${p[1]}`).join('|')

  useEffect(() => {
    if (bounds.length > 1) {
      const width = map.getSize().x
      const padding = width < 400 ? 12 : width < 768 ? 24 : 35
      map.fitBounds(bounds, { padding: [padding, padding], maxZoom: 16 })
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15)
    }
  }, [key, map])

  return null
}

function Recenter({ position }) {
  const map = useMap()
  const lat = position?.[0]
  const lng = position?.[1]

  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.8 })
    }
  }, [lat, lng, map])

  return null
}

export default function OrderLocationMap({
  history = [],
  route = [],
  origin = null,
  destination = null,
  height,
  className = 'h-[260px] w-full sm:h-[340px] lg:h-[420px]',
}) {
  const riderPoints = normalizePoints(history)
  const routePoints = normalizePoints(route)
  const storePoint = origin
    ? [Number(origin.latitude ?? origin[0]), Number(origin.longitude ?? origin[1])]
    : DEFAULT_CENTER
  const customerPoint = destination
    ? [Number(destination.latitude ?? destination[0]), Number(destination.longitude ?? destination[1])]
    : null
  const hasCustomerPoint = customerPoint && customerPoint.every(Number.isFinite)
  const latest = riderPoints.length ? riderPoints[riderPoints.length - 1] : storePoint
  const bounds = [storePoint, ...(hasCustomerPoint ? [customerPoint] : []), ...riderPoints, ...routePoints]
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng))

  return (
    <div
      className={`relative w-full max-w-full ${className}`}
      style={height ? { height, width: '100%' } : undefined}
    >
      <MapContainer
        key="order-location-map"
        center={latest}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          key="order-location-tiles"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker key="order-location-store" position={storePoint} icon={storeIcon}>
          <Tooltip direction="top" opacity={1}>Store: {origin?.address || STORE_LOCATION.address}</Tooltip>
        </Marker>
        {hasCustomerPoint && (
          <Marker
            key={`order-location-customer-${customerPoint[0]}-${customerPoint[1]}`}
            position={customerPoint}
            icon={customerIcon}
          >
            <Tooltip direction="top" opacity={1}>Customer: {destination?.address || 'Delivery pin'}</Tooltip>
          </Marker>
        )}
        {routePoints.length > 1 && (
          <Polyline
            key={`order-route-${routePoints.length}-${routePoints[0][0]}-${routePoints[0][1]}`}
            positions={routePoints}
            pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.8 }}
          />
        )}
        {riderPoints.length > 1 && (
          <Polyline
            key={`rider-trail-${riderPoints.length}-${latest[0]}-${latest[1]}`}
            positions={riderPoints}
            pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.9, dashArray: '7 7' }}
          />
        )}
        {riderPoints.length > 0 && (
          <Marker key={`rider-${latest[0]}-${latest[1]}`} position={latest} icon={courierIcon}>
            <Tooltip direction="top" opacity={1}>Rider location</Tooltip>
          </Marker>
        )}
        {hasCustomerPoint ? <FitMap bounds={bounds} /> : <Recenter position={latest} />}
      </MapContainer>
    </div>
  )
}
