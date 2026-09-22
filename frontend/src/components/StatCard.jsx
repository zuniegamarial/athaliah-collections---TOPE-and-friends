export default function StatCard({ label, value, accent = 'brand' }) {
  return (
    <section className={`bg-white border-l-4 border-${accent}-500 rounded shadow-sm p-5`}
             aria-label={label}>
      <h3 className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </section>
  )
}
