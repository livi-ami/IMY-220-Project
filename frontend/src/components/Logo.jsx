import { Link } from "react-router-dom";
import Waveform from "./Waveform.jsx";

export default function Logo({ to = "/home" }) {
  return (
    <Link to={to} className="logo" aria-label="Encore home">
      <Waveform height={26} />
      <span className="logo__text">Encore</span>
    </Link>
  );
}
