/* global React */
const { useState, useEffect, useRef, useMemo } = React;

// =====================================================
// QUIZ — MCQ with feedback built-in
// =====================================================

function generateDistractors(year, allYears) {
  const pool = allYears.filter(y => y !== year);
  pool.sort((a,b) => Math.abs(a - year) - Math.abs(b - year));
  return pool.slice(0, 3);
}

window.QuizScreen = function QuizScreen({ state, setState }) {
  const events = window.EVENTS;
  const allYears = events.map(e => e.year);
  const i = state.quizIdx;
  const e = events[i];

  const options = useMemo(() => {
    const distractors = generateDistractors(e.year, allYears);
    const opts = [...distractors, e.year];
    // stable shuffle by event id
    return opts.sort((a,b) => ((a * 31 + e.id * 7) % 97) - ((b * 31 + e.id * 7) % 97));
  }, [e.id]);

  const [picked, setPicked] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  useEffect(() => {
    setPicked(null); startRef.current = Date.now(); setElapsed(0);
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 100) / 10), 100);
    return () => clearInterval(t);
  }, [i]);

  const correct = picked === e.year;

  const onPick = (y) => {
    if (picked != null) return;
    setPicked(y);
    const bonus = Math.max(0, 50 - Math.floor(elapsed * 10));
    setState(s => ({
      ...s,
      score: Math.max(0, s.score + (y === e.year ? 100 + bonus : -30)),
      streak: y === e.year ? s.streak + 1 : 0,
      correctCount: s.correctCount + (y === e.year ? 1 : 0),
    }));
  };

  const onNext = () => {
    if (i >= events.length - 1) {
      setState(s => ({ ...s, view: "result" }));
    } else {
      setState(s => ({ ...s, quizIdx: s.quizIdx + 1 }));
    }
  };

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "grid", gridTemplateColumns: "1fr 1.3fr",
    }}>
      {/* LEFT — event to identify */}
      <div style={{
        padding: 44, background: "var(--paper-warm)",
        borderRight: "3px solid var(--ink)",
        display: "flex", flexDirection: "column", gap: 20,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Label>Question [ {String(i+1).padStart(2,"0")} / {String(events.length).padStart(2,"0")} ]</Label>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 12, letterSpacing: "0.16em",
            color: picked ? "var(--ink-soft)" : "var(--red-lovelace)",
          }}>
            ⏱ {elapsed.toFixed(1)}s
          </div>
        </div>

        <div>
          <Label>Événement à dater</Label>
          <h2 style={{
            fontFamily: "var(--f-display)", fontWeight: 700,
            fontSize: "clamp(2.2rem, 3.6vw, 3.2rem)", lineHeight: 0.95,
            letterSpacing: "-0.03em", marginTop: 6,
          }}>
            {e.title}
          </h2>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: 20, color: "var(--red-lovelace)", marginTop: 2,
          }}>
            « {e.subtitle} »
          </div>
        </div>

        <Placeholder label={e.title} tone={e.color} style={{ height: 220 }}/>

        <p style={{ fontSize: 15, lineHeight: 1.45, color: "var(--ink)" }}>
          {e.short}
        </p>

        {/* Score strip */}
        <div style={{
          marginTop: "auto",
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0,
          border: "2px solid var(--ink)", background: "white",
        }}>
          {[
            ["Score", state.score],
            ["Série", `×${state.streak}`],
            ["Bonnes rép.", `${state.correctCount}/${events.length}`],
          ].map(([k, v], idx) => (
            <div key={k} style={{
              padding: "8px 12px",
              borderLeft: idx ? "2px solid var(--ink)" : "none",
            }}>
              <Label>{k}</Label>
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: 22, fontWeight: 700, marginTop: 2,
              }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — answer panel */}
      <div style={{
        padding: 44, background: "var(--paper)",
        display: "flex", flexDirection: "column", gap: 24,
        position: "relative",
      }}>
        <div>
          <Label accent>Sélection de la coordonnée temporelle</Label>
          <h3 style={{
            fontFamily: "var(--f-display)", fontWeight: 700,
            fontSize: 40, lineHeight: 1, marginTop: 4,
            letterSpacing: "-0.02em",
          }}>
            En quelle année ?
          </h3>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18,
        }}>
          {options.map((y, idx) => {
            const isCorrect = y === e.year;
            const isPicked = picked === y;
            const show = picked != null;
            let bg = "white", fg = "var(--ink)", shadow = "6px 6px 0 var(--ink)";
            if (show && isCorrect) { bg = "var(--green-bloom)"; shadow = "6px 6px 0 var(--ink)"; }
            else if (show && isPicked && !isCorrect) { bg = "var(--red-auria)"; shadow = "6px 6px 0 var(--red-lovelace)"; }
            else if (show) { bg = "#EFE9DA"; fg = "var(--ink-soft)"; shadow = "3px 3px 0 var(--ink)"; }
            return (
              <button key={y} onClick={() => onPick(y)} disabled={show} style={{
                border: "3px solid var(--ink)",
                background: bg, color: fg, cursor: show ? "default" : "pointer",
                padding: "24px 20px",
                textAlign: "left",
                boxShadow: shadow,
                transition: "all 180ms",
                transform: isPicked ? "translate(-2px, -2px)" : "none",
                fontFamily: "inherit",
              }}>
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.25em",
                  opacity: 0.7, marginBottom: 6,
                }}>
                  OPTION {String.fromCharCode(65 + idx)}
                </div>
                <FlipYear year={y} size={44}/>
                {show && isCorrect && (
                  <div style={{ marginTop: 10 }}>
                    <Stamp color="var(--ink)" rotate={-3}>Correct</Stamp>
                  </div>
                )}
                {show && isPicked && !isCorrect && (
                  <div style={{ marginTop: 10 }}>
                    <Stamp color="var(--red-lovelace)" rotate={3}>Erreur</Stamp>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {picked != null && (
          <div className="fade-in-up" style={{
            border: "3px solid var(--ink)",
            background: correct ? "var(--green-neura)" : "var(--paper-warm)",
            padding: "18px 20px",
            boxShadow: correct ? "6px 6px 0 var(--ink)" : "6px 6px 0 var(--red-lovelace)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <Label accent={!correct}>
                {correct ? "✓ Agent, coordonnées vérifiées" : "✗ Coordonnées erronées — correction"}
              </Label>
              {correct && (
                <span style={{
                  fontFamily: "var(--f-mono)", fontWeight: 700, fontSize: 18,
                  color: "var(--ink)",
                }}>
                  +{100 + Math.max(0, 50 - Math.floor(elapsed * 10))} pts
                </span>
              )}
            </div>
            <div style={{
              fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 22,
              marginTop: 6, letterSpacing: "-0.01em",
            }}>
              {e.title}, c'était en {e.year}.
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.5, marginTop: 6 }}>
              {e.didYouKnow}
            </p>
          </div>
        )}

        <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          {picked != null && (
            <button className="btn primary" onClick={onNext}>
              {i >= events.length - 1 ? "Voir les résultats →" : "Question suivante →"}
            </button>
          )}
          {picked == null && (
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "var(--ink-soft)", alignSelf: "center",
            }}>
              ↓ Choisissez une date
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
