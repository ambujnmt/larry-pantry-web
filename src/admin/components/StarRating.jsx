// Two modes:
//   <StarRating value={4.3} />                          → readonly display (product cards, product page)
//   <StarRating value={rating} onChange={setRating} interactive />  → clickable input (review form)
//
// Uses inline SVG (not an icon font) so it renders correctly on every page,
// regardless of whether Font Awesome or the storefront's own icon font is loaded.

export default function StarRating({ value = 0, onChange, interactive = false, size = 16 }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <span style={{ display: "inline-flex", gap: 2, verticalAlign: "middle" }}>
      {stars.map(star => {
        const filled = star <= Math.round(value)
        return (
          <svg
            key={star}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            onClick={interactive ? () => onChange(star) : undefined}
            style={{ cursor: interactive ? "pointer" : "default", flexShrink: 0 }}
          >
            <path
              d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17l-5.9 3.5 1.3-6.6-4.9-4.5 6.6-.8L12 2.5z"
              fill={filled ? "#f59e0b" : "none"}
              stroke={filled ? "#f59e0b" : "#cbd5e1"}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        )
      })}
    </span>
  )
}