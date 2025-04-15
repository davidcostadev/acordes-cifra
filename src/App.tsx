import { useState } from 'react';
import { ChordDisplay } from './components/ChordDisplay';
import { SongList } from './components/SongList';
import { SongResult } from './components/SongResult';
import { SongContent } from './components/SongContent';
import { KeyDisplay } from './components/KeyDisplay';

const SONGS = [
  { title: 'Nívea Soares - Teu Amor Não Falha', fileName: 'Nívea Soares - Teu Amor Não Falha' },
  { title: 'Fernandinho - Pra Sempre', fileName: 'Fernandinho - Pra Sempre' },
  { title: 'Aline Barros - Diante da Cruz', fileName: 'Aline Barros - Diante da Cruz' },
  { title: 'Nívea Soares - Eu Vou Construir', fileName: 'Nívea Soares - Eu Vou Construir' },
  { title: 'Nívea Soares - Que Se Abram Os Céus', fileName: 'Nívea Soares - Que Se Abram Os Céus' },
  { title: 'Gabriel Guedes - Nada Mais', fileName: 'Gabriel Guedes - Nada Mais' },
  { title: 'Marcus Salles - Estamos de Pé', fileName: 'Marcus Salles - Estamos de Pé' },
  {
    title: 'Diante do Trono - Levanto Um Aleluia (part. Isaías Saad)',
    fileName: 'Diante do Trono - Levanto Um Aleluia (part. Isaías Saad)',
  },
  { title: 'Relevans Music - Vencedor', fileName: 'Relevans Music - Vencedor' },
  {
    title: 'Fernandinho - Porque Ele Vive _ Cristo Valerá (Pot-Pourri)',
    fileName: 'Fernandinho - Porque Ele Vive _ Cristo Valerá (Pot-Pourri)',
  },
  { title: 'Morada - Jesus em tua presença', fileName: 'Morada - Jesus em tua presença' },
  { title: 'Mauro Henrique - Em Teus Braços', fileName: 'Mauro Henrique - Em Teus Braços' },
  { title: 'Fernandinho - Pai de Multidões', fileName: 'Fernandinho - Pai de Multidões' },
  { title: 'Morada - Só Tu És Santo', fileName: 'Morada - Só Tu És Santo' },
  {
    title: 'Paulo César Baruk - Ele Continua Sendo Bom',
    fileName: 'Paulo César Baruk - Ele Continua Sendo Bom',
  },
  {
    title: 'Trazendo a Arca - Tua Graça Me Basta',
    fileName: 'Trazendo a Arca - Tua Graça Me Basta',
  },
  {
    title: 'Bethel Church - Onde For, Eu Vou (Where Go i Go)',
    fileName: 'Bethel Church - Onde For, Eu Vou (Where Go i Go)',
  },
  { title: 'Felipe Souza - Acende um fogo', fileName: 'Felipe Souza - Acende um fogo' },
  { title: 'Morada - Emaús', fileName: 'Morada - Emaús' },
  { title: 'Fernandinho - Único', fileName: 'Fernandinho - Único' },
  { title: 'Eli Soares - Aos Pes da Cruz', fileName: 'Eli Soares - Aos Pes da Cruz' },
];

const EXAMPLE_CHORDS = ['C', 'Am', 'F', 'G', 'Dm', 'Em', 'C7', 'Fmaj7'];

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const getTransposedKey = (originalKey: string, semitones: number): string => {
  const normalizedKey = originalKey.replace('b', '#');
  const currentIndex = NOTES.indexOf(normalizedKey);
  if (currentIndex === -1) return originalKey;

  let newIndex = (currentIndex + semitones + 12) % 12;
  if (newIndex < 0) newIndex += 12;

  return NOTES[newIndex];
};

function App() {
  const [selectedSong, setSelectedSong] = useState<string | null>(
    'Nívea Soares - Teu Amor Não Falha'
  );
  const [transpose, setTranspose] = useState(0);
  const [columns, setColumns] = useState(1);
  const [selectedChord, setSelectedChord] = useState('C');

  const handleSongSelect = (fileName: string) => {
    setSelectedSong(fileName);
  };

  const handleTransposeChange = (amount: number) => {
    setTranspose((prev) => {
      const newValue = prev + amount;
      // Limit transpose range to -11 to +11 semitones
      return Math.min(Math.max(newValue, -11), 11);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <SongList songs={SONGS} onSongSelect={handleSongSelect} />
          </div>
          <div className="col-span-2">
            {selectedSong && (
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span>Tom:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTransposeChange(-1)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        -
                      </button>
                      <KeyDisplay fileName={selectedSong} transpose={transpose} />
                      <button
                        onClick={() => handleTransposeChange(1)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <label className="flex items-center gap-2">
                    <span>Columns:</span>
                    <input
                      type="number"
                      value={columns}
                      onChange={(e) => setColumns(Number(e.target.value))}
                      className="border rounded px-2 py-1 w-20"
                      min={1}
                      max={3}
                    />
                  </label>
                </div>
                <SongResult columns={columns}>
                  <SongContent fileName={selectedSong} transpose={transpose} columns={columns} />
                </SongResult>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Chord Visualizer</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {EXAMPLE_CHORDS.map((chord) => (
              <button
                key={chord}
                onClick={() => setSelectedChord(chord)}
                className={`px-4 py-2 rounded-lg ${
                  selectedChord === chord
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {chord}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4">Guitar Chord</h3>
              <ChordDisplay chordName={selectedChord} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
