import React, { useState, useEffect, useCallback } from 'react';
import './GlitchTerminal.css';

interface Question {
  id: number;
  q: string;
  options: string[];
  answer: number;
  expert_tip: string;
}

const EXPERT_QUESTIONS: Question[] = [
  {
    id: 1,
    q: "Quel était le nom original de la conférence de 1956 ?",
    options: [
      "Artificial Intelligence Summit",
      "Dartmouth Summer Research Project",
      "Cybernetics Conference",
      "The Thinking Machine Meeting"
    ],
    answer: 1,
    expert_tip: "John McCarthy a dû inventer le terme 'IA' pour convaincre les financeurs."
  },
  {
    id: 2,
    q: "L'effet ELIZA désigne la tendance humaine à :",
    options: [
      "Vouloir détruire les robots",
      "Prêter des émotions à une machine",
      "Oublier ses propres souvenirs",
      "Préférer parler aux machines"
    ],
    answer: 1,
    expert_tip: "Weizenbaum a été choqué de voir sa secrétaire se confier à son programme."
  },
  {
    id: 3,
    q: "Quel est le 'père' de l'informatique qui a décodé Enigma ?",
    options: [
      "John von Neumann",
      "Claude Shannon",
      "Alan Turing",
      "Isaac Asimov"
    ],
    answer: 2,
    expert_tip: "Son test de 1950 reste une référence absolue en philosophie de l'IA."
  },
  {
    id: 4,
    q: "Quelle technologie a permis le 'Printemps de l'IA' en 2012 ?",
    options: [
      "Le Deep Learning",
      "Les cartes perforées",
      "Le processeur Pentium",
      "L'invention du Wifi"
    ],
    answer: 0,
    expert_tip: "Grâce aux réseaux de neurones profonds et aux cartes graphiques (GPU)."
  }
];

interface GlitchTerminalProps {
  onClose: () => void;
}

export const GlitchTerminal: React.FC<GlitchTerminalProps> = ({ onClose }) => {
  const [step, setStep] = useState<'intro' | 'playing' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [logs, setLogs] = useState<string[]>(["Initialisation du noyau...", "Connexion sécurisée établie.", "Accès niveau EXPERT accordé."]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-5), msg]);
  };

  useEffect(() => {
    if (step === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 0.1), 100);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && step === 'playing') {
      handleAnswer(-1); // Timeout
    }
  }, [step, timeLeft]);

  const handleAnswer = (index: number) => {
    const isCorrect = index === EXPERT_QUESTIONS[currentQ].answer;
    
    if (isCorrect) {
      setScore(s => s + 1);
      setStatus({ msg: "ACCÈS AUTORISÉ", type: 'success' });
      addLog(`Correct : ${EXPERT_QUESTIONS[currentQ].expert_tip}`);
    } else {
      setStatus({ msg: "ERREUR SYSTÈME", type: 'error' });
      addLog("Échec de la validation.");
    }

    setTimeout(() => {
      setStatus(null);
      if (currentQ < EXPERT_QUESTIONS.length - 1) {
        setCurrentQ(prev => prev + 1);
        setTimeLeft(15);
      } else {
        setStep('result');
      }
    }, 1500);
  };

  const renderIntro = () => (
    <div className="terminal-content">
      <div className="terminal-output terminal-prompt">
        REQUÊTE D'ACCÈS AUX ARCHIVES CLASSÉES...
      </div>
      <div className="terminal-question">
        Voulez-vous tester vos connaissances d'expert en IA ?
      </div>
      <button className="btn-retro" onClick={() => setStep('playing')}>
        [ DÉMARRER LA SÉQUENCE ]
      </button>
    </div>
  );

  const renderPlaying = () => (
    <div className="terminal-content">
      <div className="terminal-timer-bar">
        <div 
          className="terminal-timer-progress" 
          style={{ width: `${(timeLeft / 15) * 100}%` }}
        ></div>
      </div>

      <div className="terminal-output">
        QUESTION {currentQ + 1}/{EXPERT_QUESTIONS.length}
      </div>

      <div className="terminal-question">
        {EXPERT_QUESTIONS[currentQ].q}
      </div>

      <div className="terminal-options">
        {EXPERT_QUESTIONS[currentQ].options.map((opt, i) => (
          <button 
            key={i} 
            className="terminal-option-btn"
            onClick={() => !status && handleAnswer(i)}
            disabled={!!status}
          >
            <span className="terminal-option-key">0{i+1}</span>
            <span className="terminal-option-text">{opt}</span>
          </button>
        ))}
      </div>

      <div className="terminal-logs">
        {logs.map((log, i) => (
          <div key={i} className="terminal-log-line">&gt; {log}</div>
        ))}
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="terminal-content terminal-result">
      <h2 className="terminal-result-title">RAPPORT DE MISSION</h2>
      <div className="terminal-result-score">
        Score : {score} / {EXPERT_QUESTIONS.length}
      </div>
      <p>
        {score === EXPERT_QUESTIONS.length 
          ? "INCROYABLE ! Vous êtes un véritable historien de l'IA." 
          : "Pas mal, mais les archives cachent encore des secrets pour vous."}
      </p>
      <div className="game-over-actions" style={{ marginTop: '40px' }}>
        <button className="btn-retro" onClick={onClose}>RETOUR AU SYSTÈME</button>
      </div>
    </div>
  );

  return (
    <div className="glitch-terminal-overlay">
      <div className="terminal-scanlines"></div>
      
      <header className="terminal-header">
        <div className="terminal-title">TERMINAL DE DÉBOGAGE TEMPOREL v2.4.0</div>
        <button className="terminal-close" onClick={onClose}>[ QUITTER ]</button>
      </header>

      {step === 'intro' && renderIntro()}
      {step === 'playing' && renderPlaying()}
      {step === 'result' && renderResult()}

      {status && (
        <div className={`terminal-status status-${status.type}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
};

