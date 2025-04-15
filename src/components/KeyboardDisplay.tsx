import React from 'react';

interface KeyboardDisplayProps {
  chordName: string;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const getChordNotes = (chordName: string): string[] => {
  const root = chordName.replace(/[0-9]|maj|m|dim|aug/g, '');
  const quality = chordName.slice(root.length);

  const rootIndex = NOTES.indexOf(root);
  if (rootIndex === -1) return [];

  // Basic chord mappings
  switch (quality) {
    case '': // Major
      return [root, NOTES[(rootIndex + 4) % 12], NOTES[(rootIndex + 7) % 12]];
    case 'm': // Minor
      return [root, NOTES[(rootIndex + 3) % 12], NOTES[(rootIndex + 7) % 12]];
    case '7': // Dominant 7th
      return [
        root,
        NOTES[(rootIndex + 4) % 12],
        NOTES[(rootIndex + 7) % 12],
        NOTES[(rootIndex + 10) % 12],
      ];
    case 'maj7': // Major 7th
      return [
        root,
        NOTES[(rootIndex + 4) % 12],
        NOTES[(rootIndex + 7) % 12],
        NOTES[(rootIndex + 11) % 12],
      ];
    default:
      return [root];
  }
};

export const KeyboardDisplay: React.FC<KeyboardDisplayProps> = ({ chordName }) => {
  const chordNotes = getChordNotes(chordName);

  return (
    <div className="relative w-[400px] h-[150px] bg-gray-100 p-4 rounded-lg">
      <div className="flex relative h-full">
        {/* White keys */}
        {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((note, index) => (
          <div
            key={note}
            className={`relative flex-1 h-full border border-gray-300 rounded-b ${
              chordNotes.includes(note) ? 'bg-blue-500' : 'bg-white'
            }`}
            style={{ marginLeft: index === 0 ? 0 : '-1px' }}
          >
            <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs">
              {note}
            </span>
          </div>
        ))}

        {/* Black keys */}
        <div className="absolute top-0 left-0 w-full">
          <div className="flex">
            {/* C# */}
            <div
              className={`h-[90px] w-[30px] ${
                chordNotes.includes('C#') ? 'bg-blue-700' : 'bg-black'
              } absolute left-[11%] z-10`}
            />
            {/* D# */}
            <div
              className={`h-[90px] w-[30px] ${
                chordNotes.includes('D#') ? 'bg-blue-700' : 'bg-black'
              } absolute left-[25%] z-10`}
            />
            {/* F# */}
            <div
              className={`h-[90px] w-[30px] ${
                chordNotes.includes('F#') ? 'bg-blue-700' : 'bg-black'
              } absolute left-[53%] z-10`}
            />
            {/* G# */}
            <div
              className={`h-[90px] w-[30px] ${
                chordNotes.includes('G#') ? 'bg-blue-700' : 'bg-black'
              } absolute left-[67%] z-10`}
            />
            {/* A# */}
            <div
              className={`h-[90px] w-[30px] ${
                chordNotes.includes('A#') ? 'bg-blue-700' : 'bg-black'
              } absolute left-[81%] z-10`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
