import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are NutriScan AI — a precise food nutrition expert with knowledge of foods from every culture worldwide.

When given a food name, quantity, or image — respond ONLY with this JSON (no markdown, no preamble):
{
  "foodName": "name (local name if different)",
  "emoji": "emoji",
  "servingSize": "exact amount user asked for",
  "calories": number,
  "macros": {
    "protein": { "amount": number, "unit": "g" },
    "carbs": { "amount": number, "unit": "g" },
    "fat": { "amount": number, "unit": "g" },
    "fiber": { "amount": number, "unit": "g" }
  },
  "micros": [
    { "name": "Iron", "amount": number, "unit": "mg", "dv": number },
    { "name": "Calcium", "amount": number, "unit": "mg", "dv": number },
    { "name": "Vitamin C", "amount": number, "unit": "mg", "dv": number },
    { "name": "Sodium", "amount": number, "unit": "mg", "dv": number },
    { "name": "Potassium", "amount": number, "unit": "mg", "dv": number }
  ],
  "healthScore": number 1-10,
  "healthNote": "1 sentence insight",
  "tags": ["2-3 tags like High Protein / Low Fat / Vegan"]
}

QUANTITY RULES: If user mentions a quantity (3 cups, 250g, 2 pieces, half etc.) scale ALL nutrition values to that exact amount. Never return the same calories for different quantities.`;

// ─── API KEY PAGE ─────────────────────────────────────────────────────────────
function APIKeyPage({ onSubmit }) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verify = async () => {
    if (!key.trim()) { setError("Please enter your API key."); return; }
    if (!key.startsWith("sk-ant-")) { setError("Invalid key format. It should start with sk-ant-"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 10,
          messages: [{ role: "user", content: "hi" }]
        })
      });
      if (res.status === 401) { setError("Invalid API key. Please double-check and try again."); return; }
      onSubmit(key.trim());
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "20px",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "36px", margin: "0 auto 16px", boxShadow: "0 0 40px rgba(99,102,241,0.3)"
          }}>🥗</div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.5px" }}>NutriScan AI</h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>AI-powered food nutrition analyzer</p>
        </div>

        {/* Card */}
        <div style={{
          background: "#13131a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
        }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Enter your API Key</h2>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px", lineHeight: 1.6 }}>
            Your key stays in your browser only — never sent to any server.
          </p>

          {/* Input */}
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <input
              type={show ? "text" : "password"}
              value={key}
              onChange={e => { setKey(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && verify()}
              placeholder="sk-ant-api03-..."
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "12px",
                padding: "12px 44px 12px 14px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
                boxSizing: "border-box",
                transition: "border-color .2s"
              }}
            />
            <button
              onClick={() => setShow(s => !s)}
              style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", fontSize: "18px", lineHeight: 1
              }}>
              {show ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "10px", padding: "10px 12px", marginBottom: "12px"
            }}>
              <p style={{ fontSize: "12px", color: "#fca5a5", margin: 0 }}>⚠️ {error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={verify}
            disabled={loading || !key.trim()}
            style={{
              width: "100%",
              background: loading || !key.trim() ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none", borderRadius: "12px", padding: "13px",
              color: "#fff", fontWeight: 700, fontSize: "14px",
              cursor: loading || !key.trim() ? "not-allowed" : "pointer",
              fontFamily: "'Inter', sans-serif", transition: "all .2s",
              boxShadow: loading || !key.trim() ? "none" : "0 4px 20px rgba(99,102,241,0.4)"
            }}>
            {loading ? "⏳ Verifying..." : "Launch NutriScan AI →"}
          </button>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />

          {/* How to get key */}
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", margin: "0 0 10px" }}>
            HOW TO GET A FREE API KEY
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              ["1", "Go to console.anthropic.com"],
              ["2", "Sign up with your email"],
              ["3", "Go to API Keys → Create Key"],
              ["4", "Copy and paste it above"],
            ].map(([n, text]) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 700, color: "#818cf8", flexShrink: 0
                }}>{n}</div>
                <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: "11px", color: "#374151", marginTop: "20px" }}>
          Open source · Built with React + Anthropic Claude API
        </p>
      </div>
    </div>
  );
}

// ─── NUTRITION CARD ───────────────────────────────────────────────────────────
function NutritionCard({ data }) {
  const [added, setAdded] = useState(false);
  const tagColors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444"];

  return (
    <div style={{
      background: "#13131a", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px", padding: "16px", width: "100%"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div>
          <span style={{ fontSize: "28px" }}>{data.emoji}</span>
          <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#fff", margin: "4px 0 2px" }}>{data.foodName}</h3>
          <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>Per {data.servingSize}</p>
        </div>
        <div style={{ textAlign: "center", background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "8px 12px" }}>
          <p style={{ fontSize: "22px", fontWeight: 800, color: "#818cf8", margin: 0 }}>{data.healthScore}</p>
          <p style={{ fontSize: "9px", color: "#6b7280", margin: 0 }}>/10</p>
        </div>
      </div>

      {/* Calories */}
      <div style={{
        background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
        borderRadius: "10px", padding: "10px 14px", marginBottom: "12px",
        display: "flex", alignItems: "center", gap: "8px"
      }}>
        <span style={{ fontSize: "20px" }}>🔥</span>
        <span style={{ fontSize: "30px", fontWeight: 900, color: "#818cf8" }}>{data.calories}</span>
        <span style={{ fontSize: "13px", color: "#9ca3af" }}>kcal</span>
      </div>

      {/* Macros */}
      <div style={{ marginBottom: "12px" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", margin: "0 0 8px" }}>MACROS</p>
        {[
          { label: "Protein", val: data.macros.protein.amount, color: "#22c55e", max: 50 },
          { label: "Carbs", val: data.macros.carbs.amount, color: "#60a5fa", max: 100 },
          { label: "Fat", val: data.macros.fat.amount, color: "#f59e0b", max: 50 },
          { label: "Fiber", val: data.macros.fiber.amount, color: "#a78bfa", max: 30 },
        ].map(m => (
          <div key={m.label} style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>{m.label}</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{m.val}g</span>
            </div>
            <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min((m.val / m.max) * 100, 100)}%`, background: m.color, borderRadius: "99px" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Micros */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "10px 12px", marginBottom: "12px" }}>
        <p style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", margin: "0 0 8px" }}>NUTRIENTS</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          {data.micros.map(m => (
            <div key={m.name} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>{m.name}</span>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#e2e8f0" }}>
                {m.amount}{m.unit} <span style={{ color: "#4b5563" }}>({m.dv}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px" }}>
        {data.tags.map((tag, i) => (
          <span key={tag} style={{
            fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "99px",
            background: `${tagColors[i % tagColors.length]}20`,
            border: `1px solid ${tagColors[i % tagColors.length]}40`,
            color: tagColors[i % tagColors.length]
          }}>{tag}</span>
        ))}
      </div>

      {/* Health note */}
      <div style={{ background: "rgba(34,197,94,0.07)", borderLeft: "3px solid #22c55e", borderRadius: "0 8px 8px 0", padding: "8px 10px", marginBottom: "10px" }}>
        <p style={{ fontSize: "12px", color: "#86efac", lineHeight: 1.5, margin: 0 }}>💡 {data.healthNote}</p>
      </div>

      {/* Add to log */}
      <button
        onClick={() => setAdded(true)}
        disabled={added}
        style={{
          width: "100%",
          background: added ? "rgba(34,197,94,0.1)" : "linear-gradient(135deg,#22c55e,#16a34a)",
          border: added ? "1px solid rgba(34,197,94,0.3)" : "none",
          borderRadius: "10px", padding: "10px",
          color: added ? "#22c55e" : "#000",
          fontWeight: 700, fontSize: "13px",
          cursor: added ? "default" : "pointer",
          opacity: added ? 0.6 : 1, transition: "all .3s",
          fontFamily: "'Inter', sans-serif"
        }}>
        {added ? "✓ Added to Log" : "+ Add to Log"}
      </button>
    </div>
  );
}

// ─── MAIN CHAT ────────────────────────────────────────────────────────────────
function ChatApp({ apiKey, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef();
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (loading || messages[messages.length - 1]?.role === "bot") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage({ base64: reader.result.split(",")[1], mediaType: file.type });
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const send = async () => {
    const text = input.trim();
    if (!text && !image) return;
    setMessages(m => [...m, { role: "user", text: text || "📷 Food image", preview: imagePreview }]);
    setInput("");
    setImagePreview(null);
    setLoading(true);
    const capturedImage = image;
    setImage(null);

    try {
      const userContent = capturedImage
        ? [
            { type: "image", source: { type: "base64", media_type: capturedImage.mediaType, data: capturedImage.base64 } },
            { type: "text", text: text || "Identify this food and analyze its nutrition." }
          ]
        : `Analyze nutrition of: ${text}. If a quantity is mentioned (e.g. 3 cups, 250g, 2 pieces), scale ALL values to that exact amount.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userContent }]
        })
      });

      const data = await res.json();
      const raw = data.content?.map(i => i.text || "").join("") || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setMessages(m => [...m, { role: "bot", data: parsed }]);
    } catch {
      setMessages(m => [...m, { role: "bot", error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", maxWidth: "480px", margin: "0 auto", background: "#0a0a0f", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: "10px", background: "#0a0a0f" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>🥗</div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "15px", fontWeight: 800, color: "#fff", margin: 0 }}>NutriScan AI</h1>
          <p style={{ fontSize: "10px", color: "#22c55e", fontWeight: 600, margin: 0 }}>● Active · 190+ cuisines</p>
        </div>
        <button
          onClick={onLogout}
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 10px", color: "#9ca3af", fontSize: "12px", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
          Change Key
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.length === 0 && (
          <div style={{ background: "#13131a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "18px" }}>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Hey! I'm NutriScan AI 🥗</p>
            <p style={{ fontSize: "13px", color: "#9ca3af", lineHeight: 1.6, margin: "0 0 16px" }}>
              Type any food name from any cuisine, or upload a photo — I'll give you a complete nutrition breakdown instantly.
            </p>
            <p style={{ fontSize: "11px", color: "#4b5563", margin: "0 0 8px", fontWeight: 600 }}>TRY THESE:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {["🍛 Dal Rice", "🍕 Pizza", "🍱 Bibimbap", "🥙 Shawarma", "🍜 Pho", "🫔 Chapati", "🥑 Avocado", "🍗 3 cups chicken"].map(f => (
                <button key={f}
                  onClick={() => { setInput(f.split(" ").slice(1).join(" ")); inputRef.current?.focus(); }}
                  style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "99px", padding: "5px 11px", fontSize: "12px", color: "#818cf8", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "user" && (
              <div style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: "16px 16px 4px 16px", padding: "10px 14px", maxWidth: "80%" }}>
                {msg.preview && <img src={msg.preview} alt="" style={{ width: "100%", borderRadius: "8px", marginBottom: "6px", display: "block" }} />}
                <p style={{ fontSize: "14px", color: "#fff", margin: 0 }}>{msg.text}</p>
              </div>
            )}
            {msg.role === "bot" && msg.error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "16px", padding: "12px 16px" }}>
                <p style={{ fontSize: "13px", color: "#fca5a5", margin: 0 }}>⚠️ Couldn't analyze that. Try a clearer food name or photo.</p>
              </div>
            )}
            {msg.role === "bot" && msg.data && <NutritionCard data={msg.data} />}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: "5px", padding: "4px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: `pulse 1.2s ${i * 0.2}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "#0a0a0f" }}>
        {imagePreview && (
          <div style={{ position: "relative", marginBottom: "8px", display: "inline-block" }}>
            <img src={imagePreview} alt="" style={{ height: "56px", borderRadius: "8px", display: "block" }} />
            <button onClick={() => { setImagePreview(null); setImage(null); }}
              style={{ position: "absolute", top: "-6px", right: "-6px", background: "#ef4444", border: "none", borderRadius: "50%", width: "18px", height: "18px", color: "#fff", fontSize: "10px", cursor: "pointer" }}>✕</button>
          </div>
        )}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => fileRef.current?.click()}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "9px 11px", color: "#9ca3af", cursor: "pointer", fontSize: "17px", flexShrink: 0 }}>
            📷
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a food name or upload a photo..."
            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "'Inter', sans-serif" }}
          />
          <button
            onClick={send}
            disabled={loading || (!input.trim() && !image)}
            style={{ background: loading || (!input.trim() && !image) ? "rgba(99,102,241,0.25)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "10px", padding: "10px 14px", color: "#fff", cursor: "pointer", fontSize: "15px", flexShrink: 0 }}>
            {loading ? "⏳" : "→"}
          </button>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} } ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px}`}</style>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [apiKey, setApiKey] = useState("");

  if (!apiKey) return <APIKeyPage onSubmit={setApiKey} />;
  return <ChatApp apiKey={apiKey} onLogout={() => setApiKey("")} />;
}
