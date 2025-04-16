interface Song {
  title: string;
  fileName: string;
}

interface SongListProps {
  songs: Song[];
  onSongSelect: (fileName: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const SongList = ({ songs, onSongSelect, onClose, isOpen }: SongListProps) => {
  const sortedSongs = songs.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      {/* Semi-transparent backdrop with fade animation */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-10' : 'opacity-0 pointer-events-none'
        } z-40`}
        onClick={onClose}
      />
      {/* Drawer with slide animation */}
      <div
        className={`fixed inset-y-0 left-0 w-[90%] bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Songs</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            {sortedSongs.map((song) => (
              <div key={song.fileName} className="space-y-2">
                <button
                  onClick={() => {
                    onSongSelect(song.fileName);
                    onClose();
                  }}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-bold cursor-pointer text-left w-full py-1 rounded transition-colors duration-200"
                >
                  {song.title}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
