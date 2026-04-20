/* global React */
const { useState, useEffect, useRef, useMemo } = React;

// =====================================================
// HOME — "Machine à remonter le temps" boot screen
// =====================================================

window.HomeScreen = function HomeScreen({ onStart, onNav }) {
  const [power, setPower] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPower(p => Math.min(1, p + 0.012)), 80);
    return () => clearInterval(t);
  }, []);

  const events = window.EVENTS;

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
      gap: 0,
    }}>
      {/* LEFT — headline */}
      <div style={{
        padding: "56px 56px 36px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        borderRight: "3px solid var(--ink)",
        position: "relative",
      }}>
        <div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 22 }}>
            <Stamp color="var(--red-lovelace)">MIA — Édition 2026</Stamp>
            <Label>Dossier N°IA-001</Label>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Label accent>Mission Intelligence Artificielle présente</Label>
          </div>

          <h1 style={{
            fontFamily: "var(--f-display)", fontWeight: 700,
            fontSize: "clamp(3rem, 7vw, 6rem)", lineHeight: 0.88,
            letterSpacing: "-0.035em", marginBottom: 18,
          }}>
            L'Aventure<br/>
            <span style={{
              display: "inline-block", background: "var(--ink)", color: "var(--green-bloom)",
              padding: "0 14px", transform: "rotate(-1deg)",
              boxShadow: "6px 6px 0 var(--red-lovelace)",
            }}>Temporelle</span><br/>
            de l'<em style={{ fontStyle: "italic", color: "var(--red-lovelace)" }}>I.A.</em>
          </h1>

          <p style={{
            maxWidth: 520, fontSize: 17, lineHeight: 1.45, color: "var(--ink-soft)",
            fontFamily: "var(--f-body)",
          }}>
            Une expédition chronologique à travers 180 ans d'intelligence
            artificielle, conçue pour la classe. Les élèves deviennent
            <b style={{ color: "var(--ink)" }}> Agents Temporels </b>
            et reconstruisent la frise de l'IA, d'Ada Lovelace à ChatGPT.
          </p>
        </div>

        {/* CTA row */}
        <div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
            <button className="btn primary" onClick={() => onStart()}>
              <span style={{ fontSize: 16 }}>▶</span> Activer la machine
            </button>
            <button className="btn ghost" onClick={() => onNav("museum")}>
              Consulter les archives
            </button>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
            borderTop: "2px solid var(--ink)", paddingTop: 14,
          }}>
            {[
              ["08", "ÉPOQUES"],
              ["4", "MINI-JEUX"],
              ["45'", "DURÉE"],
              ["11-15", "ÂGES"],
            ].map(([v, l]) => (
              <div key={l}>
                <div style={{
                  fontFamily: "var(--f-display)", fontWeight: 700,
                  fontSize: 32, lineHeight: 1, letterSpacing: "-0.03em",
                }}>{v}</div>
                <Label>{l}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — instrument panel */}
      <div style={{
        position: "relative",
        background: "var(--paper-warm)",
        padding: 36,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: 20,
      }}>
        {/* Machine title */}
        <div style={{
          border: "3px solid var(--ink)", background: "white",
          padding: "14px 18px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: "5px 5px 0 var(--ink)",
        }}>
          <div>
            <Label>Unité Chronologique / Modèle MIA-VIII</Label>
            <div style={{
              fontFamily: "var(--f-mono)", fontWeight: 700,
              fontSize: 22, marginTop: 2, letterSpacing: "0.08em",
            }}>CHRONOS-06</div>
          </div>
          <div style={{
            display: "flex", gap: 4,
          }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                width: 10, height: 22,
                background: i < Math.round(power * 5) ? "var(--green-bloom)" : "#EFE9DA",
                border: "2px solid var(--ink)",
              }}/>
            ))}
          </div>
        </div>

        {/* Core display: spinning time vortex + year readout */}
        <div style={{
          position: "relative",
          border: "3px solid var(--ink)",
          background: "var(--ink)",
          display: "grid", placeItems: "center",
          overflow: "hidden",
          boxShadow: "5px 5px 0 var(--red-lovelace)",
        }}>
          {/* radar sweep rings */}
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              position: "absolute", left: "50%", top: "50%",
              width: `${(i + 1) * 120}px`, height: `${(i + 1) * 120}px`,
              border: "1.5px solid rgba(229, 234, 168, 0.25)",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
            }}/>
          ))}
          {/* sweep needle */}
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            width: 2, height: 220,
            background: "linear-gradient(to top, transparent, var(--green-bloom))",
            transformOrigin: "50% 0%",
            transform: "translate(-50%, 0%)",
            animation: "spinSlow 8s linear infinite",
          }}/>
          {/* year dots around ring */}
          {window.EVENTS.map((e, i) => {
            const a = (i / window.EVENTS.length) * Math.PI * 2 - Math.PI / 2;
            const r = 200;
            const x = Math.cos(a) * r, y = Math.sin(a) * r;
            return (
              <div key={e.id} style={{
                position: "absolute", left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`,
                width: 12, height: 12, borderRadius: "50%",
                background: e.color === "terra" ? "var(--red-auria)" :
                            e.color === "green" ? "var(--green-bloom)" : "var(--blue-lumen)",
                border: "2px solid var(--ink)",
                transform: "translate(-50%, -50%)",
              }}>
                <div style={{
                  position: "absolute", left: "50%", top: "50%",
                  width: 24, height: 24, borderRadius: "50%",
                  border: "2px solid rgba(229, 234, 168, 0.4)",
                  transform: "translate(-50%, -50%)",
                  animation: `pulseRing 2.4s ${i * 0.3}s ease-out infinite`,
                }}/>
                <span style={{
                  position: "absolute", left: "50%", top: "130%",
                  transform: "translateX(-50%)",
                  fontFamily: "var(--f-mono)", fontSize: 10,
                  color: "var(--blue-lumen)", letterSpacing: "0.1em",
                  whiteSpace: "nowrap",
                }}>{e.year}</span>
              </div>
            );
          })}

          {/* center year flip display */}
          <div style={{ textAlign: "center", zIndex: 2 }}>
            <div style={{
              color: "var(--blue-lumen)",
              fontFamily: "var(--f-mono)", fontSize: 10,
              letterSpacing: "0.4em", marginBottom: 10,
            }}>DESTINATION</div>
            <FlipYear year={1843} size={52}/>
            <div style={{
              color: "var(--green-bloom)",
              fontFamily: "var(--f-mono)", fontSize: 11,
              letterSpacing: "0.3em", marginTop: 14,
            }}>↔  2 0 2 2</div>
          </div>
        </div>

        {/* Bottom strip : dials + status */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr) 1.4fr",
          gap: 12, alignItems: "center",
        }}>
          <Dial value={power} label="Énergie" color="var(--red-lovelace)" size={90}/>
          <Dial value={0.66} label="Flux" color="var(--blue-deep)" size={90}/>
          <Dial value={0.84} label="Stabilité" color="var(--ink)" size={90}/>
          <div style={{
            border: "2px solid var(--ink)", background: "white",
            padding: "10px 12px", height: "100%",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <Label>Journal de bord</Label>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: 11, lineHeight: 1.4,
              color: "var(--ink-soft)",
            }}>
              &gt; Condensateurs en charge<br/>
              &gt; Coordonnées verrouillées<br/>
              &gt; Prêt pour le saut temporel
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
