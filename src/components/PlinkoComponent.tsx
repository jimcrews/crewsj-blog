import React, { useRef, useState, useEffect } from 'react';

const BALL_SIZE = 16;
const PIN_SIZE = 10;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 900;

const ROWS = 12;
const PINS_PER_ROW = 11;
const MULTIPLIERS = [0.05, 0.1, 0.25, 0.6, 1.2, 10.0, 1.2, 0.6, 0.25, 0.1, 0.05];

interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  currentRow: number;
  counted: boolean;
}

export default function PlinkoComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const pinLocations = useRef<{ x: number; y: number }[][]>([]);
  const bucketCounts = useRef<number[]>(Array(MULTIPLIERS.length).fill(0));
  const countedBalls = useRef<Set<string>>(new Set());
  const flashingBuckets = useRef<Map<number, number>>(new Map()); // bucket index -> flash intensity
  const flashTimers = useRef<Map<number, number>>(new Map());

  const [balls, setBalls] = useState<Ball[]>([]);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [bankAccount, setBankAccount] = useState<number>(1000);
  const [displayBankAccount, setDisplayBankAccount] = useState<number>(1000);

  // Animation function for smooth number transitions
  const animateNumber = (start: number, end: number, setter: (value: number) => void) => {
    const duration = 500; // 500ms animation
    const steps = 30; // 30 steps for smooth animation
    const stepTime = duration / steps;
    const increment = (end - start) / steps;
    
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setter(end);
        clearInterval(timer);
      } else {
        setter(current);
      }
    }, stepTime);
  };

  // Initialize pin positions
  useEffect(() => {
    const pins: { x: number; y: number }[][] = [];
    const pinSpacingX = CANVAS_WIDTH / (PINS_PER_ROW + 1);
    const pinSpacingY = (CANVAS_HEIGHT * 0.7) / (ROWS + 1);

    for (let row = 0; row < ROWS; row++) {
      const pinsInRow = row % 2 === 0 ? PINS_PER_ROW : PINS_PER_ROW + 1;
      // Center the pins properly for each row
      const totalWidth = (pinsInRow - 1) * pinSpacingX;
      const startX = (CANVAS_WIDTH - totalWidth) / 2;
      pins[row] = [];

      for (let i = 0; i < pinsInRow; i++) {
        pins[row].push({
          x: startX + i * pinSpacingX,
          y: pinSpacingY + row * pinSpacingY,
        });
      }
    }
    pinLocations.current = pins;
  }, []);

  // Drop ball
  const dropBall = () => {
    if (betAmount.toFixed(2) > bankAccount.toFixed(2)) {
      console.log(betAmount)
      console.log(bankAccount)
      alert('Cannot bet more than your bank account!');
      return;
    }
    
    // Immediately deduct bet from bank account
    const newBankAccount = bankAccount - betAmount;
    setBankAccount(newBankAccount);
    
    // Animate the bank account display
    animateNumber(displayBankAccount, newBankAccount, setDisplayBankAccount);
    
    setBalls(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 40,
        y: BALL_SIZE,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0,
        active: true,
        currentRow: 0,
        counted: false,
      },
    ]);
  };

    // Drop 100 balls
  const drop100Balls = () => {
    const totalBet = betAmount * 100;
    if (totalBet > bankAccount) {
      alert(`Cannot bet $${totalBet} when you only have $${bankAccount}!`);
      return;
    }
    
    // Deduct total bet from bank account
    const newBankAccount = bankAccount - totalBet;
    setBankAccount(newBankAccount);
    animateNumber(displayBankAccount, newBankAccount, setDisplayBankAccount);
 
    const newBalls = Array.from({ length: 100 }, () => ({
      id: Math.random().toString(36).substr(2, 9),
      x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 40,
      y: BALL_SIZE,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0,
      active: true,
      currentRow: 0,
      counted: false,
    }));
    setBalls(prev => [...prev, ...newBalls]);
  };

    // Drop 1000 balls
  const drop1000Balls = () => {
    const totalBet = betAmount * 1000;
    if (totalBet > bankAccount) {
      alert(`Cannot bet $${totalBet} when you only have $${bankAccount}!`);
      return;
    }
    
    // Deduct total bet from bank account
    const newBankAccount = bankAccount - totalBet;
    setBankAccount(newBankAccount);
    animateNumber(displayBankAccount, newBankAccount, setDisplayBankAccount);
 
    const newBalls = Array.from({ length: 1000 }, () => ({
      id: Math.random().toString(36).substr(2, 9),
      x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 40,
      y: BALL_SIZE,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0,
      active: true,
      currentRow: 0,
      counted: false,
    }));
    setBalls(prev => [...prev, ...newBalls]);
  };

  // Reset all data
  const resetGame = () => {
    bucketCounts.current = Array(MULTIPLIERS.length).fill(0);
    countedBalls.current.clear();
    flashingBuckets.current.clear();
    flashTimers.current.forEach(timer => clearTimeout(timer));
    flashTimers.current.clear();
    setBalls([]);
    setBankAccount(1000);
    setDisplayBankAccount(1000);
  };

  const allIn = () => {
    setBetAmount(Math.round(bankAccount * 100) / 100);
  };

  // Animation loop
  useEffect(() => {
    const update = () => {
      setBalls(bs => {
        const updated = bs.map(b => {
          if (!b.active) return b;
          if (countedBalls.current.has(b.id)) return { ...b, active: false };
          let { x, y, vx, vy, currentRow } = b;

          vy += 0.2;
          x += vx;
          y += vy;

          // Ball hits each row's pin
          const pins = pinLocations.current;
          if (currentRow < ROWS) {
            const rowPins = pins[currentRow];
            const pinY = rowPins[0].y;
            if (y + BALL_SIZE / 2 >= pinY) {
              let closest = 0;
              let md = Math.abs(x - rowPins[0].x);
              for (let i = 1; i < rowPins.length; i++) {
                const dx = Math.abs(x - rowPins[i].x);
                if (dx < md) { md = dx; closest = i; }
              }
              const pin = rowPins[closest];
              y = pin.y - (BALL_SIZE + PIN_SIZE) / 2;

              const nextRow = pins[currentRow + 1];
              let targetX = x;
              if (nextRow) {
                // For even rows (10 pins) to odd rows (11 pins)
                if (currentRow % 2 === 0) {
                  // Even row: pin i can go to pins i and i+1 in next row
                  const left = nextRow[closest];
                  const right = nextRow[closest + 1];
                  if (left && right) {
                    // Pure 50/50 random choice
                    targetX = Math.random() < 0.5 ? left.x : right.x;
                  } else if (left) targetX = left.x;
                  else if (right) targetX = right.x;
                } else {
                  // Odd row (11 pins) to even row (10 pins): pin i can go to pins i-1 and i in next row
                  const left = nextRow[closest - 1];
                  const right = nextRow[closest];
                  if (left && right) {
                    // Pure 50/50 random choice
                    targetX = Math.random() < 0.5 ? left.x : right.x;
                  } else if (left) targetX = left.x;
                  else if (right) targetX = right.x;
                }
              } else {
                // Last row - pure 50/50 random choice
                targetX = Math.random() < 0.5 ? x - 30 : x + 30;
              }
              // Consistent velocity for predictable movement
              vx = x < targetX ? 1.5 : -1.5;
              vy = -Math.abs(vy) * 0.5;
              currentRow++;
            }
          }

          // Walls with stronger inward nudge to prevent edge accumulation
          if (x < BALL_SIZE / 2) {
            x = BALL_SIZE / 2;
            vx = Math.abs(vx) * (0.7 + Math.random() * 0.2); // Stronger inward nudge with randomness
          } else if (x > CANVAS_WIDTH - BALL_SIZE / 2) {
            x = CANVAS_WIDTH - BALL_SIZE / 2;
            vx = -Math.abs(vx) * (0.7 + Math.random() * 0.2); // Stronger inward nudge with randomness
          }

          // Floor -> bucket
          if (y > CANVAS_HEIGHT * 0.75 + 80 - BALL_SIZE / 2 && !countedBalls.current.has(b.id)) {
            // Compute bucket index from x / boxWidth for even distribution
            const boxWidth = CANVAS_WIDTH / MULTIPLIERS.length;
            const idx = Math.min(Math.floor(x / boxWidth), MULTIPLIERS.length - 1);
            
            bucketCounts.current[idx]++;
            countedBalls.current.add(b.id);
            
            // Calculate winnings and profit
            const multiplier = MULTIPLIERS[idx];
            const winAmount = betAmount * multiplier;
            
            // Add winnings back to bank account with animation
            const newBankAccount = bankAccount + winAmount;
            setBankAccount(newBankAccount);
            animateNumber(displayBankAccount, newBankAccount, setDisplayBankAccount);
            
            // Flash the bucket with intensity based on balls landed
            const currentIntensity = flashingBuckets.current.get(idx) || 0;
            const newIntensity = currentIntensity + 1;
            flashingBuckets.current.set(idx, newIntensity);
            
            if (flashTimers.current.has(idx)) {
              clearTimeout(flashTimers.current.get(idx)!);
            }
            const timer = window.setTimeout(() => {
              flashingBuckets.current.delete(idx);
              flashTimers.current.delete(idx);
            }, 5000);
            flashTimers.current.set(idx, timer);
            
            return { ...b, x, y, vx: 0, vy: 0, active: false, currentRow, counted: true };
          }
          
          return { ...b, x, y, vx, vy, currentRow };
        });
        const activeBalls = updated.filter(b => b.active);
        return activeBalls; // remove inactive balls
      });
    };

    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // draw pins
      ctx.fillStyle = '#9333ea';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 10;
      pinLocations.current.forEach(row =>
        row.forEach(pin => {
          ctx.beginPath();
          ctx.arc(pin.x, pin.y, PIN_SIZE / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
        })
      );

      // draw buckets and counters
      const boxWidth = CANVAS_WIDTH / MULTIPLIERS.length;
      const boxY = CANVAS_HEIGHT * 0.75;
      const bucketHeight = 80; // Shorter buckets
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      MULTIPLIERS.forEach((mult, i) => {
        const x0 = i * boxWidth;
        // bucket walls
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.strokeRect(x0, boxY, boxWidth, bucketHeight);
        
        // bucket background with flash effect
        const flashIntensity = flashingBuckets.current.get(i) || 0;
        if (flashIntensity > 0) {
          // Flash intensity based on number of balls landed
          const intensity = Math.min(flashIntensity, 50); // Higher cap for more variation
          const brightness = Math.min(255, 80 + intensity * 3); // Slower scaling for more variation
          ctx.fillStyle = `rgb(${brightness}, ${brightness}, 0)`; // Yellow with variable brightness
        } else {
          ctx.fillStyle = 'grey';
        }
        ctx.fillRect(x0, boxY, boxWidth, bucketHeight);
        
        // multiplier text
        ctx.fillStyle = 'white';
        ctx.fillText(`${mult}x`, x0 + boxWidth / 2, boxY + 4);
        // count text
        const count = bucketCounts.current[i];
        ctx.fillText(String(count), x0 + boxWidth / 2, boxY + 30);
      });

      // Draw distribution graph
      const graphY = boxY + bucketHeight + 20;
      const graphHeight = 90;
      const maxCount = Math.max(...bucketCounts.current);
      const totalBalls = bucketCounts.current.reduce((sum, count) => sum + count, 0);
      
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      bucketCounts.current.forEach((count, i) => {
        const x = i * boxWidth + boxWidth / 2;
        const height = maxCount > 0 ? (count / maxCount) * graphHeight : 0;
        const y = graphY + graphHeight - height;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw graph background
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, graphY, CANVAS_WIDTH, graphHeight);

      // Draw percentages on graph
      ctx.font = '12px Arial';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      bucketCounts.current.forEach((count, i) => {
        const x = i * boxWidth + boxWidth / 2;
        const percentage = totalBalls > 0 ? ((count / totalBalls) * 100).toFixed(1) : '0.0';
        ctx.fillText(`${percentage}%`, x, graphY + graphHeight + 15);
      });

      // draw balls
      balls.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'orange';
        ctx.fill();
        ctx.shadowBlur = 0;
      });


    };

    const animate = () => {
      update();
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [balls]);

  return (
    <div style={{ maxWidth: CANVAS_WIDTH, margin: 'auto', padding: 20, color: 'white' }}>
      {/* Bet Input and Results */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 16, 
        alignItems: 'center',
        backgroundColor: '#1f2937',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #374151'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 16, fontWeight: 'bold' }}>Bet Amount:</label>
          <input
            type="number"
            value={betAmount.toFixed(2)}
            onChange={(e) => {
              const newBet = Number(e.target.value) || 0;
              setBetAmount(Math.min(Math.round(newBet * 100) / 100, bankAccount));
            }}
            min="0"
            max={bankAccount}
            step="1"
            style={{
              padding: '8px 12px',
              fontSize: 16,
              borderRadius: 6,
              border: '1px solid #374151',
              backgroundColor: '#111827',
              color: 'white',
              width: '100px'
            }}
          />
          <button 
            onClick={allIn}
            style={{
              padding: '8px 16px', 
              fontSize: 16, 
              borderRadius: 6, 
              border: 'none',
              backgroundColor: '#f59e0b', 
              color: 'white', 
              cursor: 'pointer'
            }}
          >
            All In
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 16, fontWeight: 'bold' }}>Bank Account:</label>
          <span style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: displayBankAccount >= 1000 ? '#10b981' : displayBankAccount >= 500 ? '#fbbf24' : '#ef4444'
          }}>
            ${displayBankAccount.toFixed(2)}
          </span>
        </div>
      
        

      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <button
          onClick={dropBall}
          style={{
            padding: '8px 16px', fontSize: 16, borderRadius: 6, border: 'none',
            backgroundColor: '#9333ea', color: 'white', cursor: 'pointer'
          }}
        >
          Drop Ball
        </button>
        <button
          onClick={drop100Balls}
          style={{
            padding: '8px 16px', fontSize: 16, borderRadius: 6, border: 'none',
            backgroundColor: '#059669', color: 'white', cursor: 'pointer'
          }}
        >
          Drop 100 Balls
        </button>
        <button
          onClick={drop1000Balls}
          style={{
            padding: '8px 16px', fontSize: 16, borderRadius: 6, border: 'none',
            backgroundColor: '#7c3aed', color: 'white', cursor: 'pointer'
          }}
        >
          Drop 1000 Balls
        </button>
        <button
          onClick={resetGame}
          style={{
            padding: '8px 16px', fontSize: 16, borderRadius: 6, border: 'none',
            backgroundColor: '#dc2626', color: 'white', cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
      

      
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
        style={{ width: '100%', borderRadius: 8, display: 'block' }} />
    </div>
  );
}
