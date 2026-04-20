/* global React */
const { useState, useEffect, useRef, useMemo } = React;

// =====================================================
// Shared primitives for the rétro-futuriste design
// =====================================================

window.Label = function Label({ children, accent, style }) {
  return (
    <span className={"label" + (accent ? " label-accent" : "")} style={style}>
      {children}
    </span>
  );
};

window.FlipYear = function FlipYear({ year, size = 120 }) {
  const digits = String(year).split("");
  return (
    <div className="flip-year" style={{ fontSize: size }}>
      {digits.map((d, i) => (
        <span key={i} className="flip-digit">{d}</span>
      ))}
    </div>
  );
};

window.Corners = function Corners() {
  return (
    <>
      <div className="corner tl" />
      <div className="corner tr" />
      <div className="corner bl" />
      <div className="corner br" />
    </>
  );
};

// Placeholder imagery — rayures diagonales + legende
window.Placeholder = function Placeholder({ label, tone = "blue", style, children }) {
  const toneMap = {
    blue: { bg: "#163458", stripe: "rgba(194,212,239,0.25)", ink: "#C2D4EF" },
    terra: { bg: "#994845", stripe: "rgba(242,178,165,0.3)", ink: "#F2B2A5" },
    green: { bg: "#3F4A1E", stripe: "rgba(229,234,168,0.3)", ink: "#E5EAA8" },
    paper: { bg: "#EFE9DA", stripe: "rgba(22,52,88,0.12)", ink: "#163458" },
  };
  const t = toneMap[tone] || toneMap.blue;
  return (
    <div style={{
      position: "relative",
      background: t.bg,
      color: t.ink,
      overflow: "hidden",
      border: "3px solid #0F2238",
      ...style,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `repeating-linear-gradient(-45deg, ${t.stripe} 0 10px, transparent 10px 24px)`,
      }}/>
      <div style={{
        position: "absolute", inset: 12,
        border: `2px dashed ${t.ink}`,
        display: "grid", placeItems: "center",
        textAlign: "center",
      }}>
        <div style={{ padding: 12 }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.3em",
            textTransform: "uppercase", opacity: 0.7, marginBottom: 6,
          }}>
            [ ARCHIVE ]
          </div>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 13, letterSpacing: "0.12em",
            textTransform: "uppercase", fontWeight: 600,
          }}>
            {label}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// Cadran / dial instrument
window.Dial = function Dial({ value = 0.5, label, size = 120, color = "#994845" }) {
  const angle = -140 + value * 280;
  return (
    <div style={{ display: "grid", placeItems: "center", gap: 6 }}>
      <div style={{
        position: "relative", width: size, height: size,
        borderRadius: "50%",
        background: "radial-gradient(circle at 50% 30%, #fff 0%, #EFE9DA 70%, #C0C0BE 100%)",
        border: "3px solid #0F2238",
        boxShadow: "inset 0 3px 0 rgba(255,255,255,0.6), inset 0 -4px 0 rgba(0,0,0,0.12), 4px 4px 0 #0F2238",
      }}>
        {/* ticks */}
        {[...Array(11)].map((_, i) => {
          const a = -140 + (i * 28);
          return <div key={i} style={{
            position: "absolute", left: "50%", top: "50%",
            width: 2, height: size * 0.12,
            background: "#0F2238",
            transform: `translate(-50%, -100%) rotate(${a}deg)`,
            transformOrigin: "50% 100%",
            marginTop: -size * 0.34,
          }}/>;
        })}
        {/* needle */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          width: 4, height: size * 0.36,
          background: color,
          transform: `translate(-50%, -100%) rotate(${angle}deg)`,
          transformOrigin: "50% 100%",
          borderRadius: "2px 2px 0 0",
          transition: "transform 600ms cubic-bezier(.2,.8,.2,1.2)",
          boxShadow: "1px 1px 0 rgba(0,0,0,0.3)",
        }}/>
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          width: 14, height: 14,
          borderRadius: "50%", background: "#0F2238",
          transform: "translate(-50%, -50%)",
          border: "2px solid #fff",
        }}/>
      </div>
      {label && <Label>{label}</Label>}
    </div>
  );
};

// Ticker (bandeau défilant)
window.Ticker = function Ticker({ items, style }) {
  const text = items.join("  •  ");
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      borderTop: "2px solid var(--ink)", borderBottom: "2px solid var(--ink)",
      background: "#0F2238", color: "var(--green-bloom)",
      padding: "6px 0",
      ...style,
    }}>
      <div style={{
        display: "inline-block", whiteSpace: "nowrap",
        fontFamily: "var(--f-mono)", fontSize: 12, letterSpacing: "0.18em",
        textTransform: "uppercase",
        animation: "tickerScroll 40s linear infinite",
      }}>
        <span style={{ paddingRight: 48 }}>{text}   •   {text}   •   {text}</span>
      </div>
    </div>
  );
};

// Stamp
window.Stamp = function Stamp({ children, color = "#994845", rotate = -4, style }) {
  return (
    <span className="stamp" style={{ color, transform: `rotate(${rotate}deg)`, ...style }}>
      {children}
    </span>
  );
};

// Section header (like Book chapter)
window.SectionHeader = function SectionHeader({ index, total, chapter, title }) {
  return (
    <div style={{ borderBottom: "3px solid var(--ink)", paddingBottom: 10, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20 }}>
        <Label>{chapter}</Label>
        <Label>[ {String(index).padStart(2,"0")} / {String(total).padStart(2,"0")} ]</Label>
      </div>
      <div style={{
        fontFamily: "var(--f-display)", fontWeight: 700,
        fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em",
        lineHeight: 0.95, marginTop: 6,
      }}>
        {title}
      </div>
    </div>
  );
};
