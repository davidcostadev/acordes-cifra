import { useEffect, useRef } from 'react';

interface KeyboardChordDisplayProps {
  chordName?: string;
}

interface KeyProps {
  isBlack?: boolean;
  isHighlighted?: boolean;
  label?: string;
  note: string;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];

const Key = ({ isBlack = false, isHighlighted = false, label = '', note }: KeyProps) => {
  const baseClasses = isBlack
    ? 'bg-black border-black w-6 h-20 -mx-3 z-10'
    : 'bg-white border-black w-8 h-32';

  const highlightClasses = isHighlighted ? 'bg-blue-500' : '';

  return (
    <div
      data-testid={`key-${note}`}
      className={`
        relative
        border
        rounded-b
        ${baseClasses}
        ${highlightClasses}
        flex
        items-end
        justify-center
        pb-2
      `}
    >
      {isHighlighted && (
        <div
          data-testid={`key-label-${note}`}
          className={`
            absolute
            bottom-1
            w-5
            h-5
            rounded-full
            flex
            items-center
            justify-center
            ${isBlack ? 'bg-white text-black' : 'bg-black text-white'}
          `}
        >
          <span className="text-xs font-medium">{label}</span>
        </div>
      )}
    </div>
  );
};

export const KeyboardChordDisplay = ({ chordName = 'C' }: KeyboardChordDisplayProps) => {
  const getChordNotes = (chord: string) => {
    try {
      // Simple chord parsing
      const match = chord.match(/([A-G][#b]?)([a-zA-Z0-9]*)/);
      if (!match) return [];

      const [_, rootNote, quality = ''] = match;

      // Basic chord mappings
      const intervals = {
        '': [0, 4, 7], // Major
        m: [0, 3, 7], // Minor
        '7': [0, 4, 7, 10], // Dominant 7th
        maj7: [0, 4, 7, 11], // Major 7th
        m7: [0, 3, 7, 10], // Minor 7th
        dim: [0, 3, 6], // Diminished
        aug: [0, 4, 8], // Augmented
      };

      // Get the base intervals based on chord quality
      const baseIntervals = intervals[quality as keyof typeof intervals] || intervals[''];

      // Find root note index
      const rootIndex = NOTES.indexOf(rootNote);
      if (rootIndex === -1) return [];

      // Calculate actual notes
      return baseIntervals.map((interval) => {
        const noteIndex = (rootIndex + interval) % 12;
        return NOTES[noteIndex];
      });
    } catch (error) {
      console.error('Error parsing chord:', error);
      return [];
    }
  };

  const chordNotes = getChordNotes(chordName);

  return (
    <div
      data-testid="keyboard-chord-display"
      className="relative inline-flex items-end p-4 bg-gray-100 rounded-lg shadow-md"
    >
      <div data-testid="white-keys-container" className="flex">
        {WHITE_KEYS.map((note) => {
          const isHighlighted = chordNotes.includes(note);
          return (
            <Key
              key={note}
              note={note}
              isHighlighted={isHighlighted}
              label={isHighlighted ? note : ''}
            />
          );
        })}
      </div>
      <div data-testid="black-keys-container" className="absolute top-4 left-4 flex">
        {BLACK_KEYS.map((note, index) => {
          const marginLeft =
            index === 0
              ? '2rem'
              : index === 1
              ? '2rem'
              : index === 2
              ? '4rem'
              : index === 3
              ? '2rem'
              : '2rem';
          const isHighlighted = chordNotes.includes(note);
          return (
            <div key={note} style={{ marginLeft }}>
              <Key
                isBlack
                note={note}
                isHighlighted={isHighlighted}
                label={isHighlighted ? note : ''}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
