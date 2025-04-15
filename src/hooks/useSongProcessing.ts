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
  originalKey: string;
  isLoading: boolean;
  error: string | null;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const detectKey = (lines: ProcessedLine[]): string => {
  const chordCounts: { [key: string]: number } = {};

  // Count occurrences of each root note
  lines.forEach((line) => {
    line.parts.forEach((part) => {
      if (part.type === 'chord') {
        const match = part.content.match(/^([A-G][#b]?)/);
        if (match) {
          const rootNote = match[1];
          // Normalize flats to sharps
          const normalizedRoot = rootNote.replace('b', '#');
          chordCounts[normalizedRoot] = (chordCounts[normalizedRoot] || 0) + 1;
        }
      }
    });
  });

  // Find the most common root note
  let maxCount = 0;
  let detectedKey = 'C'; // Default to C if no chords found

  Object.entries(chordCounts).forEach(([note, count]) => {
    if (count > maxCount) {
      maxCount = count;
      detectedKey = note;
    }
  });

  return detectedKey;
};

export const useSongProcessing = (fileName: string | null): UseSongProcessingResult => {
  const [title, setTitle] = useState<string>('');
  const [processedContent, setProcessedContent] = useState<ProcessedLine[]>([]);
  const [customChords, setCustomChords] = useState<CustomChord[]>([]);
  const [originalKey, setOriginalKey] = useState<string>('C');
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

        // Detect and set the original key
        const detectedKey = detectKey(processed);
        setOriginalKey(detectedKey);
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
      originalKey,
      isLoading,
      error,
    }),
    [title, processedContent, customChords, originalKey, isLoading, error]
  );

  return result;
};
