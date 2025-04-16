/** @jsxImportSource react */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { KeyboardChordVisualizer } from './KeyboardChordVisualizer';
import { useSongProcessing } from '../hooks/useSongProcessing';

interface SongContentProps {
  fileName: string;
  transpose: number;
  columns: number;
  renderKey?: (originalKey: string) => React.ReactNode;
}

interface ChordPosition {
  name: string;
  top: number;
  left: number;
}

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

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const transposeChord = (chord: string, semitones: number): string => {
  // Handle empty chords
  if (!chord) return chord;

  // Find the root note and any modifiers
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

  // Return the new chord
  return NOTES[newIndex] + modifiers;
};

const Chord: React.FC<{
  content: string;
  onChordClick: (event: React.MouseEvent<HTMLSpanElement>) => void;
  onChordMouseEnter: (event: React.MouseEvent<HTMLSpanElement>) => void;
  onChordMouseLeave: () => void;
  isSelected: boolean;
}> = ({ content, onChordClick, onChordMouseEnter, onChordMouseLeave, isSelected }) => {
  return (
    <span
      className={`chord text-blue-600 font-bold cursor-pointer hover:text-blue-800 hover:bg-blue-100 ${
        isSelected ? 'bg-blue-100' : ''
      }`}
      onClick={onChordClick}
      onMouseEnter={onChordMouseEnter}
      onMouseLeave={onChordMouseLeave}
    >
      {content}
    </span>
  );
};

export const SongContent = ({ fileName, transpose, columns, renderKey }: SongContentProps) => {
  const [hoveredChord, setHoveredChord] = useState<ChordPosition | null>(null);
  const [selectedChord, setSelectedChord] = useState<ChordPosition | null>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);

  const { title, processedContentTransposed, originalKey, isLoading, error } = useSongProcessing(
    fileName,
    transpose
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (visualizerRef.current && !visualizerRef.current.contains(event.target as Node)) {
        setSelectedChord(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (renderKey) {
    return renderKey(originalKey);
  }

  const handleChordClick = useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();

      if (selectedChord?.name === target.textContent) {
        setSelectedChord(null);
      } else {
        setSelectedChord({
          name: target.textContent || '',
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
        });
      }
      setHoveredChord(null);
    },
    [selectedChord]
  );

  const handleChordMouseEnter = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (selectedChord) return;
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    setHoveredChord({
      name: target.textContent || '',
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  const handleChordMouseLeave = () => {
    if (selectedChord) return;
    setHoveredChord(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Split content into columns vertically
  const totalLines = processedContentTransposed.length;
  const linesPerColumn = Math.ceil(totalLines / columns);
  const columnContents: ProcessedLine[][] = Array.from({ length: columns }, (_, columnIndex) => {
    const startIndex = columnIndex * linesPerColumn;
    return processedContentTransposed.slice(startIndex, startIndex + linesPerColumn);
  });

  return (
    <div className="whitespace-pre-wrap font-mono relative">
      <h2>{title}</h2>
      <div className="grid grid-flow-col auto-cols-fr gap-8">
        {columnContents.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col space-y-1">
            {column.map((line, lineIndex) => (
              <p key={lineIndex} className="my-0 leading-5 text-sm">
                {line.parts.map((part, partIndex) => {
                  if (part.type === 'chord') {
                    return (
                      <Chord
                        key={partIndex}
                        content={part.content}
                        onChordClick={handleChordClick}
                        onChordMouseEnter={handleChordMouseEnter}
                        onChordMouseLeave={handleChordMouseLeave}
                        isSelected={selectedChord?.name === part.content}
                      />
                    );
                  }
                  return <span key={partIndex}>{part.content}</span>;
                })}
              </p>
            ))}
          </div>
        ))}
      </div>
      {(hoveredChord || selectedChord) && (
        <div
          ref={visualizerRef}
          className="fixed"
          style={{
            top: (selectedChord || hoveredChord)!.top + 24,
            left: Math.max(10, (selectedChord || hoveredChord)!.left - 100),
            width: '266px',
            height: '200px',
            zIndex: 100,
          }}
        >
          <KeyboardChordVisualizer
            chordName={(selectedChord || hoveredChord)!.name}
            position={{ top: 0, left: 0 }}
          />
        </div>
      )}
    </div>
  );
};
