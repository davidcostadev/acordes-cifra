/** @jsxImportSource react */
import React, { useState, useCallback, useMemo } from 'react';
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

  const { title, processedContent, originalKey, isLoading, error } = useSongProcessing(fileName);

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

  const renderLine = useMemo(() => {
    return (line: ProcessedLine) => {
      return line.parts.map((part, index) => {
        if (part.type === 'chord') {
          const transposedChord = transposeChord(part.content.trim(), transpose);
          return (
            <Chord
              key={index}
              content={transposedChord}
              onChordClick={handleChordClick}
              onChordMouseEnter={handleChordMouseEnter}
              onChordMouseLeave={handleChordMouseLeave}
              isSelected={selectedChord?.name === transposedChord}
            />
          );
        }
        return <span key={index}>{part.content}</span>;
      });
    };
  }, [handleChordClick, selectedChord?.name, transpose]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (columns === 1) {
    return (
      <div className="whitespace-pre-wrap font-mono relative">
        <h2>{title}</h2>
        <div className="song-content">
          {processedContent.map((line, index) => (
            <p key={index} className="my-0 relative">
              {renderLine(line)}
            </p>
          ))}
        </div>
        {(hoveredChord || selectedChord) && (
          <div
            className="fixed"
            style={{
              top: (selectedChord || hoveredChord)!.top + 60,
              left: Math.max(10, (selectedChord || hoveredChord)!.left - 100),
              width: '300px',
              height: '200px',
              zIndex: 100,
            }}
            onClick={() => setSelectedChord(null)}
          >
            <KeyboardChordVisualizer
              chordName={(selectedChord || hoveredChord)!.name}
              position={{ top: 0, left: 0 }}
            />
          </div>
        )}
      </div>
    );
  } else {
    const partSize = Math.ceil(processedContent.length / columns);
    const columnContents: ProcessedLine[][] = [];

    for (let i = 0; i < processedContent.length; i += partSize) {
      columnContents.push(processedContent.slice(i, i + partSize));
    }

    return (
      <div className="whitespace-pre-wrap font-mono relative">
        <h2>{title}</h2>
        <div className="row">
          {columnContents.map((column, colIndex) => (
            <div key={colIndex} className="col">
              {column.map((line, lineIndex) => (
                <p key={lineIndex} className="my-0 relative">
                  {renderLine(line)}
                </p>
              ))}
            </div>
          ))}
        </div>
        {(hoveredChord || selectedChord) && (
          <div
            className="fixed"
            style={{
              top: (selectedChord || hoveredChord)!.top + 20,
              left: Math.max(10, (selectedChord || hoveredChord)!.left - 100),
              width: '300px',
              height: '200px',
              zIndex: 100,
            }}
            onClick={() => setSelectedChord(null)}
          >
            <KeyboardChordVisualizer
              chordName={(selectedChord || hoveredChord)!.name}
              position={{ top: 0, left: 0 }}
            />
          </div>
        )}
      </div>
    );
  }
};
