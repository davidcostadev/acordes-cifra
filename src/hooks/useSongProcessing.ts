import { useState, useEffect, useMemo } from 'react';

interface CustomChord {
  n: string;
  m: string;
  d: string | null;
  p: boolean | null;
}

interface ProcessedLine {
  parts: {
    type: 'text' | 'chord';
    content: string;
  }[];
}

interface UseSongProcessingResult {
  title: string;
  processedContent: ProcessedLine[];
  customChords: CustomChord[];
  isLoading: boolean;
  error: string | null;
}

export const useSongProcessing = (fileName: string | null): UseSongProcessingResult => {
  const [title, setTitle] = useState<string>('');
  const [processedContent, setProcessedContent] = useState<ProcessedLine[]>([]);
  const [customChords, setCustomChords] = useState<CustomChord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processCustomChords = (acordesSection: string): CustomChord[] => {
    if (!acordesSection) return [];

    const novosAcordes: CustomChord[] = [];
    const acordesLines = acordesSection.split('\n');

    acordesLines.forEach((linha) => {
      const sep = linha.split(' = ');
      if (sep[0] !== '') {
        novosAcordes.push({
          n: sep[0],
          m: sep[1],
          d: null,
          p: null,
        });
      }
    });

    return novosAcordes;
  };

  const processLine = (line: string): ProcessedLine => {
    const notas = '[A-G]';
    const acentuacoes = '(?:b|bb)';
    const acordes = '*(?:#|##|sus|maj|min|aug|m|M|\\+|-|dim)';
    const com = '*[\\d\\/]*';
    const numeros = '*(?:[1-9])';
    const foraMusica = '(?=\\s|$)(?! \\w)';
    const padrao =
      '(' +
      '\\b(' +
      notas +
      acentuacoes +
      numeros +
      acordes +
      com +
      '(?:' +
      notas +
      acentuacoes +
      acordes +
      com +
      ')*)' +
      foraMusica +
      ')';
    const regex = new RegExp(padrao, 'g');

    const parts: ProcessedLine['parts'] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: line.slice(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'chord',
        content: match[0],
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      parts.push({
        type: 'text',
        content: line.slice(lastIndex),
      });
    }

    return { parts };
  };

  useEffect(() => {
    const fetchSong = async () => {
      if (!fileName) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/musicas/${fileName}.txt`);
        if (!response.ok) {
          throw new Error('Failed to fetch song');
        }

        const text = await response.text();
        const sections = text.split('[Acordes]');
        const mainContent = sections[0];
        const acordesSection = sections[1];

        if (acordesSection) {
          const newCustomChords = processCustomChords(acordesSection);
          setCustomChords(newCustomChords);
        }

        const lines = mainContent.split('\n');
        setTitle(lines[0]);
        const processed = lines.slice(1).map((line) => processLine(line));
        setProcessedContent(processed);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSong();
  }, [fileName]);

  const result = useMemo(
    () => ({
      title,
      processedContent,
      customChords,
      isLoading,
      error,
    }),
    [title, processedContent, customChords, isLoading, error]
  );

  return result;
};
