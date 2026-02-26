import React, { useState, useEffect, useRef } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// ─────────────────────────────────────────────────────────────
//  CONNECTA PARTICLE CANVAS
//  Large, horizontal, bold — sits in TOP strip above the card
//  Spring physics + mouse repulsion + glow
// ─────────────────────────────────────────────────────────────
function RoyCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let particles = [];
    let raf;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      build();
    };

    const build = () => {
      const W = canvas.width;
      const H = canvas.height;

      const fs  = Math.min(W * 0.072, 92);
      const gap = Math.max(3, Math.floor(fs / 28));

      const off = document.createElement("canvas");
      off.width  = W;
      off.height = H;
      const oc  = off.getContext("2d");
      oc.clearRect(0, 0, W, H);
      oc.fillStyle    = "#fff";
      oc.font         = `900 ${fs}px 'Syne','Poppins',sans-serif`;
      oc.textAlign    = "center";
      oc.textBaseline = "middle";
      oc.fillText("CONNECTA", W / 2, H * 0.08);

      const data = oc.getImageData(0, 0, W, H).data;
      particles  = [];

      for (let y = 0; y < H; y += gap) {
        for (let x = 0; x < W; x += gap) {
          if (data[(y * W + x) * 4 + 3] > 128) {
            const spread = fs * 1.0;
            particles.push({
              hx: x,  hy: y,
              x:  x + (Math.random() - 0.5) * spread,
              y:  y + (Math.random() - 0.5) * spread,
              vx: 0,  vy: 0,
              r:  Math.random() * 1.6 + 0.4,
              hue:  196 + Math.random() * 30,
              sat:  60  + Math.random() * 40,
              lit:  72  + Math.random() * 26,
              a:    0.65 + Math.random() * 0.35,
              glow: Math.random() < 0.15,
            });
          }
        }
      }
    };

    const SPRING  = 0.048;
    const DAMP    = 0.80;
    const R_RAD   = 100;
    const R_FORCE = 6.5;
    const JITTER  = 0.06;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.x, my = mouse.y;

      for (const p of particles) {
        p.vx += (p.hx - p.x) * SPRING;
        p.vy += (p.hy - p.y) * SPRING;

        const dx   = p.x - mx;
        const dy   = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < R_RAD && dist > 0) {
          const f = ((R_RAD - dist) / R_RAD) * R_FORCE;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
        }

        p.vx += (Math.random() - 0.5) * JITTER;
        p.vy += (Math.random() - 0.5) * JITTER;
        p.vx *= DAMP;
        p.vy *= DAMP;
        p.x  += p.vx;
        p.y  += p.vy;

        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const lit = Math.min(p.lit + spd * 9,  98);
        const sat = Math.min(p.sat + spd * 12, 100);

        if (p.glow) {
          ctx.save();
          ctx.shadowBlur  = 10 + spd * 5;
          ctx.shadowColor = `hsla(${p.hue},${sat}%,${lit}%,0.95)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue},${sat}%,${lit}%,${p.a})`;
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue},${sat}%,${lit}%,${p.a})`;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove  = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = ()  => { mouse.x = -9999;      mouse.y = -9999; };
    const onTouch = (e) => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; };

    window.addEventListener("resize",     resize);
    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchmove",  onTouch, { passive: true });
    window.addEventListener("touchend",   onLeave);

    resize();
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",     resize);
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchmove",  onTouch);
      window.removeEventListener("touchend",   onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "absolute",
        top:           0,
        left:          0,
        width:         "100%",
        height:        "100%",
        zIndex:        2,
        pointerEvents: "none",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: #020818;
    min-height: 100vh;
  }

  .connecta-root {
    position: relative;
    width: 100vw;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse 80% 60% at 50% -10%, #0f3460 0%, #020818 60%);
    overflow: hidden;
    padding: 110px 20px 40px;
  }

  #tsparticles {
    position: absolute !important;
    inset: 0;
    z-index: 1;
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.12;
    z-index: 0;
    pointer-events: none;
  }
  .blob-1 {
    width: 500px; height: 500px;
    background: #1d6fa4;
    top: -150px; left: -150px;
  }
  .blob-2 {
    width: 400px; height: 400px;
    background: #0ea5e9;
    bottom: -100px; right: -100px;
  }

  .connecta-wrapper {
    position: relative;
    z-index: 10;
    display: flex;
    width: 100%;
    max-width: 960px;
    min-height: 620px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.07),
      0 40px 80px rgba(0,0,0,0.6),
      0 0 120px rgba(14,165,233,0.06);
    animation: wrapperIn 0.8s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes wrapperIn {
    from { opacity: 0; transform: translateY(30px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .brand-panel {
    width: 340px;
    flex-shrink: 0;
    background: linear-gradient(160deg, #0c2a4a 0%, #071826 100%);
    padding: 52px 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-right: 1px solid rgba(255,255,255,0.06);
    position: relative;
    overflow: hidden;
  }

  .brand-panel::before {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%);
    top: -80px; right: -80px;
    pointer-events: none;
  }

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-icon {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, #0ea5e9, #0369a1);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    box-shadow: 0 4px 16px rgba(14,165,233,0.4);
  }

  .brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
  }
  .brand-name span { color: #38bdf8; }

  .brand-body {
    flex: 1;
    display: flex; flex-direction: column; justify-content: center;
    gap: 28px; margin-top: 48px;
  }

  .brand-headline {
    font-family: 'Syne', sans-serif;
    font-size: 2rem; font-weight: 800; color: #fff;
    line-height: 1.2; letter-spacing: -0.03em;
  }
  .brand-headline em {
    font-style: normal;
    background: linear-gradient(90deg, #38bdf8, #7dd3fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .brand-desc {
    font-size: 0.88rem; color: #64748b;
    line-height: 1.7; font-weight: 300;
  }

  .brand-pills { display: flex; flex-direction: column; gap: 10px; }
  .pill {
    display: flex; align-items: center; gap: 10px;
    font-size: 0.82rem; color: #94a3b8; font-weight: 400;
  }
  .pill-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #0ea5e9; flex-shrink: 0;
    box-shadow: 0 0 8px #0ea5e9;
  }

  .brand-footer { font-size: 0.75rem; color: #334155; }
  .brand-footer a { color: #38bdf8; text-decoration: none; }

  .form-panel {
    flex: 1; background: #080f1a; padding: 52px 48px;
    display: flex; flex-direction: column; justify-content: center;
  }

  .form-header { margin-bottom: 36px; }
  .form-eyebrow {
    font-size: 0.72rem; font-weight: 500;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: #0ea5e9; margin-bottom: 8px;
  }
  .form-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.7rem; font-weight: 700; color: #f1f5f9;
    letter-spacing: -0.02em; line-height: 1.2;
  }
  .form-subtitle {
    font-size: 0.85rem; color: #475569;
    margin-top: 6px; font-weight: 300;
  }

  .reg-form { display: flex; flex-direction: column; gap: 16px; }

  .field-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
  }
  .field-group { display: flex; flex-direction: column; gap: 6px; }
  .field-label {
    font-size: 0.72rem; font-weight: 500;
    letter-spacing: 0.08em; text-transform: uppercase; color: #475569;
  }
  .field-wrap { position: relative; }
  .field-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%);
    font-size: 0.9rem; opacity: 0.45; pointer-events: none;
  }

  .reg-input, .reg-select {
    width: 100%;
    padding: 12px 14px 12px 38px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; color: #e2e8f0;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem; font-weight: 400;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }
  .reg-input::placeholder { color: #334155; }
  .reg-input:focus, .reg-select:focus {
    border-color: rgba(14,165,233,0.5);
    background: rgba(14,165,233,0.04);
    box-shadow: 0 0 0 3px rgba(14,165,233,0.08);
  }
  .reg-select { cursor: pointer; }
  .reg-select option { background: #0f1c2e; color: #e2e8f0; }

  .select-arrow {
    position: absolute; right: 14px; top: 50%;
    transform: translateY(-50%);
    pointer-events: none; color: #334155; font-size: 0.7rem;
  }

  .form-divider {
    height: 1px; background: rgba(255,255,255,0.04); margin: 4px 0;
  }

  .submit-btn {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
    border: none; border-radius: 12px; color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem; font-weight: 700; letter-spacing: 0.03em;
    cursor: pointer; position: relative; overflow: hidden;
    transition: transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(14,165,233,0.35);
    margin-top: 4px;
  }
  .submit-btn::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
    opacity: 0; transition: opacity 0.2s;
  }
  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(14,165,233,0.5);
  }
  .submit-btn:hover::after { opacity: 1; }
  .submit-btn:active { transform: translateY(0); }
  .submit-btn:disabled {
    opacity: 0.6; cursor: not-allowed; transform: none;
  }

  .form-terms {
    text-align: center; font-size: 0.72rem;
    color: #334155; margin-top: 8px;
  }
  .form-terms a { color: #38bdf8; text-decoration: none; }

  /* Error message */
  .form-error {
    text-align: center;
    font-size: 0.8rem;
    color: #f87171;
    padding: 8px 12px;
    background: rgba(248, 113, 113, 0.08);
    border: 1px solid rgba(248, 113, 113, 0.2);
    border-radius: 8px;
  }

  /* Success overlay */
  .success-overlay {
    position: fixed; inset: 0;
    background: rgba(2,8,24,0.92);
    z-index: 100;
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .success-card {
    text-align: center; padding: 60px 48px;
    background: #080f1a;
    border: 1px solid rgba(14,165,233,0.2);
    border-radius: 24px;
    box-shadow: 0 0 80px rgba(14,165,233,0.1);
    animation: popIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes popIn {
    from { transform: scale(0.85); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  .success-icon { font-size: 3rem; margin-bottom: 16px; }
  .success-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.6rem; font-weight: 800; color: #f1f5f9; margin-bottom: 8px;
  }
  .success-sub {
    font-size: 0.88rem; color: #475569; margin-bottom: 28px;
  }
  .success-btn {
    padding: 12px 32px;
    background: linear-gradient(135deg, #0ea5e9, #0369a1);
    border: none; border-radius: 10px; color: white;
    font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 0.9rem; cursor: pointer;
  }

  @media (max-width: 700px) {
    .brand-panel { display: none; }
    .form-panel { padding: 36px 24px; }
    .field-row { grid-template-columns: 1fr; }
    .connecta-wrapper { border-radius: 20px; }
  }
`;

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Form() {
  const [init,    setInit]    = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [form, setForm] = useState({
    fullName:     "",
    age:          "",
    email:        "",
    phone:        "",
    organization: "",
    address:      "",
    role:         "",
  });

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ── Submit → POST to Express backend ──────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/form", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setForm({ fullName: "", age: "", email: "", phone: "", organization: "", address: "", role: "" });
      } else {
        setError(data.message || "Submission failed. Please try again.");
      }
    } catch (err) {
      setError("Cannot reach the server. Make sure your backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const particleOptions = {
    fullScreen: { enable: false },
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    particles: {
      number: { value: 90, density: { enable: true, area: 900 } },
      color:  { value: "#ffffff" },
      shape:  { type: "circle" },
      opacity: { value: 0.6, random: true },
      size:    { value: { min: 1, max: 3.5 }, random: true },
      move: {
        enable:    true,
        direction: "bottom",
        speed:     1.5,
        straight:  false,
        random:    true,
        outModes:  { default: "out" },
      },
      wobble: { enable: true, distance: 12, speed: 4 },
    },
    detectRetina: true,
  };

  return (
    <>
      <style>{styles}</style>
      <div className="connecta-root">
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        {/* ❄️ Snowflakes */}
        {init && <Particles id="tsparticles" options={particleOptions} />}

        {/* ✨ CONNECTA particle text */}
        <RoyCanvas />

        <div className="connecta-wrapper">
          {/* ── LEFT BRAND PANEL ── */}
          <div className="brand-panel">
            <div className="brand-logo">
              <div className="brand-icon">🔗</div>
              <div className="brand-name">Connect<span>a</span></div>
            </div>

            <div className="brand-body">
              <div className="brand-headline">
                Build your<br /><em>network.</em><br />Grow together.
              </div>
              <div className="brand-desc">
                Join thousands of professionals and community leaders shaping the future of meaningful connections.
              </div>
              <div className="brand-pills">
                <div className="pill"><span className="pill-dot" /> Verified member profiles</div>
                <div className="pill"><span className="pill-dot" /> Exclusive community events</div>
                <div className="pill"><span className="pill-dot" /> Collaborative leadership tools</div>
              </div>
            </div>

            <div className="brand-footer">
              Need help? <a href="mailto:roy@gmail.com">roy@gmail.com</a>
            </div>
          </div>

          {/* ── RIGHT FORM PANEL ── */}
          <div className="form-panel">
            <div className="form-header">
              <div className="form-eyebrow">Member Onboarding</div>
              <div className="form-title">Create your account</div>
              <div className="form-subtitle">Fill in your details to join the Connecta network.</div>
            </div>

            <form className="reg-form" onSubmit={handleSubmit}>

              {/* Row 1: Full Name + Age */}
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Full Name</label>
                  <div className="field-wrap">
                    <span className="field-icon">👤</span>
                    <input
                      className="reg-input" name="fullName"
                      placeholder="John Carter"
                      value={form.fullName} onChange={handleChange} required
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Age</label>
                  <div className="field-wrap">
                    <span className="field-icon">🎂</span>
                    <input
                      className="reg-input" name="age" type="number"
                      placeholder="28" min="16" max="100"
                      value={form.age} onChange={handleChange} required
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email + Phone */}
              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <div className="field-wrap">
                    <span className="field-icon">✉️</span>
                    <input
                      className="reg-input" name="email" type="email"
                      placeholder="you@example.com"
                      value={form.email} onChange={handleChange} required
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Phone Number</label>
                  <div className="field-wrap">
                    <span className="field-icon">📞</span>
                    <input
                      className="reg-input" name="phone" type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone} onChange={handleChange} required
                    />
                  </div>
                </div>
              </div>

              {/* Organization */}
              <div className="field-group">
                <label className="field-label">Organization / Company</label>
                <div className="field-wrap">
                  <span className="field-icon">🏢</span>
                  <input
                    className="reg-input" name="organization"
                    placeholder="Connecta Inc."
                    value={form.organization} onChange={handleChange}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="field-group">
                <label className="field-label">Address</label>
                <div className="field-wrap">
                  <span className="field-icon">📍</span>
                  <input
                    className="reg-input" name="address"
                    placeholder="123 Main Street, Hyderabad"
                    value={form.address} onChange={handleChange} required
                  />
                </div>
              </div>

              {/* Role */}
              <div className="field-group">
                <label className="field-label">Membership Role</label>
                <div className="field-wrap">
                  <span className="field-icon">🎯</span>
                  <select
                    className="reg-select" name="role"
                    value={form.role} onChange={handleChange} required
                  >
                    <option value="" disabled>Select your role</option>
                    <option value="leader">Leader — Drive initiatives &amp; chapters</option>
                    <option value="member">Member — Engage &amp; collaborate</option>
                    <option value="volunteer">Volunteer — Support &amp; contribute</option>
                  </select>
                  <span className="select-arrow">▼</span>
                </div>
              </div>

              <div className="form-divider" />

              {/* Error message */}
              {error && <div className="form-error">⚠️ {error}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Submitting…" : "Complete Registration →"}
              </button>

              <div className="form-terms">
                By registering, you agree to our{" "}
                <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </div>
            </form>
          </div>
        </div>

        {/* SUCCESS OVERLAY */}
        {success && (
          <div className="success-overlay">
            <div className="success-card">
              <div className="success-icon">✅</div>
              <div className="success-title">Welcome to Connecta!</div>
              <div className="success-sub">
                Your registration was successful.<br />Check your email for next steps.
              </div>
              <button className="success-btn" onClick={() => setSuccess(false)}>
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}