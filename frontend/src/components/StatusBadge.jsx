export function StockBadge({ stock, safety }) {
  let label, cls, icon
  if (stock === 0) {
    label = 'OUT OF STOCK'; cls = 'bg-red-100 text-red-800 border-red-300'; icon = '✕'
  } else if (stock <= safety) {
    label = 'LOW STOCK'; cls = 'bg-amber-100 text-amber-900 border-amber-300'; icon = '⚠'
  } else {
    label = 'IN STOCK'; cls = 'bg-green-100 text-green-800 border-green-300'; icon = '✓'
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold border rounded ${cls}`}>
      <span aria-hidden="true">{icon}</span> {label}
    </span>
  )
}

const orderColors = {
  Pending:    'bg-yellow-100 text-yellow-800 border-yellow-300',
  Processing: 'bg-blue-100 text-blue-800 border-blue-300',
  Shipped:    'bg-indigo-100 text-indigo-800 border-indigo-300',
  Delivered:  'bg-green-100 text-green-800 border-green-300',
  Refunded:   'bg-gray-200 text-gray-800 border-gray-400',
}

export function OrderStatusBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-1 text-xs font-semibold border rounded ${orderColors[status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
      {status}
    </span>
  )
}