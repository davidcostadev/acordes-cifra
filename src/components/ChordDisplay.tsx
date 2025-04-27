import { useEffect, useRef } from 'react';

interface ChordDisplayProps {
  chordName?: string;
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

  menorPosicaoAcorde() {
    const moldeSeparado = this.moldeSeparado()
      .filter((item) => {
        return item !== 'X' && item !== 'x' && item !== '0';
      })
      .map(Number);

    return Math.min(...moldeSeparado);
  }

  montarGrelha(contexto: CanvasRenderingContext2D) {
    // Set a background color to make sure we can see the canvas
    contexto.fillStyle = '#f0f0f0';
    contexto.fillRect(0, 0, 100, 130);

    contexto.fillStyle = 'rgb(255,255,255)';
    contexto.fillRect(0, 0, 100, 130);
    contexto.fillStyle = 'rgb(0,0,0)';
    contexto.fillRect(20, 27, 71, 3);

    // Draw vertical lines
    for (let index = 0; index < 6; index++) {
      let x = (70 / 5) * index + 20;
      contexto.fillRect(x, 30, 1, 90);
    }

    // Draw horizontal lines
    for (let index = 1; index < 7; index++) {
      let y = (90 / 6) * index + 30;
      contexto.fillRect(20, y, 71, 1);
    }
  }

  posicionaDigitacao(
    contexto: CanvasRenderingContext2D,
    corda: number,
    casa: string | number,
    dedo: string | null = null
  ) {
    contexto.fillStyle = 'rgb(0,0,0)';
    corda = 7 - corda;
    let x = (70 / 5) * corda + 7;
    const casaNum = Number(casa);

    if (casaNum > 0) {
      let y = 37;
      if (casaNum > 1) {
        y = (90 / 6) * casaNum + 46 / 2;
      }
      let bolinha = new Path2D();
      bolinha.arc(x, y, 6, 0, 2 * Math.PI);
      contexto.fill(bolinha);
      if (dedo != null) {
        contexto.fillStyle = 'rgb(255,255,255)';
        contexto.font = 'italic bold 13px Arial';
        contexto.textAlign = 'center';
        contexto.textBaseline = 'middle';
        contexto.fillText(dedo, x, y);
      }
    } else {
      if (casaNum === 0) {
        let solta = new Path2D();
        solta.arc(x, 21, 4, 0, 2 * Math.PI);
        contexto.stroke(solta);
      } else {
        contexto.font = 'bold 13px Arial';
        contexto.textAlign = 'center';
        contexto.textBaseline = 'middle';
        contexto.fillText('x', x, 21);
      }
    }
  }

  posicionaPestana(contexto: CanvasRenderingContext2D, corda: number, casa: number) {
    contexto.fillStyle = 'rgb(0,0,0)';
    corda = 7 - corda;
    let x = (70 / 5) * corda + 1;
    let y = (90 / 6) * casa + 40 / 2;
    contexto.fillRect(x, y, 95 - x, 6);
  }

  montaAcorde(contexto: CanvasRenderingContext2D) {
    // Desenha a grelha do acorde
    this.montarGrelha(contexto);

    // Escreve o nome da cifra sobre a grelha
    contexto.font = 'bold 12px Arial';
    contexto.textAlign = 'center';
    contexto.textBaseline = 'middle';
    contexto.fillText(this.cifra, 55, 10);

    // Prepara cifra do acorde
    let moldeSeparado = this.moldeSeparado();
    let pestanaCasa = -1;

    // Verifica se irá desenhar pestana
    if (this.pestana) {
      if (moldeSeparado[0] === 'X' || moldeSeparado[0] === 'x') {
        pestanaCasa = Number(moldeSeparado[1]);
        this.posicionaPestana(contexto, 5, pestanaCasa);
      } else {
        pestanaCasa = Number(moldeSeparado[0]);
        this.posicionaPestana(contexto, 6, pestanaCasa);
      }
    }

    // Verifica se irá utilizar numeros dos dedos
    if (this.dedos == null) {
      // Monta posicionamento de dedos
      moldeSeparado.forEach((posicao, i) => {
        if (pestanaCasa !== Number(posicao)) {
          this.posicionaDigitacao(contexto, 6 - i, posicao);
        }
      });
    } else {
      // Monta posicionamento numérico de dedos
      moldeSeparado.forEach((posicao, i) => {
        if (pestanaCasa !== Number(posicao)) {
          this.posicionaDigitacao(contexto, 6 - i, posicao, this.dedos![i]);
        }
      });
    }
  }
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

  getAcordePorCifra(cifra: string) {
    return this.bibliotecaAcordesBasicos.find((acorde) => acorde.n === cifra);
  }
}

export const ChordDisplay = ({ chordName = 'C' }: ChordDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Clear the canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const biblioteca = new BibliotecaAcorde();
    const acordeInfo = biblioteca.getAcordePorCifra(chordName);

    if (acordeInfo) {
      const acorde = new Acorde(acordeInfo.n, acordeInfo.m, acordeInfo.d, acordeInfo.p);
      acorde.montaAcorde(ctx);
    } else {
      // Fallback for unknown chords
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Chord ${chordName} not found`, canvas.width / 2, canvas.height / 2);
    }
  }, [chordName]);

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={130}
      className="rounded-lg shadow-md"
      style={{ border: '1px solid #ccc', background: '#f0f0f0' }}
    />
  );
};
