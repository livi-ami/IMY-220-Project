import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import Waveform from "../components/Waveform.jsx";
import Tabs from "../components/Tabs.jsx";
import LoginForm from "../components/LoginForm.jsx";
import SignupForm from "../components/SignupForm.jsx";

export default function Splash({ initialTab }) {
  const [tab, setTab] = useState(initialTab || "login");

  // Visiting /login or /signup jumps straight to the form
  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
      document.getElementById("join")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [initialTab]);

  const goTo = (which) => {
    setTab(which);
    document.getElementById("join")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="splash">
      <div className="beams" aria-hidden="true">
        <div className="beam beam--1" />
        <div className="beam beam--2" />
        <div className="beam beam--3" />
      </div>

      <header className="splash-nav">
        <Logo to="/" />
        <div className="splash-nav__links">
          <button type="button" className="link-btn" onClick={() => goTo("login")}>Log in</button>
          <button type="button" className="btn btn-pink btn-sm" onClick={() => goTo("signup")}>Register</button>
        </div>
      </header>

      <section className="hero">
        <h1 className="wordmark">
          <span className="sr-only">Encore</span>
          <span aria-hidden="true">EN<b>O</b>RE</span>
          <Waveform height={120} />
        </h1>
        <p className="hero__tagline">The best medicine for your post concert blues</p>
        <div className="hero__cta">
          <button type="button" className="btn btn-orange" onClick={() => goTo("signup")}>Create an account</button>
          <button type="button" className="btn btn-ghost" onClick={() => goTo("login")}>Already have one</button>
        </div>
      </section>

      <section className="pitch">
        <h2>Every show.<br />Every angle. <em>Relived.</em></h2>
        <p>
          Encore is where your concert photos meet everyone else's from the same night &mdash; build your
          archive and see the show from every seat in the house.
        </p>
        <div className="polaroids" aria-hidden="true">
          <figure className="polaroid polaroid--teal"><div /><figcaption>Enhypen</figcaption></figure>
          <figure className="polaroid polaroid--amber"><div /><figcaption>Olivia Rodrigo</figcaption></figure>
        </div>
      </section>

      <section className="join" id="join">
        <div className="join__text">
          <h2>Join the fun and the memories.</h2>
          <p>Register with your email to start your own account, or log back in to pick up where you left off.</p>
        </div>
        <div className="auth-card">
          <Tabs
            variant="auth"
            label="Log in or register"
            active={tab}
            onChange={setTab}
            tabs={[{ id: "login", label: "Log in" }, { id: "signup", label: "Register" }]}
          />
          {tab === "login" ? <LoginForm /> : <SignupForm />}
        </div>
      </section>

      <footer className="splash-footer">
        <Link to="/home">Skip to the app (demo)</Link>
      </footer>
    </div>
  );
}
