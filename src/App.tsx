import { useState, useEffect } from 'react';
import { SongList } from './components/SongList';
import { SongContent } from './components/SongContent';
import { KeyDisplay } from './components/KeyDisplay';
import { KeyboardChordVisualizer } from './components/KeyboardChordVisualizer';
import { useSongProcessing } from './hooks/useSongProcessing';
const SONGS = [
  { title: 'Nívea Soares - Teu Amor Não Falha', fileName: 'Nívea Soares - Teu Amor Não Falha' },
  // { title: 'Fernandinho - Pra Sempre', fileName: 'Fernandinho - Pra Sempre' },
  // { title: 'Aline Barros - Diante da Cruz', fileName: 'Aline Barros - Diante da Cruz' },
  // { title: 'Nívea Soares - Eu Vou Construir', fileName: 'Nívea Soares - Eu Vou Construir' },
  // { title: 'Nívea Soares - Que Se Abram Os Céus', fileName: 'Nívea Soares - Que Se Abram Os Céus' },
  // { title: 'Gabriel Guedes - Nada Mais', fileName: 'Gabriel Guedes - Nada Mais' },
  // { title: 'Marcus Salles - Estamos de Pé', fileName: 'Marcus Salles - Estamos de Pé' },
  // {
  //   title: 'Diante do Trono - Levanto Um Aleluia (part. Isaías Saad)',
  //   fileName: 'Diante do Trono - Levanto Um Aleluia (part. Isaías Saad)',
  // },
  // { title: 'Relevans Music - Vencedor', fileName: 'Relevans Music - Vencedor' },
  // {
  //   title: 'Fernandinho - Porque Ele Vive _ Cristo Valerá (Pot-Pourri)',
  //   fileName: 'Fernandinho - Porque Ele Vive _ Cristo Valerá (Pot-Pourri)',
  // },
  // { title: 'Morada - Jesus em tua presença', fileName: 'Morada - Jesus em tua presença' },
  { title: 'Mauro Henrique - Em Teus Braços', fileName: 'Mauro Henrique - Em Teus Braços' },
  { title: 'Eli Soares - Eu te louvarei', fileName: 'Eli Soares - Eu te louvarei' },
  // { title: 'Fernandinho - Pai de Multidões', fileName: 'Fernandinho - Pai de Multidões' },
  // { title: 'Morada - Só Tu És Santo', fileName: 'Morada - Só Tu És Santo' },
  // {
  //   title: 'Paulo César Baruk - Ele Continua Sendo Bom',
  //   fileName: 'Paulo César Baruk - Ele Continua Sendo Bom',
  // },
  // {
  //   title: 'Trazendo a Arca - Tua Graça Me Basta',
  //   fileName: 'Trazendo a Arca - Tua Graça Me Basta',
  // },
  // {
  //   title: 'Bethel Church - Onde For, Eu Vou (Where Go i Go)',
  //   fileName: 'Bethel Church - Onde For, Eu Vou (Where Go i Go)',
  // },
  // { title: 'Felipe Souza - Acende um fogo', fileName: 'Felipe Souza - Acende um fogo' },
  // { title: 'Morada - Emaús', fileName: 'Morada - Emaús' },
  // { title: 'Fernandinho - Único', fileName: 'Fernandinho - Único' },
  { title: 'Eli Soares - Aos Pes da Cruz', fileName: 'Eli Soares - Aos Pes da Cruz' },
  { title: 'Kleber Lucas - Deus Cuida de Mim', fileName: 'Kleber Lucas - Deus Cuida de Mim' },
  { title: 'Adhemar de Campos - Ele É Exaltado', fileName: 'Adhemar de Campos - Ele É Exaltado' },
  { title: 'Eli Soares - Estrela da Manhã', fileName: 'Eli Soares - Estrela da Manhã' },
  { title: 'Música de Test', fileName: 'Música de Test' },
  {
    title: 'Adhemar de Campos - Grande é o senhor',
    fileName: 'Adhemar de Campos - Grande é o senhor',
  },
];

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<string | null>(() => {
    // Try to get from URL first, then localStorage, then default
    const params = new URLSearchParams(window.location.search);
    const urlSong = params.get('song');
    if (urlSong) return urlSong;

    const storedSong = localStorage.getItem('selectedSong');
    if (storedSong) return storedSong;

    return 'Nívea Soares - Teu Amor Não Falha';
  });

  const [transpose, setTranspose] = useState(() => {
    // Try to get from URL first, then localStorage, then default
    const params = new URLSearchParams(window.location.search);
    const urlTranspose = params.get('transpose');
    if (urlTranspose) return parseInt(urlTranspose);

    const storedTranspose = localStorage.getItem('transpose');
    if (storedTranspose) return parseInt(storedTranspose);

    return 0;
  });

  const [columns, setColumns] = useState(() => {
    // Try to get from URL first, then localStorage, then default
    const params = new URLSearchParams(window.location.search);
    const urlColumns = params.get('columns');
    if (urlColumns) return parseInt(urlColumns);

    const storedColumns = localStorage.getItem('columns');
    if (storedColumns) return parseInt(storedColumns);

    return 1;
  });

  const [selectedChord, setSelectedChord] = useState('C');

  const { chords, transposedKey } = useSongProcessing(selectedSong, transpose);

  useEffect(() => {
    setSelectedChord(transposedKey);
  }, [transposedKey]);

  // Update URL and localStorage when state changes
  useEffect(() => {
    if (!selectedSong) return;

    // Update URL
    const params = new URLSearchParams(window.location.search);
    params.set('song', selectedSong);
    params.set('transpose', transpose.toString());
    params.set('columns', columns.toString());
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);

    // Update localStorage
    localStorage.setItem('selectedSong', selectedSong);
    localStorage.setItem('transpose', transpose.toString());
    localStorage.setItem('columns', columns.toString());
  }, [selectedSong, transpose, columns]);

  const handleSongSelect = (fileName: string) => {
    setSelectedSong(fileName);
    // Reset transpose to 0
    setTranspose(0);
  };

  const handleTransposeChange = (amount: number) => {
    setTranspose((prev) => {
      const newValue = prev + amount;
      // Limit transpose range to -11 to +11 semitones
      return Math.min(Math.max(newValue, -11), 11);
    });
  };

  const handleColumnsChange = (amount: number) => {
    setColumns((prev) => {
      const newValue = prev + amount;
      // Limit columns range to 1 to 4
      return Math.min(Math.max(newValue, 1), 4);
    });
  };

  return (
    <div>
      <header className="bg-gray-100 border-b border-gray-200 px-2 py-2 flex items-center">
        <button
          data-testid="hamburger-menu"
          className="flex items-center justify-center px-1 border hover:border-blue-500 active:text-white hover:bg-blue-400 rounded-full w-8 h-8 border-transparent active:bg-blue-400 active:border-blue-400 transition-colors duration-200"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="text-lg">☰</span>
        </button>
        <h1 className="text-xl font-bold ml-2">David Cifras</h1>
        <SongList
          songs={SONGS}
          onSongSelect={handleSongSelect}
          onClose={() => setIsMenuOpen(false)}
          isOpen={isMenuOpen}
        />
      </header>
      <div className="container mx-auto px-2.5 py-8">
        <div className="flex flex-col gap-8">
          {selectedSong && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-center flex-wrap">
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
                <div className="flex items-center gap-2">
                  <span>Colunas:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleColumnsChange(-1)}
                      disabled={columns <= 1}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{columns}</span>
                    <button
                      onClick={() => handleColumnsChange(1)}
                      disabled={columns >= 4}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <SongContent fileName={selectedSong} transpose={transpose} columns={columns} />
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Chord Visualizer</h2>
            <div className="flex flex-wrap gap-2 mb-8">
              {chords.map((chord) => (
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
                <h3 className="text-xl font-semibold mb-4">Piano Chord</h3>
                <KeyboardChordVisualizer chordName={selectedChord} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
