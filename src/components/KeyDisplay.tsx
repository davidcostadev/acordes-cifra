import React from 'react';
import { useSongProcessing } from '../hooks/useSongProcessing';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const getTransposedKey = (originalKey: string, semitones: number): string => {
  const normalizedKey = originalKey.replace('b', '#');
  const currentIndex = NOTES.indexOf(normalizedKey);
  if (currentIndex === -1) return originalKey;

  let newIndex = (currentIndex + semitones + 12) % 12;
  if (newIndex < 0) newIndex += 12;

  return NOTES[newIndex];
};

interface KeyDisplayProps {
  fileName: string;
  transpose: number;
}

export const KeyDisplay: React.FC<KeyDisplayProps> = ({ fileName, transpose }) => {
  const { originalKey, isLoading, error } = useSongProcessing(fileName);

  if (isLoading) {
    return <div className="w-12 text-center font-mono">...</div>;
  }

  if (error) {
    return <div className="w-12 text-center font-mono text-red-500">Error</div>;
  }

  const displayKey = transpose === 0 ? originalKey : getTransposedKey(originalKey, transpose);

  return <div className="w-12 text-center font-mono font-bold">{displayKey}</div>;
};
