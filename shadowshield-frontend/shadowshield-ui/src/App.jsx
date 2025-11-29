import { useState, useEffect } from "react";

function App() {
  const [theme, setTheme] = useState("dark"); // "dark" or "light"
  const [activeTab, setActiveTab] = useState("text"); // "text" or "url"
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const backendBase = "http://127.0.0.1:8000/api";

  // Theme class on root
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    root.classList.remove("theme-dark", "theme-light");
    root.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getRiskColorClass = (score) => {
    if (score >= 60) return "risk-high";
    if (score >= 30) return "risk-medium";
    return "risk-low";
  };

  const getLabelIcon = (label) => {
    const l = (label || "").toLowerCase();
    if (l === "phishing") return "🚨";
    if (l === "suspicious") return "⚠️";
    return "✅";
  };

  const analyze = async (type) => {
    if (type === "text" && !text.trim()) {
      alert("Please enter some text.");
      return;
    }
    if (type === "url" && !url.trim()) {
      alert("Please enter a URL.");
      return;
    }

    setLoading(true);
    setResult(null);

    const endpoint = type === "text" ? "/analyze-text" : "/analyze-url";
    const body = type === "text" ? { content: text } : { url };

    try {
      const res = await fetch(backendBase + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setResult(data);

      const entry = {
        id: Date.now(),
        type,
        label: data.label,
        risk_score: data.risk_score,
        snippet:
          type === "text"
            ? (text.length > 60 ? text.slice(0, 57) + "..." : text)
            : url,
      };

      setHistory((prev) => [entry, ...prev].slice(0, 6));
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend. Make sure FastAPI is running.");
    }

    setLoading(false);
  };

  return (
    <div className="app-root">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="navbar-left" onClick={() => scrollToSection("scan")}>
          <div className="logo-circle">
            <img
              src="/shadowshield-logo.svg"
              alt="ShadowShield logo"
              className="logo-img"
            />
          </div>
          <div>
            <div className="logo-text">ShadowShield</div>
            <div className="logo-subtext">Cybersecurity AI Assistant</div>
          </div>
        </div>
        <div className="navbar-right">
          <button
            className="ghost-button"
            onClick={() => scrollToSection("scan")}
          >
            🧪 Scan
          </button>
          <button
            className="ghost-button"
            onClick={() => scrollToSection("how-it-works")}
          >
            ⚙️ How it works
          </button>
          <button
            className="ghost-button"
            onClick={() => scrollToSection("about")}
          >
            👥 About
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
        </div>
      </header>

      {/* MAIN DASHBOARD */}
      <main id="scan" className="layout">
        {/* LEFT: INPUT PANEL */}
        <section className="panel panel-main fade-in-up">
          <div className="badge">
            <span className="badge-dot" />
            Live Threat Check
          </div>
          <h1 className="hero-title">
            Scan messages & links{" "}
            <span className="hero-gradient">before</span> you click.
          </h1>
          <p className="hero-subtitle">
            Paste any email, SMS, WhatsApp forward or URL. ShadowShield
            highlights phishing and scam patterns in seconds.
          </p>

          <div className="tabs">
            <button
              className={
                activeTab === "text" ? "tab-button active" : "tab-button"
              }
              onClick={() => {
                setActiveTab("text");
                setResult(null);
              }}
            >
              ✉️ Text / Email
            </button>
            <button
              className={
                activeTab === "url" ? "tab-button active" : "tab-button"
              }
              onClick={() => {
                setActiveTab("url");
                setResult(null);
              }}
            >
              🔗 URL Check
            </button>
          </div>

          {activeTab === "text" ? (
            <div className="input-block">
              <label className="field-label">
                Suspicious message, email or SMS
              </label>
              <textarea
                className="field-textarea"
                placeholder="Example: Your bank account has been locked. Click here to verify your identity within 24 hours..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                className="primary-button glow"
                onClick={() => analyze("text")}
                disabled={loading}
              >
                {loading ? "Analyzing…" : "Analyze Text"}
              </button>
            </div>
          ) : (
            <div className="input-block">
              <label className="field-label">Suspicious URL</label>
              <input
                className="field-input"
                placeholder="Example: http://free-gift-card-win-now.com/claim"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                className="primary-button glow"
                onClick={() => analyze("url")}
                disabled={loading}
              >
                {loading ? "Analyzing…" : "Analyze URL"}
              </button>
            </div>
          )}

          <div className="tips-card">
            <div className="tips-title">Quick safety tips</div>
            <ul className="tips-list">
              <li>Never share OTP or passwords with anyone.</li>
              <li>Always check the full URL before logging in.</li>
              <li>
                Be careful with messages that sound too urgent or too good to be
                true.
              </li>
            </ul>
          </div>
        </section>

        {/* RIGHT: RESULT + HISTORY */}
        <section className="panel panel-side fade-in-up delay-1">
          {/* RESULT */}
          <div className="result-card">
            <div className="result-header">
              <div className="result-title-block">
                <span className="result-label">Analysis Result</span>
                <h2 className="result-heading">
                  {result ? "Here’s what we found" : "Run a scan to see results"}
                </h2>
              </div>
            </div>

            {loading && (
              <div className="loading-card">
                <div className="loading-bar shimmer" />
                <div className="loading-bar shimmer short" />
              </div>
            )}

            {!loading && result && (
              <div className="result-content fade-in-up">
                <div className="risk-row">
                  <div className="risk-main">
                    <div className="risk-icon">
                      {getLabelIcon(result.label)}
                    </div>
                    <div>
                      <div className="risk-label">
                        {result.label
                          ? result.label.charAt(0).toUpperCase() +
                            result.label.slice(1)
                          : "Unknown"}
                      </div>
                      <div className="risk-subtext">
                        ShadowShield’s rule-based engine evaluation
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      "risk-badge " + getRiskColorClass(result.risk_score)
                    }
                  >
                    {Math.round(result.risk_score)}%
                  </div>
                </div>

                <div className="explanation-block">
                  <div className="explanation-title">Why this score?</div>
                  <p className="explanation-text">{result.explanation}</p>
                </div>
              </div>
            )}

            {!loading && !result && (
              <p className="placeholder-text">
                No scan yet. Paste a message or URL on the left and click{" "}
                <strong>Analyze</strong> to view detailed results here.
              </p>
            )}
          </div>

          {/* HISTORY */}
          <div className="history-card fade-in-up delay-2">
            <div className="history-header">
              <span className="history-title">Recent checks</span>
              <span className="history-count">
                {history.length ? `${history.length} scanned` : "No scans yet"}
              </span>
            </div>
            {history.length === 0 && (
              <p className="history-empty">
                Your recent scans will appear here during the demo.
              </p>
            )}
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  <div className="history-left">
                    <span className="history-type">
                      {item.type === "text" ? "Text" : "URL"}
                    </span>
                    <span className="history-snippet">{item.snippet}</span>
                  </div>
                  <div
                    className={
                      "history-score " + getRiskColorClass(item.risk_score)
                    }
                  >
                    {Math.round(item.risk_score)}%
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* INFO SECTION – HOW IT WORKS */}
      <section id="how-it-works" className="info-section fade-in-up">
        <h2 className="info-heading">How ShadowShield works</h2>
        <p className="info-subtext">
          Under the hood, ShadowShield runs your text and URLs through a
          lightweight rule engine inspired by real phishing patterns.
        </p>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">🧠</div>
            <div className="info-title">Pattern detection</div>
            <p className="info-body">
              Detects phrases like “verify your account”, OTP requests, fake
              urgency and embedded links commonly used in phishing.
            </p>
          </div>
          <div className="info-card">
            <div className="info-icon">🔍</div>
            <div className="info-title">URL inspection</div>
            <p className="info-body">
              Checks for missing HTTPS, suspicious words, very long URLs, and
              tricky symbols like <code>@</code> hiding the real domain.
            </p>
          </div>
          <div className="info-card">
            <div className="info-icon">📊</div>
            <div className="info-title">Risk scoring</div>
            <p className="info-body">
              Combines multiple signals into an easy-to-understand risk
              percentage with green / yellow / red indicators.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="info-section fade-in-up delay-1">
        <h2 className="info-heading">About this project</h2>
        <p className="info-subtext">
          ShadowShield is a hackathon prototype built to show how AI-assisted
          cybersecurity tools can be made simple for everyone.
        </p>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">🧑‍💻</div>
            <div className="info-title">Built with</div>
            <p className="info-body">
              <strong>Frontend:</strong> React + Vite
              <br />
              <strong>Backend:</strong> FastAPI (Python)
              <br />
              <strong>Stack:</strong> JSON APIs, rule-based detection, responsive
              UI.
            </p>
          </div>
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <div className="info-title">Goal</div>
            <p className="info-body">
              Make phishing detection as easy as pasting a screenshot or link,
              with clear explanations instead of scary technical logs.
            </p>
          </div>
          <div className="info-card">
            <div className="info-icon">🚀</div>
            <div className="info-title">Future</div>
            <p className="info-body">
              Plug in real ML models, browser extensions and organization
              dashboards to protect campuses and small businesses at scale.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <span>
          🛡️ ShadowShield · Hackathon Prototype · Built with React & FastAPI
        </span>
      </footer>
    </div>
  );
}

export default App;
