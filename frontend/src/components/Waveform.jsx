const COLORS = ["var(--pink)", "var(--teal)", "var(--orange)"];
const HEIGHTS = [0.25, 0.45, 0.8, 1, 0.7, 0.85, 0.6, 0.4, 0.3];

export default function Waveform({ height = 28 }) {
  return (
    <span className="waveform" style={{ height }} aria-hidden="true">
      {HEIGHTS.map((h, i) => (
        <i key={i} style={{ height: `${h * 100}%`, background: COLORS[i % 3] }} />
      ))}
    </span>
  );
}