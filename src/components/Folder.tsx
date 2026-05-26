import React, { useState } from 'react';
import { History } from 'lucide-react';
import './Folder.css';

interface FolderProps {
  color?: string;
  size?: number;
  items?: React.ReactNode[];
  className?: string;
  open?: boolean;
  onToggle?: () => void;
}

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split('')
      .map(c => c + c)
      .join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const Folder: React.FC<FolderProps> = ({ 
  color = '#5227FF', 
  size = 1, 
  items = [], 
  className = '',
  open: controlledOpen,
  onToggle
}) => {
  const maxItems = 10;
  const papers = items.slice(0, maxItems);
  while (papers.length < maxItems) {
    papers.push(null);
  }

  const activePapers = items.filter(Boolean);
  const displayPapers = activePapers.length > 0 ? activePapers : [];

  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : localOpen;

  const [paperOffsets, setPaperOffsets] = useState<{ x: number; y: number }[]>(
    Array.from({ length: 15 }, () => ({ x: 0, y: 0 }))
  );

  const folderBackColor = darkenColor(color, 0.08);
  const paper1 = darkenColor('#ffffff', 0.1);
  const paper2 = darkenColor('#ffffff', 0.05);
  const paper3 = '#ffffff';

  const handleClick = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalOpen(prev => !prev);
    }
    if (open) {
      setPaperOffsets(Array.from({ length: 15 }, () => ({ x: 0, y: 0 })));
    }
  };

  const handlePaperMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    if (!open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;
    setPaperOffsets(prev => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: offsetX, y: offsetY };
      return newOffsets;
    });
  };

  const handlePaperMouseLeave = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    setPaperOffsets(prev => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: 0, y: 0 };
      return newOffsets;
    });
  };

  const folderStyle: React.CSSProperties = {
    '--folder-color': color,
    '--folder-back-color': folderBackColor,
    '--paper-1': paper1,
    '--paper-2': paper2,
    '--paper-3': paper3
  } as React.CSSProperties;

  const folderClassName = `folder ${open ? 'open' : ''}`.trim();
  const scaleStyle = { transform: `scale(${size})`, display: 'inline-block' };

  // Calculate paper stack when closed versus fanned arc when open
  const totalDisplay = displayPapers.length;

  return (
    <div style={scaleStyle} className={className}>
      <div className={folderClassName} style={folderStyle} onClick={handleClick}>
        <div className="folder__back">
          {/* Closed stack fallback cards if no active papers exist, just for aesthetic */}
          {!open && totalDisplay === 0 && (
            <>
              <div className="paper paper-1" />
              <div className="paper paper-2" />
              <div className="paper paper-3" />
            </>
          )}

          {/* Render real stacked papers when closed, or fanned out arc when open */}
          {(!open ? papers.slice(0, Math.max(3, totalDisplay)) : displayPapers).map((item, i) => {
            let paperStyle: React.CSSProperties = {};
            if (open && totalDisplay > 0) {
              const isOnly = totalDisplay === 1;
              const pct = isOnly ? 0.5 : i / (totalDisplay - 1);
              
              // Angle fans elegantly from -40deg to +40deg
              const angle = isOnly ? 0 : -35 + pct * 70;
              
              // tx spans smoothly and compactly relative to the parent
              const tx = isOnly ? -50 : -150 + pct * 200;
              
              // ty forms a tight parabolic arch peaking in the middle
              const ty = isOnly ? -110 : -85 - 4 * pct * (1 - pct) * 55;

              paperStyle = {
                transform: `translate(calc(${tx}% + var(--magnet-x, 0px)), calc(${ty}% + var(--magnet-y, 0px))) rotateZ(${angle}deg) scale(1.05)`,
                zIndex: 10 + i,
                position: 'absolute',
                bottom: '10%',
                left: '50%',
                width: '115px',
                height: '145px',
                background: 'rgba(10, 10, 12, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                boxShadow: 'inset 0 1px 1.5px rgba(255, 255, 255, 0.15), 0 6px 24px rgba(0, 0, 0, 0.8)',
                transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), width 0.4s, height 0.4s, background 0.3s, border 0.3s, box-shadow 0.3s',
              };
            }

            return (
              <div
                key={i}
                className={`paper paper-${(i % 3) + 1}`}
                onMouseMove={e => handlePaperMouseMove(e, i)}
                onMouseLeave={e => handlePaperMouseLeave(e, i)}
                onClick={e => {
                  if (open) {
                    e.stopPropagation();
                  }
                }}
                style={
                  open
                    ? {
                        ...paperStyle,
                        '--magnet-x': `${paperOffsets[i]?.x || 0}px`,
                        '--magnet-y': `${paperOffsets[i]?.y || 0}px`
                      } as React.CSSProperties
                    : {}
                }
              >
                {item}
              </div>
            );
          })}
          <div className="folder__front"></div>
          <div className="folder__front right"></div>
          <History 
            className={`w-5 h-5 text-white/35 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] z-[5] pointer-events-none transition-all duration-300 ${
              open ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
            }`} 
          />
        </div>
      </div>
    </div>
  );
};

export default Folder;
