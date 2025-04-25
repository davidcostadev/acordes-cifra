import { useState, useEffect, useMemo } from 'react';
import * as Scale from '@tonaljs/scale';
import { Chord } from '@tonaljs/tonal';
import { ProcessedLine, processLine } from './utils';

interface CustomChord {
  n: string;
  m: string;
  d: string | null;
  p: boolean | null;
}

interface UseSongProcessingResult {
  title: string;
  processedContent: ProcessedLine[];
  processedContentTransposed: ProcessedLine[];
  customChords: CustomChord[];
  originalKey: string;
  transposedKey: string;
  isLoading: boolean;
  error: string | null;
  chords: string[];
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const transposeChord = (chord: string, semitones: number): string => {
  // Handle empty chords
  if (!chord) return chord;

  // Find the root note and any modifiers
  // D/E
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  const [, rootNote, modifiers] = match;

  // Convert flats to sharps for consistency
  let normalizedRoot = rootNote.replace('b', '#');
  if (rootNote.includes('b')) {
    const index = NOTES.indexOf(NOTES[(NOTES.indexOf(rootNote[0]) + 11) % 12]);
    normalizedRoot = NOTES[index];
  }

  // Find the index of the root note
  const noteIndex = NOTES.indexOf(normalizedRoot);
  if (noteIndex === -1) return chord;

  // Calculate the new note index
  let newIndex = (noteIndex + semitones + 12) % 12;
  if (newIndex < 0) newIndex += 12;

  // Get the modifiers notes
  if (modifiers.includes('/')) {
    const [chordPart, bassNote] = modifiers.split('/');
    const modifierIndex = NOTES.indexOf(bassNote);
    if (modifierIndex === -1) return chord;

    let newModifierIndex = (modifierIndex + semitones + 12) % 12;
    if (newModifierIndex < 0) newModifierIndex += 12;

    return NOTES[newIndex] + chordPart + '/' + NOTES[newModifierIndex];
  }
  // Return the new chord
  return NOTES[newIndex] + modifiers;
};

const getTransposedKey = (originalKey: string, semitones: number): string => {
  const normalizedKey = originalKey;
  const currentIndex = NOTES.indexOf(normalizedKey);
  if (currentIndex === -1) return originalKey;

  let newIndex = (currentIndex + semitones + 12) % 12;
  if (newIndex < 0) newIndex += 12;

  return NOTES[newIndex];
};

const getChords = (lines: ProcessedLine[]): string[] => {
  const uniqueChords = new Set<string>();
  lines.forEach((line) => {
    line.parts.forEach((part) => {
      if (part.type === 'chord') uniqueChords.add(part.content);
    });
  });
  const sortedChords = Array.from(uniqueChords).sort();

  if (sortedChords.length === 0) return ['C'];

  return sortedChords;
};

const detectKey = (lines: ProcessedLine[]): string => {
  const chordArray = getChords(lines);

  // Try to detect scales for each possible tonic
  let bestMatch = {
    tonic: 'C',
    matchCount: 0,
    scales: [] as string[],
  };
  const notesFromChords: string[] = [
    ...new Set(
      ...chordArray.flatMap((chord) => {
        return Chord.get(chord).notes;
      })
    ),
  ];

  NOTES.forEach((tonic) => {
    const scales = Scale.detect(notesFromChords, { tonic, match: 'fit' });

    // Prefer scales with more matches
    if (scales.length > bestMatch.matchCount) {
      bestMatch = {
        tonic,
        matchCount: scales.length,
        scales,
      };
    }
    // If equal number of matches, prefer if the tonic chord is in our chord list
    else if (scales.length === bestMatch.matchCount && chordArray.includes(tonic)) {
      bestMatch = {
        tonic,
        matchCount: scales.length,
        scales,
      };
    }
  });

  return bestMatch.tonic;
};

export const useSongProcessing = (
  fileName: string | null,
  transpose: number = 0
): UseSongProcessingResult => {
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
        const detectedKey = detectKey(processed)
          .replace('b', '#')
          .replace('B#', 'C')
          .replace('E#', 'F')
          .replace('Cb', 'B')
          .replace('Fb', 'E');

        setOriginalKey(detectedKey);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSong();
  }, [fileName]);

  const processedContentTransposed = useMemo(() => {
    return processedContent.map((line) => ({
      parts: line.parts.map((part) => ({
        type: part.type,
        content:
          part.type === 'chord' ? transposeChord(part.content.trim(), transpose) : part.content,
      })),
    }));
  }, [processedContent, transpose]);

  const transposedKey = useMemo(() => {
    return getTransposedKey(originalKey, transpose);
  }, [originalKey, transpose]);

  const chords = useMemo(() => {
    return getChords(processedContent).map((chord) => transposeChord(chord, transpose));
  }, [processedContent, transpose]);

  const result = useMemo(
    () => ({
      title,
      processedContent,
      processedContentTransposed,
      customChords,
      originalKey,
      transposedKey,
      isLoading,
      error,
      chords,
    }),
    [
      title,
      processedContent,
      processedContentTransposed,
      customChords,
      originalKey,
      transposedKey,
      isLoading,
      error,
      chords,
    ]
  );

  return result;
};
