/* global React */
const { useState, useEffect, useRef, useMemo } = React;

// =====================================================
// RESULT — Mission report
// =====================================================

window.ResultScreen = function ResultScreen({ state, setState }) {
  const events = window.EVENTS;
  const total = events.length * 150;
  const pct = Math.min(100, Math.round((state.score / total) * 100));

  let rank = { label: "Apprenti·e", tone: "var(--ink-soft)" };
  if (pct >= 80) rank = { label: "Historien·ne Temporel·le", tone: "var(--red-lovelace)" };
  else if (pct >= 60) rank = { label: "Agent Temporel·le", tone: "var(--blue-deep)" };
  else if (pct >= 40) rank = { label: "Cadet·te Temporel·le", tone: "var(--ink)" };

  return (
    <div style={{
      position: "absolute", inset: 0, padding: 40,
      background: "var(--paper)",
      display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 28,
    }}>
      <div style={{
        border: "3px solid var(--ink)", background: "white",
        padding: 36, boxShadow: "10px 10px 0 var(--red-lovelace)",
        display: "flex", flexDirection: "column", gap: 22, position: "relative", overflow: "hidden",
      }}>
        <div aria-hidden style={{
          position: "absolute", right: -40, top: -40,
          fontFamily: "var(--f-display)", fontWeight: 700,
          fontSize: 280, color: "rgba(153,72,69,0.06)", lineHeight: 1,
        }}>FIN</div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Label>Rapport de mission · MIA-CHRONOS-06</Label>
          <Label accent>Classé Confidentiel</Label>
        </div>

        <div>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 18, color: "var(--ink-soft)" }}>
            Agent rang certifié
          </div>
          <div style={{
            fontFamily: "var(--f-display)", fontWeight: 700,
            fontSize: "clamp(2.8rem, 5vw, 4.4rem)", lineHeight: 0.9,
            letterSpacing: "-0.035em", color: rank.tone,
          }}>
            {rank.label}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: "2px solid var(--ink)" }}>
          {[
            ["Score", state.score],
            ["Correctes", `${state.correctCount}/${events.length}`],
            ["Précision", `${pct}%`],
          ].map(([k, v], i) => (
            <div key={k} style={{
              padding: 18, borderLeft: i ? "2px solid var(--ink)" : "none",
              background: i === 1 ? "var(--paper-warm)" : "white",
            }}>
              <Label>{k}</Label>
              <div style={{ fontFamily: "var(--f-mono)", fontWeight: 700, fontSize: 36, marginTop: 2 }}>
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* progress ribbon */}
        <div>
          <Label>Progression temporelle</Label>
          <div style={{ marginTop: 8, height: 28, border: "2px solid var(--ink)", background: "white", position: "relative", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: "var(--green-bloom)",
              borderRight: "2px solid var(--ink)",
              transition: "width 900ms cubic-bezier(.2,.8,.2,1)",
            }}/>
            <div style={{
              position: "absolute", inset: 0,
              display: "grid", placeItems: "center",
              fontFamily: "var(--f-mono)", fontWeight: 700, letterSpacing: "0.2em",
            }}>{pct}% DE LA FRISE RECONSTITUÉE</div>
          </div>
        </div>

        <div style={{ marginTop: "auto", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn primary" onClick={() => setState({
            view: "home", quizIdx: 0, score: 0, streak: 0, correctCount: 0, discoveryIdx: 0,
          })}>
            Nouvelle mission
          </button>
          <button className="btn" onClick={() => setState(s => ({ ...s, view: "museum" }))}>
            Ouvrir les archives →
          </button>
        </div>
      </div>

      {/* timeline recap */}
      <div style={{
        border: "3px solid var(--ink)", background: "var(--paper-warm)",
        padding: 28, boxShadow: "8px 8px 0 var(--ink)",
        display: "flex", flexDirection: "column", gap: 16, overflow: "hidden",
      }}>
        <Label>Frise reconstituée</Label>
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 }}>
          {events.map((e, i) => (
            <div key={e.id} style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center",
              border: "2px solid var(--ink)", background: "white",
              padding: "8px 12px",
            }}>
              <FlipYear year={e.year} size={20}/>
              <div>
                <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 15 }}>{e.title}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--ink-soft)" }}>
                  {e.chapter.toUpperCase()}
                </div>
              </div>
              <div style={{
                width: 14, height: 14,
                background: i < state.correctCount ? "var(--green-bloom)" : "#EFE9DA",
                border: "2px solid var(--ink)",
              }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// MUSEUM — Archives easter-egg
// =====================================================

window.MuseumScreen = function MuseumScreen({ setState }) {
  const events = window.EVENTS;
  const [selectedId, setSelectedId] = useState(events[0].id);
  const e = events.find(x => x.id === selectedId);

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "grid", gridTemplateColumns: "280px 1fr", background: "var(--paper)",
    }}>
      <aside style={{
        borderRight: "3px solid var(--ink)",
        background: "var(--paper-warm)",
        padding: 20, display: "flex", flexDirection: "column", gap: 10,
        overflow: "auto",
      }}>
        <div>
          <Label>Archives MIA</Label>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 22, letterSpacing: "-0.02em" }}>
            Fiches Musée
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {events.map(ev => (
            <button key={ev.id} onClick={() => setSelectedId(ev.id)} style={{
              textAlign: "left", border: "2px solid var(--ink)",
              background: ev.id === selectedId ? "var(--ink)" : "white",
              color: ev.id === selectedId ? "white" : "var(--ink)",
              padding: "8px 10px", cursor: "pointer", fontFamily: "inherit",
              boxShadow: ev.id === selectedId ? "3px 3px 0 var(--red-lovelace)" : "none",
              transform: ev.id === selectedId ? "translate(-1px, -1px)" : "none",
              transition: "all 120ms",
            }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.2em", opacity: 0.7 }}>
                FICHE {String(ev.id).padStart(3,"0")} · {ev.year}
              </div>
              <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 15 }}>
                {ev.title}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div style={{ padding: 40, overflow: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignContent: "start" }}>
        <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <Label>Fiche {String(e.id).padStart(3,"0")} · {e.chapter}</Label>
            <h1 style={{
              fontFamily: "var(--f-display)", fontWeight: 700,
              fontSize: "clamp(2.4rem, 4.4vw, 3.8rem)", lineHeight: 0.92,
              letterSpacing: "-0.035em",
            }}>{e.title}</h1>
            <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", color: "var(--red-lovelace)", fontSize: 22 }}>
              « {e.subtitle} »
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Stamp color="var(--red-lovelace)">Archive · {e.year}</Stamp>
            <button className="btn ghost" onClick={() => setState(s => ({ ...s, view: "home" }))}>
              ← Retour
            </button>
          </div>
        </div>

        <div>
          <Placeholder label={`Portrait — ${e.title}`} tone={e.color} style={{ height: 360 }}/>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", border: "2px solid var(--ink)" }}>
            {[["Année", e.year], ["Lieu", e.place], ["Catégorie", e.tag]].map(([k, v], i) => (
              <div key={k} style={{ padding: "10px 12px", borderLeft: i ? "2px solid var(--ink)" : "none", background: "white" }}>
                <Label>{k}</Label>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 14, fontWeight: 700, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <Label>Résumé</Label>
            <p style={{ fontSize: 17, lineHeight: 1.5, marginTop: 6, textWrap: "pretty" }}>{e.short}</p>
          </div>
          <div style={{
            border: "3px solid var(--ink)", background: "var(--green-neura)",
            padding: 16, boxShadow: "5px 5px 0 var(--ink)",
          }}>
            <Label>Le savais-tu ?</Label>
            <p style={{ fontFamily: "var(--f-display)", fontSize: 16, lineHeight: 1.45, marginTop: 4 }}>
              {e.didYouKnow}
            </p>
          </div>
          <div style={{
            border: "3px solid var(--ink)", background: "var(--ink)", color: "white",
            padding: 16,
          }}>
            <Label style={{ color: "var(--blue-lumen)" }}>Coordonnées temporelles</Label>
            <div style={{ marginTop: 10 }}>
              <FlipYear year={e.year} size={44}/>
            </div>
            <div style={{
              marginTop: 12, fontFamily: "var(--f-mono)", fontSize: 11,
              letterSpacing: "0.18em", color: "var(--green-bloom)",
            }}>
              LAT {45.24 + e.id * 0.7}° N · LONG {e.id * 3.12}° E · TIMECODE {e.year}-{String(e.id).padStart(2,"0")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
