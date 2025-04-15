/** @jsxImportSource react */
import React, { useState, useCallback, useMemo } from 'react';
import { KeyboardChordVisualizer } from './KeyboardChordVisualizer';
import { useSongProcessing } from '../hooks/useSongProcessing';

interface SongContentProps {
  fileName: string;
  transpose: number;
  columns: number;
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

export const SongContent = ({ fileName, transpose, columns }: SongContentProps) => {
  const [hoveredChord, setHoveredChord] = useState<ChordPosition | null>(null);
  const [selectedChord, setSelectedChord] = useState<ChordPosition | null>(null);

  const { title, processedContent, isLoading, error } = useSongProcessing(fileName);

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
    if (selectedChord) return; // Don't show hover when a chord is selected
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    setHoveredChord({
      name: target.textContent || '',
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  const handleChordMouseLeave = () => {
    if (selectedChord) return; // Don't hide if a chord is selected
    setHoveredChord(null);
  };

  const renderLine = useMemo(() => {
    console.log('Memoizing renderLine');
    return (line: ProcessedLine) => {
      console.log(line);
      return line.parts.map((part, index) => {
        if (part.type === 'chord') {
          return (
            <Chord
              key={index}
              content={part.content}
              onChordClick={handleChordClick}
              onChordMouseEnter={handleChordMouseEnter}
              onChordMouseLeave={handleChordMouseLeave}
              isSelected={selectedChord?.name === part.content}
            />
          );
        }
        return <span key={index}>{part.content}</span>;
      });
    };
  }, [handleChordClick, selectedChord?.name]);

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
