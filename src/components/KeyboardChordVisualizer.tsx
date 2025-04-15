import React from 'react';

interface KeyboardChordVisualizerProps {
  chordName: string;
  position: {
    top: number;
    left: number;
  };
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];
const WHITE_KEYS = NOTES.filter((note) => !BLACK_KEYS.includes(note));

const getChordNotes = (chordName: string): string[] => {
  const baseNote = chordName.replace(/m|maj|dim|aug|[0-9]/g, '');
  const baseIndex = NOTES.indexOf(baseNote);
  const isMinor = chordName.includes('m') && !chordName.includes('maj');
  const isDiminished = chordName.includes('dim');
  const isAugmented = chordName.includes('aug');

  if (baseIndex === -1) return [];

  const notes: string[] = [];
  notes.push(NOTES[baseIndex]); // Root note

  // Third
  const thirdInterval = isMinor || isDiminished ? 3 : 4;
  notes.push(NOTES[(baseIndex + thirdInterval) % 12]);

  // Fifth
  let fifthInterval = 7;
  if (isDiminished) fifthInterval = 6;
  if (isAugmented) fifthInterval = 8;
  notes.push(NOTES[(baseIndex + fifthInterval) % 12]);

  return notes;
};

export const KeyboardChordVisualizer = ({ chordName, position }: KeyboardChordVisualizerProps) => {
  const chordNotes = getChordNotes(chordName);

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 border border-red-500">
      <div className="text-center font-bold mb-2">{chordName}</div>
      <div className="relative h-32 w-[16rem]">
        {/* White keys */}
        <div className="flex h-full">
          {WHITE_KEYS.map((note, index) => (
            <div
              key={note}
              className={`relative flex-1 border border-gray-300 rounded-b-md flex items-end justify-center pb-2 
                ${chordNotes.includes(note) ? 'bg-blue-200' : 'bg-white'}`}
            >
              <span className="text-xs">{note}</span>
            </div>
          ))}
        </div>
        {/* Black keys */}
        <div className="absolute top-0 left-0 right-0 flex h-1/2">
          {NOTES.map(
            (note, index) =>
              BLACK_KEYS.includes(note) && (
                <div
                  key={note}
                  style={{
                    left: `${(index * 100) / NOTES.length}%`,
                    width: '8%',
                    marginLeft: '-4%',
                  }}
                  className={`absolute h-full rounded-b-sm flex items-end justify-center pb-1
                  ${chordNotes.includes(note) ? 'bg-blue-800' : 'bg-black'}`}
                >
                  <span className="text-[10px] text-white">{note}</span>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};
