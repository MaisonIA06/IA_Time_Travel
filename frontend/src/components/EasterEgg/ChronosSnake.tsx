import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import './ChronosSnake.css';

interface Point {
  x: number;
  y: number;
}

interface Node extends Point {
  vx: number;
  vy: number;
  intensity: number;
}

interface ChronosSnakeProps {
  onClose: () => void;
}

const GRID_SIZE = 25; // Un peu plus grand pour faciliter le tactile
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

const HISTORICAL_EVENTS = [
  { year: 1843, title: "Ada Lovelace" },
  { year: 1950, title: "Test de Turing" },
  { year: 1956, title: "Conférence Dartmouth" },
  { year: 1966, title: "ELIZA" },
  { year: 1997, title: "Deep Blue" },
  { year: 2011, title: "Siri" },
  { year: 2016, title: "AlphaGo" },
  { year: 2022, title: "ChatGPT" },
];

export const ChronosSnake: React.FC<ChronosSnakeProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [dir, setDir] = useState<Point>({ x: 0, y: -1 });
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [highScore, setHighScore] = useState(() => 
    parseInt(localStorage.getItem('chronos_snake_highscore') || '0')
  );
  
  // Chronos Logic
  const [nextEventIndex, setNextEventIndex] = useState(0);
  const [lastCollectedEvent, setLastCollectedEvent] = useState<string | null>(null);
  const [showEventTitle, setShowEventTitle] = useState(false);

  const currentEvent = useMemo(() => HISTORICAL_EVENTS[nextEventIndex % HISTORICAL_EVENTS.length], [nextEventIndex]);

  // Neural Net state
  const nodes = useRef<Node[]>([]);

  const initNeuralNet = useCallback((width: number, height: number) => {
    const nodeCount = 40;
    nodes.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      intensity: 0,
    }));
  }, []);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood;
    const widthInGrids = Math.floor(window.innerWidth / GRID_SIZE);
    const heightInGrids = Math.floor(window.innerHeight / GRID_SIZE);
    
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (widthInGrids - 2)) + 1,
        y: Math.floor(Math.random() * (heightInGrids - 4)) + 2, // Garder de la place pour l'UI en haut
      };
      const onSnake = currentSnake.some(s => s.x === newFood!.x && s.y === newFood!.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  // Game loop
  useEffect(() => {
    if (isGameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { x: prevSnake[0].x + dir.x, y: prevSnake[0].y + dir.y };

        const widthInGrids = Math.floor(window.innerWidth / GRID_SIZE);
        const heightInGrids = Math.floor(window.innerHeight / GRID_SIZE);
        
        if (head.x < 0) head.x = widthInGrids - 1;
        if (head.x >= widthInGrids) head.x = 0;
        if (head.y < 0) head.y = heightInGrids - 1;
        if (head.y >= heightInGrids) head.y = 0;

        if (prevSnake.some(s => s.x === head.x && s.y === head.y)) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        if (head.x === food.x && head.y === food.y) {
          // Food collision - Event Collected!
          const pointsEarned = 50 + (nextEventIndex * 10);
          setScore(s => {
            const newScore = s + pointsEarned;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('chronos_snake_highscore', newScore.toString());
            }
            return newScore;
          });

          setLastCollectedEvent(currentEvent.title);
          setShowEventTitle(true);
          setTimeout(() => setShowEventTitle(false), 2000);
          
          setNextEventIndex(prev => prev + 1);
          setFood(generateFood(newSnake));
          
          setIsGlitching(true);
          setTimeout(() => setIsGlitching(false), 200);
          nodes.current.forEach(n => n.intensity = 1);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(60, 140 - (nextEventIndex * 5));
    const gameInterval = setInterval(moveSnake, speed);
    return () => clearInterval(gameInterval);
  }, [dir, food, isGameOver, nextEventIndex, currentEvent, highScore, generateFood]);

  // Input handling
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (dir.y === 0) setDir({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (dir.y === 0) setDir({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (dir.x === 0) setDir({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (dir.x === 0) setDir({ x: 1, y: 0 }); break;
        case 'Escape': onClose(); break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [dir, onClose]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if (nodes.current.length === 0) {
      initNeuralNet(canvas.width, canvas.height);
    }

    let animationFrameId: number;

    const render = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Neural Net
      nodes.current.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        node.intensity *= 0.97;
        const opacity = 0.1 + node.intensity * 0.5;
        ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.current.length; j++) {
          const other = nodes.current[j];
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 180) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${(1 - dist / 180) * opacity * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      // Render Food (Year)
      ctx.fillStyle = '#00faff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00faff';
      ctx.font = `bold ${GRID_SIZE * 0.8}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(currentEvent.year.toString(), food.x * GRID_SIZE + GRID_SIZE/2, food.y * GRID_SIZE + GRID_SIZE/1.2);

      // Render Snake
      snake.forEach((part, index) => {
        const isHead = index === 0;
        const opacity = 1 - (index / snake.length) * 0.6;
        ctx.fillStyle = isHead ? '#00faff' : `rgba(0, 200, 255, ${opacity})`;
        ctx.shadowBlur = isHead ? 20 : 0;
        
        // Forme un peu plus travaillée pour le serpent
        const r = isHead ? 6 : 4;
        ctx.beginPath();
        ctx.roundRect(part.x * GRID_SIZE + 1, part.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2, r);
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [snake, food, currentEvent, initNeuralNet]);

  const restart = () => {
    setSnake(INITIAL_SNAKE);
    setDir({ x: 0, y: -1 });
    setScore(0);
    setNextEventIndex(0);
    setLastCollectedEvent(null);
    setIsGameOver(false);
  };

  return (
    <div className={`chronos-snake-overlay ${isGlitching ? 'glitching' : ''}`}>
      <div className="snake-ui">
        <div className="snake-header">
          <div className="chronos-target">
            <span className="target-label">OBJECTIF TEMPOREL :</span>
            <span className="target-year">{currentEvent.year}</span>
          </div>
          
          <div className="snake-stats">
            <div className="stat-item">
              <span className="label">SCORE</span>
              <span className="value">{score.toString().padStart(6, '0')}</span>
            </div>
            <div className="stat-item">
              <span className="label">RECORD</span>
              <span className="value">{highScore.toString().padStart(6, '0')}</span>
            </div>
          </div>
          
          <button className="snake-close" onClick={onClose}>[X]</button>
        </div>

        {showEventTitle && (
          <div className="event-popup">
            <div className="event-popup-year">{HISTORICAL_EVENTS[(nextEventIndex - 1) % HISTORICAL_EVENTS.length].year}</div>
            <div className="event-popup-title">{lastCollectedEvent}</div>
            <div className="event-popup-bonus">+ BONUS TEMPOREL</div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="snake-canvas" />

      {/* D-Pad Tactile */}
      <div className="snake-dpad">
        <button className="dpad-btn up" onClick={() => dir.y === 0 && setDir({ x: 0, y: -1 })}>▲</button>
        <div className="dpad-row">
          <button className="dpad-btn left" onClick={() => dir.x === 0 && setDir({ x: -1, y: 0 })}>◀</button>
          <button className="dpad-btn down" onClick={() => dir.y === 0 && setDir({ x: 0, y: 1 })}>▼</button>
          <button className="dpad-btn right" onClick={() => dir.x === 0 && setDir({ x: 1, y: 0 })}>▶</button>
        </div>
      </div>

      {isGameOver && (
        <div className="snake-game-over">
          <h2 className="glitch" data-text="SYSTEM CRITICAL">SYSTEM CRITICAL</h2>
          <p>Neural Connection Terminated</p>
          <div className="game-over-stats">
            <p>Score final : {score}</p>
            <p>Événements collectés : {nextEventIndex}</p>
          </div>
          <div className="game-over-actions">
            <button onClick={restart} className="btn-retro">RESTAURER LE SYSTÈME</button>
            <button onClick={onClose} className="btn-retro">QUITTER</button>
          </div>
        </div>
      )}

      <div className="snake-controls-hint">
        COLLECTE LES DATES DANS L'ORDRE | ÉCHAP POUR QUITTER
      </div>
    </div>
  );
};
