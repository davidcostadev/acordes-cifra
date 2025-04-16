import React, { useEffect, useRef } from 'react';

interface ChordVisualizerProps {
  chordName: string;
  onClose: () => void;
  position: {
    top: number;
    left: number;
  };
  customChords?: Array<{
    n: string;
    m: string;
    d: string | null;
    p: boolean | null;
  }>;
}

class BibliotecaAcorde {
  bibliotecaAcordesBasicos = [
    { n: 'C', m: 'X 3 2 0 1 0', d: '032010', p: null },
    { n: 'C#', m: 'X 4 6 6 6 4', d: '012341', p: true },
    { n: 'D', m: 'X X 0 2 3 2', d: '000132', p: null },
    { n: 'D#', m: 'X 6 8 8 8 6', d: '012341', p: true },
    { n: 'E', m: '0 2 2 1 0 0', d: '023100', p: null },
    { n: 'F', m: '1 3 3 2 1 1', d: '134211', p: true },
    { n: 'F#', m: '2 4 4 3 2 2', d: '134211', p: true },
    { n: 'G', m: '3 2 0 0 3 3', d: '210034', p: null },
    { n: 'G#', m: '4 6 6 5 4 4', d: '134211', p: true },
    { n: 'A', m: 'X 0 2 2 2 0', d: '0012300', p: null },
    { n: 'A#', m: 'X 1 3 3 3 1', d: '012341', p: true },
    { n: 'B', m: 'X 2 4 4 4 2', d: '012341', p: true },
  ];

  bibliotecaAcordesCustomizados: Array<{
    n: string;
    m: string;
    d: string | null;
    p: boolean | null;
  }> = [];

  constructor(customChords?: Array<{ n: string; m: string; d: string | null; p: boolean | null }>) {
    if (customChords) {
      this.bibliotecaAcordesCustomizados = customChords;
    }
  }

  getAcordePorCifra(cifra: string) {
    return (
      this.bibliotecaAcordesCustomizados.find((acorde) => acorde.n === cifra) ||
      this.bibliotecaAcordesBasicos.find((acorde) => acorde.n === cifra)
    );
  }
}

class Acorde {
  cifra: string;
  molde: string;
  dedos: string | null;
  pestana: boolean | null;

  constructor(
    cifra: string,
    molde: string,
    dedos: string | null = null,
    pestana: boolean | null = null
  ) {
    this.cifra = cifra;
    this.molde = molde;
    this.dedos = dedos;
    this.pestana = pestana;
  }

  moldeSeparado() {
    return this.molde.split(' ');
  }

  desenharAcorde(ctx: CanvasRenderingContext2D) {
    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 100, 130);

    // Draw chord name
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.cifra, 50, 10);

    // Draw fretboard
    ctx.fillStyle = '#000000';
    ctx.fillRect(20, 27, 71, 3); // Nut

    // Draw vertical lines (strings)
    for (let i = 0; i < 6; i++) {
      const x = (70 / 5) * i + 20;
      ctx.fillRect(x, 30, 1, 90);
    }

    // Draw horizontal lines (frets)
    for (let i = 1; i < 7; i++) {
      const y = (90 / 6) * i + 30;
      ctx.fillRect(20, y, 71, 1);
    }

    // Draw finger positions
    const positions = this.moldeSeparado();
    positions.forEach((pos, index) => {
      const x = (70 / 5) * (5 - index) + 20;
      if (pos === 'X' || pos === 'x') {
        ctx.font = 'bold 13px Arial';
        ctx.fillText('x', x, 21);
      } else if (pos === '0') {
        ctx.beginPath();
        ctx.arc(x, 21, 4, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        const fret = parseInt(pos);
        const y = (90 / 6) * fret + 40 / 2;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();

        if (this.dedos) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'italic bold 13px Arial';
          ctx.fillText(this.dedos[index], x, y);
          ctx.fillStyle = '#000000';
        }
      }
    });

    // Draw barre if needed
    if (this.pestana) {
      const firstPos = positions[0];
      const fret =
        firstPos === 'X' || firstPos === 'x' ? parseInt(positions[1]) : parseInt(firstPos);
      const startX = firstPos === 'X' || firstPos === 'x' ? (70 / 5) * 4 + 20 : (70 / 5) * 5 + 20;
      const y = (90 / 6) * fret + 40 / 2;
      ctx.fillRect(startX - 5, y - 3, 95 - startX, 6);
    }
  }
}

export const ChordVisualizer = ({
  chordName,
  onClose,
  position,
  customChords,
}: ChordVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const biblioteca = new BibliotecaAcorde(customChords);
    const acordeInfo = biblioteca.getAcordePorCifra(chordName);

    if (acordeInfo) {
      const acorde = new Acorde(acordeInfo.n, acordeInfo.m, acordeInfo.d, acordeInfo.p);
      acorde.desenharAcorde(ctx);
    } else {
      // Fallback for unknown chords
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Chord ${chordName} not found`, canvas.width / 2, canvas.height / 2);
    }
  }, [chordName, customChords]);

  return (
    <div
      className="absolute bg-white rounded-lg shadow-lg p-2"
      style={{
        top: position.top - 20,
        left: position.left - 55,
        zIndex: 100,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <canvas ref={canvasRef} width={100} height={130} className="rounded-lg" />
    </div>
  );
};
