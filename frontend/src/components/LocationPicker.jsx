import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet'
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

const storePosition = [STORE_LOCATION.latitude, STORE_LOCATION.longitude]

function MapClick({ onPick }) {
  useMapEvents({
    click(event) {
      onPick([event.latlng.lat, event.latlng.lng])
    },
  })
  return null
}

function Recenter({ position }) {
  const map = useMap()
  const lat = position?.[0]
  const lng = position?.[1]

  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], Math.max(map.getZoom(), 16), { animate: true })
    }
  }, [lat, lng, map])

  return null
}

export default function LocationPicker({
  value,
  onChange,
  height,
  className = 'h-[240px] w-full sm:h-[280px] lg:h-[320px]',
}) {
  const position = Array.isArray(value) && Number.isFinite(value[0]) && Number.isFinite(value[1]) ? value : storePosition

  return (
    <div className="w-full max-w-full min-w-0 space-y-2">
      <p className="text-[11px] text-slate-400">Tap the map or drag the red pin to mark the exact delivery location.</p>
      <div
        style={height ? { height, width: '100%' } : undefined}
        className={`relative max-w-full overflow-hidden rounded-xl border border-slate-700 ${className}`}
      >
        <MapContainer
          key="location-picker-map"
          center={position}
          zoom={value ? 17 : 13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            key="location-picker-tiles"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker key="location-picker-store" position={storePosition} icon={storeIcon}>
            <Tooltip direction="top" opacity={1}>Store: {STORE_LOCATION.address}</Tooltip>
          </Marker>
          {value && (
            <Marker
              key={`location-picker-customer-${position[0]}-${position[1]}`}
              position={position}
              icon={customerIcon}
              draggable
              eventHandlers={{
                dragend: event => onChange([event.target.getLatLng().lat, event.target.getLatLng().lng]),
              }}
            >
              <Tooltip direction="top" opacity={1}>Customer pin</Tooltip>
            </Marker>
          )}
          <MapClick onPick={onChange} />
          <Recenter position={value ? position : null} />
        </MapContainer>
      </div>
      <p className="text-[11px] text-slate-400">
        {value ? 'Delivery pin selected' : 'No delivery pin selected yet'}
      </p>
    </div>
  )
}
