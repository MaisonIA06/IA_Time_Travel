import React, { useEffect, useRef, useState, useCallback } from 'react';
import './NeuralSnake.css';

interface Point {
  x: number;
  y: number;
}

interface Node extends Point {
  vx: number;
  vy: number;
  intensity: number;
}

interface NeuralSnakeProps {
  onClose: () => void;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

export const NeuralSnake: React.FC<NeuralSnakeProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [dir, setDir] = useState<Point>({ x: 0, y: -1 });
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [highScore, setHighScore] = useState(() => 
    parseInt(localStorage.getItem('snake_highscore') || '0')
  );

  // Neural Net state
  const nodes = useRef<Node[]>([]);
  const lastEatTime = useRef<number>(0);

  const initNeuralNet = useCallback((width: number, height: number) => {
    const nodeCount = 50;
    nodes.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      intensity: 0,
    }));
  }, []);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (window.innerWidth / GRID_SIZE)),
        y: Math.floor(Math.random() * (window.innerHeight / GRID_SIZE)),
      };
      // Check if food is on snake
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

        // Wall collision (wrap around)
        const widthInGrids = Math.floor(window.innerWidth / GRID_SIZE);
        const heightInGrids = Math.floor(window.innerHeight / GRID_SIZE);
        
        if (head.x < 0) head.x = widthInGrids - 1;
        if (head.x >= widthInGrids) head.x = 0;
        if (head.y < 0) head.y = heightInGrids - 1;
        if (head.y >= heightInGrids) head.y = 0;

        // Self collision
        if (prevSnake.some(s => s.x === head.x && s.y === head.y)) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(s => {
            const newScore = s + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('snake_highscore', newScore.toString());
            }
            return newScore;
          });
          setFood(generateFood(newSnake));
          lastEatTime.current = Date.now();
          
          // Visual Glitch effect
          setIsGlitching(true);
          setTimeout(() => setIsGlitching(false), 150);

          // Boost neural intensity
          nodes.current.forEach(n => n.intensity = 1);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, Math.max(50, 150 - score / 5));
    return () => clearInterval(gameInterval);
  }, [dir, food, isGameOver, score, highScore, generateFood]);

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

    // Touch Handling (Swipe)
    let touchStart: Point | null = null;
    const handleTouchStart = (e: TouchEvent) => {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;
      const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
      const dx = touchEnd.x - touchStart.x;
      const dy = touchEnd.y - touchStart.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) { // Threshold
          if (dx > 0 && dir.x === 0) setDir({ x: 1, y: 0 });
          else if (dx < 0 && dir.x === 0) setDir({ x: -1, y: 0 });
        }
      } else {
        if (Math.abs(dy) > 30) {
          if (dy > 0 && dir.y === 0) setDir({ x: 0, y: 1 });
          else if (dy < 0 && dir.y === 0) setDir({ x: 0, y: -1 });
        }
      }
      touchStart = null;
    };

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dir, onClose]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // N'initialiser le réseau que si les noeuds n'existent pas encore
    if (nodes.current.length === 0) {
      initNeuralNet(canvas.width, canvas.height);
    }

    let animationFrameId: number;

    const render = () => {
      // Clear with slight transparency for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Neural Net Background
      nodes.current.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        node.intensity *= 0.95; // Decay

        const finalOpacity = 0.1 + node.intensity * 0.4;
        ctx.fillStyle = `rgba(0, 255, 70, ${finalOpacity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < nodes.current.length; j++) {
          const other = nodes.current[j];
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 150) {
            ctx.strokeStyle = `rgba(0, 255, 70, ${(1 - dist / 150) * finalOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      // Render Food (Bit)
      ctx.fillStyle = '#00ff46';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff46';
      ctx.font = `${GRID_SIZE}px monospace`;
      ctx.fillText(Math.random() > 0.5 ? '1' : '0', food.x * GRID_SIZE, food.y * GRID_SIZE + GRID_SIZE);

      // Render Snake
      snake.forEach((part, index) => {
        const opacity = 1 - (index / snake.length) * 0.5;
        ctx.fillStyle = `rgba(0, 255, 70, ${opacity})`;
        ctx.shadowBlur = index === 0 ? 20 : 0;
        ctx.fillRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
      });

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [snake, food, initNeuralNet]);

  const restart = () => {
    setSnake(INITIAL_SNAKE);
    setDir({ x: 0, y: -1 });
    setScore(0);
    setIsGameOver(false);
  };

  return (
    <div className={`neural-snake-overlay ${isGlitching ? 'glitching' : ''}`}>
      <div className="matrix-bg"></div>
      
      <div className="snake-ui">
        <div className="snake-stats">
          <div className="stat-item">
            <span className="label">SCORE:</span>
            <span className="value">{score.toString().padStart(6, '0')}</span>
          </div>
          <div className="stat-item">
            <span className="label">HIGH:</span>
            <span className="value">{highScore.toString().padStart(6, '0')}</span>
          </div>
        </div>
        
        <button className="snake-close" onClick={onClose} title="EXIT TERMINAL">
          [X]
        </button>
      </div>

      <canvas ref={canvasRef} className="snake-canvas" />

      {/* Touch Controls (D-Pad) */}
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
          <div className="game-over-actions">
            <button onClick={restart} className="btn-retro">REBOOT_SYSTEM</button>
            <button onClick={onClose} className="btn-retro">SHUTDOWN</button>
          </div>
        </div>
      )}

      <div className="snake-controls-hint">
        ARROWS TO MOVE | ESC TO EXIT
      </div>
    </div>
  );
};

