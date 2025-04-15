interface Song {
  title: string;
  fileName: string;
}

interface SongListProps {
  songs: Song[];
  onSongSelect: (fileName: string) => void;
}

export const SongList = ({ songs, onSongSelect }: SongListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {songs.map((song) => (
        <div key={song.fileName} className="space-y-2">
          <button
            onClick={() => onSongSelect(song.fileName)}
            className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer text-left"
          >
            {song.title}
          </button>
        </div>
      ))}
    </div>
  );
};
