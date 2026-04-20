/* global React */
const { useState, useEffect, useRef, useMemo } = React;

// =====================================================
// MINI-GAMES hub + 4 games
// =====================================================

window.MiniGamesHub = function MiniGamesHub({ state, setState }) {
  const current = state.miniGame || "duel";
  const Game = {
    duel: DuelGame,
    decade: DecadeRushGame,
    beforeAfter: BeforeAfterGame,
    race: TimeRaceGame,
  }[current];

  const games = window.MINIGAMES;

  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "grid", gridTemplateRows: "auto 1fr",
    }}>
      {/* Selector tabs */}
      <div style={{
        display: "flex", borderBottom: "3px solid var(--ink)",
        background: "var(--paper-warm)",
      }}>
        <div style={{
          padding: "14px 22px",
          borderRight: "3px solid var(--ink)",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          <Label>Module ludique</Label>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 18, fontWeight: 700,
            letterSpacing: "0.08em",
          }}>MINI-JEUX</div>
        </div>
        {games.map(g => (
          <button key={g.id} onClick={() => setState(s => ({ ...s, miniGame: g.id }))} style={{
            flex: 1,
            padding: "12px 16px", textAlign: "left",
            background: current === g.id ? "var(--ink)" : "transparent",
            color: current === g.id ? "white" : "var(--ink)",
            border: "none",
            borderRight: "2px solid var(--ink)",
            cursor: "pointer", fontFamily: "inherit",
            transition: "all 120ms",
          }}>
            <div style={{
              fontFamily: "var(--f-mono)", fontSize: 10,
              letterSpacing: "0.22em", opacity: 0.7, textTransform: "uppercase",
            }}>JEU / 0{games.indexOf(g)+1}</div>
            <div style={{
              fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 18,
              letterSpacing: "-0.01em",
            }}>{g.title}</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{g.sub}</div>
          </button>
        ))}
      </div>

      <div style={{ position: "relative", overflow: "hidden" }}>
        <Game/>
      </div>
    </div>
  );
};

// ----- Duel des dates -----
function DuelGame() {
  const events = window.EVENTS;
  const [pair, setPair] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const shuffle = () => {
    const a = events[Math.floor(Math.random() * events.length)];
    let b;
    do { b = events[Math.floor(Math.random() * events.length)]; } while (b.id === a.id);
    setPair([a, b]); setPicked(null);
  };
  useEffect(shuffle, []);

  if (!pair) return null;
  const [a, b] = pair;
  const older = a.year < b.year ? a : b;

  const onPick = (e) => {
    if (picked) return;
    setPicked(e);
    if (e.id === older.id) setScore(s => s + 50);
    setTimeout(() => { setRound(r => r + 1); shuffle(); }, 1400);
  };

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "var(--paper)",
      display: "grid", gridTemplateRows: "auto 1fr auto",
    }}>
      <div style={{ padding: "18px 36px", borderBottom: "2px solid var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Label accent>Duel des dates</Label>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 22, marginTop: 2 }}>
            Lequel est le <em style={{ color: "var(--red-lovelace)" }}>plus ancien</em> ?
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, fontFamily: "var(--f-mono)", letterSpacing: "0.1em" }}>
          <span>MANCHE {round + 1}</span>
          <span style={{ color: "var(--red-lovelace)", fontWeight: 700 }}>{score} PTS</span>
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "stretch", gap: 0,
      }}>
        {[a, b].map((ev, i) => {
          const isPicked = picked?.id === ev.id;
          const show = picked != null;
          const correct = show && ev.id === older.id;
          return (
            <React.Fragment key={i}>
              <button onClick={() => onPick(ev)} disabled={show} style={{
                border: "none", background: "transparent", cursor: show ? "default" : "pointer",
                padding: 40, textAlign: "left",
                fontFamily: "inherit",
                background: correct ? "var(--green-neura)" :
                            (show && isPicked && !correct) ? "var(--red-auria)" : "white",
                borderRight: i === 0 ? "none" : "none",
                transition: "background 200ms",
              }}>
                <Label>Archive n° {ev.id}</Label>
                <div style={{
                  fontFamily: "var(--f-display)", fontWeight: 700,
                  fontSize: "clamp(2rem, 3.6vw, 3rem)", lineHeight: 0.95,
                  letterSpacing: "-0.03em", marginTop: 4,
                }}>
                  {ev.title}
                </div>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic",
                  fontSize: 18, color: "var(--red-lovelace)", marginBottom: 14,
                }}>
                  {ev.subtitle}
                </div>
                <Placeholder label={ev.title} tone={ev.color} style={{ height: 180, marginBottom: 14 }}/>
                {show ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FlipYear year={ev.year} size={40}/>
                    {correct && <Stamp color="var(--ink)">Plus ancien</Stamp>}
                  </div>
                ) : (
                  <div style={{
                    fontFamily: "var(--f-mono)", fontSize: 14, letterSpacing: "0.18em",
                    textTransform: "uppercase", color: "var(--ink-soft)",
                  }}>Date masquée</div>
                )}
              </button>

              {i === 0 && (
                <div style={{
                  display: "grid", placeItems: "center",
                  width: 80,
                  borderLeft: "3px solid var(--ink)",
                  borderRight: "3px solid var(--ink)",
                  background: "var(--ink)",
                  color: "var(--green-bloom)",
                  fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 38,
                  letterSpacing: "-0.02em",
                }}>
                  VS
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{
        padding: "14px 36px", borderTop: "2px solid var(--ink)",
        background: "var(--paper-warm)",
        fontFamily: "var(--f-mono)", fontSize: 12, letterSpacing: "0.2em",
        textTransform: "uppercase", color: "var(--ink-soft)",
      }}>
        Cliquez sur la carte qui vous semble la plus ancienne — +50 pts par bonne réponse
      </div>
    </div>
  );
}

// ----- Décennie Rush -----
function DecadeRushGame() {
  const events = window.EVENTS;
  const decades = [1840, 1950, 1960, 1990, 2010, 2020];
  const [assigned, setAssigned] = useState({});
  const [picked, setPicked] = useState(null);

  const remaining = events.filter(e => !(e.id in assigned));
  const onDrop = (decade) => {
    if (!picked) return;
    setAssigned(a => ({ ...a, [picked.id]: decade }));
    setPicked(null);
  };

  const correctCount = Object.entries(assigned).filter(([id, d]) => {
    const ev = events.find(e => e.id === +id);
    return Math.floor(ev.year / 10) * 10 === d || (d === 1840 && ev.year < 1900);
  }).length;

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "var(--paper)", padding: 32,
      display: "grid", gridTemplateRows: "auto 1fr auto", gap: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Label accent>Décennie Rush</Label>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 22, marginTop: 2 }}>
            Rangez chaque événement dans sa décennie
          </div>
        </div>
        <div style={{
          fontFamily: "var(--f-mono)", fontSize: 14, fontWeight: 700, letterSpacing: "0.12em",
        }}>
          {Object.keys(assigned).length}/{events.length} placés · {correctCount} corrects
        </div>
      </div>

      {/* Event queue */}
      <div style={{
        display: "grid", gridTemplateRows: "auto 1fr", gap: 16,
      }}>
        <div style={{
          border: "3px solid var(--ink)", background: "var(--paper-warm)",
          padding: 14, minHeight: 140,
          boxShadow: "6px 6px 0 var(--ink)",
        }}>
          <Label>File d'attente · {remaining.length} restants</Label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            {remaining.map(ev => (
              <button key={ev.id} onClick={() => setPicked(ev)} style={{
                padding: "8px 12px",
                border: "2px solid var(--ink)",
                background: picked?.id === ev.id ? "var(--green-bloom)" : "white",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: picked?.id === ev.id ? "3px 3px 0 var(--ink)" : "none",
                transform: picked?.id === ev.id ? "translate(-1px, -1px)" : "none",
                transition: "all 120ms",
              }}>
                <div style={{
                  fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 14,
                }}>{ev.title}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--ink-soft)" }}>
                  ?
                </div>
              </button>
            ))}
            {remaining.length === 0 && (
              <div style={{ fontFamily: "var(--f-mono)", color: "var(--ink-soft)", padding: 16 }}>
                Tous placés !
              </div>
            )}
          </div>
        </div>

        {/* Decade slots */}
        <div style={{
          display: "grid", gridTemplateColumns: `repeat(${decades.length}, 1fr)`,
          gap: 10,
        }}>
          {decades.map(d => {
            const hits = events.filter(e => assigned[e.id] === d);
            return (
              <div key={d} onClick={() => onDrop(d)} style={{
                border: "3px dashed var(--ink)",
                background: picked ? "var(--green-neura)" : "white",
                padding: 10,
                cursor: picked ? "pointer" : "default",
                transition: "all 140ms",
                display: "flex", flexDirection: "column", gap: 6,
                minHeight: 160,
              }}>
                <div style={{
                  fontFamily: "var(--f-mono)", fontWeight: 700, fontSize: 18,
                  letterSpacing: "0.08em", textAlign: "center",
                  borderBottom: "2px solid var(--ink)", paddingBottom: 4,
                }}>
                  {d === 1840 ? "Avant 1900" : `${d}s`}
                </div>
                {hits.map(ev => {
                  const isCorrect = Math.floor(ev.year / 10) * 10 === d || (d === 1840 && ev.year < 1900);
                  return (
                    <div key={ev.id} style={{
                      background: isCorrect ? "var(--green-bloom)" : "var(--red-auria)",
                      border: "2px solid var(--ink)",
                      padding: "6px 8px",
                      fontSize: 12, fontWeight: 600,
                    }}>
                      <div style={{ fontFamily: "var(--f-display)" }}>{ev.title}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, opacity: 0.8 }}>
                        {ev.year} {isCorrect ? "✓" : "✗"}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        fontFamily: "var(--f-mono)", fontSize: 12, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--ink-soft)",
      }}>
        1/ Cliquez sur un événement · 2/ Cliquez sur sa décennie
      </div>
    </div>
  );
}

// ----- Avant / Après -----
function BeforeAfterGame() {
  const events = window.EVENTS;
  const [ev, setEv] = useState(events[Math.floor(Math.random() * events.length)]);
  const [pivot, setPivot] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const pivots = [1900, 1960, 1980, 2000, 2015];
    setPivot(pivots[Math.floor(Math.random() * pivots.length)]);
  }, [ev]);

  const correct = pivot ? (ev.year < pivot ? "before" : "after") : null;

  const onPick = (v) => {
    if (answer) return;
    setAnswer(v);
    if (v === correct) setScore(s => s + 60);
    setTimeout(() => {
      setEv(events[Math.floor(Math.random() * events.length)]);
      setAnswer(null);
    }, 1500);
  };

  return (
    <div style={{
      position: "absolute", inset: 0, background: "var(--paper)",
      padding: 40, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 24,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <Label accent>Avant ou Après ?</Label>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 22, marginTop: 2 }}>
            Situer un événement par rapport à une année pivot
          </div>
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontWeight: 700, letterSpacing: "0.14em" }}>
          {score} PTS
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "stretch" }}>
        <div style={{
          background: "var(--paper-warm)", border: "3px solid var(--ink)",
          padding: 24, boxShadow: "6px 6px 0 var(--ink)",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <Label>Événement</Label>
          <div style={{
            fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 36,
            letterSpacing: "-0.02em", lineHeight: 0.95,
          }}>{ev.title}</div>
          <div style={{ fontSize: 15, lineHeight: 1.45 }}>{ev.short}</div>
          <div style={{ marginTop: "auto" }}>
            {answer && <FlipYear year={ev.year} size={52}/>}
          </div>
        </div>

        <div style={{
          background: "var(--ink)", color: "white",
          padding: 24, border: "3px solid var(--ink)",
          boxShadow: "6px 6px 0 var(--red-lovelace)",
          display: "flex", flexDirection: "column", gap: 20,
        }}>
          <div>
            <Label style={{ color: "var(--blue-lumen)" }}>Année pivot</Label>
            <div style={{ marginTop: 8 }}>
              <FlipYear year={pivot || 1900} size={64}/>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {["before", "after"].map(v => {
              const isPicked = answer === v;
              const isCorrect = answer && v === correct;
              const isWrong = answer && isPicked && !isCorrect;
              return (
                <button key={v} onClick={() => onPick(v)} disabled={!!answer} style={{
                  flex: 1, padding: "20px 16px",
                  border: "3px solid white",
                  background: isCorrect ? "var(--green-bloom)" : isWrong ? "var(--red-auria)" : "transparent",
                  color: isCorrect || isWrong ? "var(--ink)" : "white",
                  fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 26,
                  letterSpacing: "-0.02em",
                  cursor: answer ? "default" : "pointer",
                  transition: "all 180ms",
                }}>
                  {v === "before" ? "← Avant" : "Après →"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{
        fontFamily: "var(--f-mono)", fontSize: 12, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--ink-soft)",
      }}>
        +60 pts par bonne réponse · l'année reste masquée jusqu'à votre choix
      </div>
    </div>
  );
}

// ----- Course contre le temps -----
function TimeRaceGame() {
  const events = window.EVENTS;
  const [time, setTime] = useState(45);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState(0);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime(x => {
      if (x <= 0) { setRunning(false); return 0; }
      return x - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [running]);

  const ev = events[q % events.length];
  const allYears = events.map(e => e.year);
  const options = useMemo(() => {
    const distr = allYears.filter(y => y !== ev.year).slice(0, 3);
    return [...distr, ev.year].sort((a, b) => ((a + q * 17) % 13) - ((b + q * 17) % 13));
  }, [q]);

  const onPick = (y) => {
    if (!running) return;
    const correct = y === ev.year;
    if (correct) setScore(s => s + 30);
    setFeedback(correct ? "ok" : "ko");
    setTimeout(() => { setFeedback(null); setQ(q + 1); }, 500);
  };

  const pct = (time / 45) * 100;

  return (
    <div style={{
      position: "absolute", inset: 0, background: "var(--paper)",
      padding: 32, display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Label accent>Course contre le Temps</Label>
          <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 22, marginTop: 2 }}>
            Enchaînez les bonnes dates avant la fin du compte à rebours
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontWeight: 700, fontSize: 36,
            color: time < 10 ? "var(--red-lovelace)" : "var(--ink)",
            letterSpacing: "0.05em",
          }}>
            {String(Math.floor(time / 60)).padStart(2,"0")}:{String(time % 60).padStart(2,"0")}
          </div>
          <div style={{
            fontFamily: "var(--f-mono)", fontWeight: 700, fontSize: 24,
            color: "var(--red-lovelace)",
          }}>
            {score} PTS
          </div>
          {!running && time === 45 && (
            <button className="btn primary" onClick={() => setRunning(true)}>Démarrer</button>
          )}
          {!running && time === 0 && (
            <button className="btn accent" onClick={() => { setTime(45); setScore(0); setQ(0); setRunning(true); }}>
              Rejouer
            </button>
          )}
        </div>
      </div>

      {/* Timer bar */}
      <div style={{
        height: 12, background: "white", border: "2px solid var(--ink)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: time < 10 ? "var(--red-lovelace)" : "var(--green-bloom)",
          transition: "width 1s linear",
        }}/>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20,
      }}>
        <div style={{
          background: feedback === "ok" ? "var(--green-neura)" :
                      feedback === "ko" ? "var(--red-auria)" : "var(--paper-warm)",
          border: "3px solid var(--ink)",
          padding: 28, boxShadow: "6px 6px 0 var(--ink)",
          display: "flex", flexDirection: "column", gap: 14,
          transition: "background 180ms",
        }}>
          <Label>Événement #{q + 1}</Label>
          <div style={{
            fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 38,
            letterSpacing: "-0.02em", lineHeight: 0.95,
          }}>{ev.title}</div>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: 18, color: "var(--red-lovelace)",
          }}>{ev.subtitle}</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.5 }}>{ev.short}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {options.map((y, i) => (
            <button key={y} onClick={() => onPick(y)} disabled={!running} style={{
              border: "3px solid var(--ink)",
              background: running ? "white" : "#EFE9DA",
              padding: 16, cursor: running ? "pointer" : "default",
              boxShadow: "4px 4px 0 var(--ink)",
              fontFamily: "inherit",
              display: "flex", flexDirection: "column", gap: 6,
              transition: "transform 120ms",
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "translate(2px, 2px)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "none"}
            >
              <div style={{
                fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: "0.25em",
                color: "var(--ink-soft)",
              }}>OPTION {String.fromCharCode(65 + i)}</div>
              <div style={{ marginTop: "auto" }}>
                <FlipYear year={y} size={36}/>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{
        fontFamily: "var(--f-mono)", fontSize: 12, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--ink-soft)",
      }}>
        +30 pts par bonne réponse · pas de pénalité, enchaînez !
      </div>
    </div>
  );
}
