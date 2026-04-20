/* global React */
const { useState, useEffect, useRef, useMemo } = React;

// =====================================================
// DISCOVERY — Slideshow animateur (plein écran)
// =====================================================

window.DiscoveryScreen = function DiscoveryScreen({ idx, setIdx, onNext, onToQuiz }) {
  const events = window.EVENTS;
  const e = events[idx];

  useEffect(() => {
    const handler = (ev) => {
      if (ev.key === "ArrowRight") onNext();
      if (ev.key === "ArrowLeft") setIdx(i => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, setIdx]);

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
    }}>
      {/* LEFT — Archive card */}
      <div key={e.id} className="fade-in-up" style={{
        padding: 48,
        display: "flex", flexDirection: "column", gap: 22,
        borderRight: "3px solid var(--ink)",
        background: "var(--paper-warm)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* watermark year */}
        <div aria-hidden style={{
          position: "absolute", right: -40, bottom: -60,
          fontFamily: "var(--f-display)", fontWeight: 700,
          fontSize: 360, lineHeight: 1,
          color: "rgba(22,52,88,0.06)", pointerEvents: "none",
          letterSpacing: "-0.05em",
        }}>
          {e.year}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 2 }}>
          <div>
            <Label>Chapitre · {e.chapter}</Label>
            <div style={{ marginTop: 4 }}>
              <Label accent>Dossier {String(e.id).padStart(3,"0")} / Catégorie : {e.tag}</Label>
            </div>
          </div>
          <Label>[ {String(idx+1).padStart(2,"0")} / {String(events.length).padStart(2,"0")} ]</Label>
        </div>

        <div style={{ zIndex: 2 }}>
          <div style={{ marginBottom: 10 }}>
            <FlipYear year={e.year} size={72}/>
          </div>
          <h2 style={{
            fontFamily: "var(--f-display)", fontWeight: 700,
            fontSize: "clamp(2.4rem, 4.4vw, 3.8rem)", lineHeight: 0.94,
            letterSpacing: "-0.035em",
          }}>
            {e.title}
          </h2>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: 22, color: "var(--red-lovelace)", marginTop: 4,
          }}>
            « {e.subtitle} »
          </div>
        </div>

        <p style={{
          fontSize: 17, lineHeight: 1.5, maxWidth: 560,
          color: "var(--ink)", zIndex: 2,
          textWrap: "pretty",
        }}>
          {e.short}
        </p>

        {/* Did you know? */}
        <div style={{
          border: "3px solid var(--ink)", background: "var(--green-neura)",
          padding: "14px 16px", boxShadow: "5px 5px 0 var(--ink)",
          zIndex: 2,
          maxWidth: 560,
        }}>
          <Label>Le savais-tu ?</Label>
          <div style={{
            fontFamily: "var(--f-display)", fontSize: 16, marginTop: 4,
            lineHeight: 1.4,
          }}>
            {e.didYouKnow}
          </div>
        </div>

        <div style={{ flex: 1 }}/>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "var(--ink-soft)",
          }}>
            ◀  → Utilisez les flèches
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}>
              ← Précédent
            </button>
            {idx < events.length - 1 ? (
              <button className="btn primary" onClick={onNext}>
                Suivant →
              </button>
            ) : (
              <button className="btn accent" onClick={onToQuiz}>
                Lancer le quiz →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT — visual specimen */}
      <div style={{
        position: "relative",
        background: "var(--ink)",
        padding: 36,
        display: "grid", gridTemplateRows: "auto 1fr auto", gap: 16,
        color: "white",
      }}>
        {/* specimen header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          borderBottom: "2px solid rgba(194,212,239,0.3)", paddingBottom: 10,
        }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.25em",
            textTransform: "uppercase", color: "var(--blue-lumen)",
          }}>
            Spécimen Chronologique
          </div>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.18em",
            color: "var(--green-bloom)",
          }}>
            LAT {45.24 + idx * 0.7}° N · LONG {e.id * 3.12}° E
          </div>
        </div>

        {/* image placeholder */}
        <div style={{ position: "relative" }}>
          <Placeholder
            label={`${e.title} — ${e.year}`}
            tone={e.color}
            style={{ position: "absolute", inset: 0 }}
          />
          {/* scan lines overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "repeating-linear-gradient(to bottom, transparent 0 2px, rgba(194,212,239,0.08) 2px 3px)",
            pointerEvents: "none",
          }}/>
          {/* corner crosshairs */}
          {["tl","tr","bl","br"].map(pos => {
            const s = {
              position: "absolute", width: 18, height: 18,
              border: "2px solid var(--green-bloom)",
              ...(pos.includes("t") ? { top: 8 } : { bottom: 8 }),
              ...(pos.includes("l") ? { left: 8 } : { right: 8 }),
              ...(pos === "tl" ? { borderRight: "none", borderBottom: "none" } :
                  pos === "tr" ? { borderLeft: "none", borderBottom: "none" } :
                  pos === "bl" ? { borderRight: "none", borderTop: "none" } :
                                 { borderLeft: "none", borderTop: "none" }),
            };
            return <div key={pos} style={s}/>;
          })}
          {/* stamp */}
          <div style={{ position: "absolute", right: 24, bottom: 24 }}>
            <Stamp color="var(--green-bloom)">Archivé</Stamp>
          </div>
        </div>

        {/* meta strip */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
          border: "2px solid rgba(194,212,239,0.3)",
        }}>
          {[
            ["Lieu", e.place],
            ["Année", String(e.year)],
            ["Catégorie", e.tag],
          ].map(([k, v], i) => (
            <div key={k} style={{
              padding: "10px 12px",
              borderLeft: i ? "2px solid rgba(194,212,239,0.3)" : "none",
            }}>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: 9,
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: "var(--blue-lumen)",
              }}>{k}</div>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: 13,
                marginTop: 2, fontWeight: 600, letterSpacing: "0.05em",
                color: "var(--green-bloom)",
              }}>{v}</div>
            </div>
          ))}
        </div>

        {/* progress bar */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", gap: 2 }}>
          {events.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4,
              background: i <= idx ? "var(--green-bloom)" : "rgba(194,212,239,0.2)",
              transition: "background 200ms",
            }}/>
          ))}
        </div>
      </div>
    </div>
  );
};
