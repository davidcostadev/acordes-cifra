interface SongResultProps {
  columns: number;
  children: React.ReactNode;
}

export const SongResult = ({ columns, children }: SongResultProps) => {
  return <div className={`song-result grid grid-cols-${columns} gap-4 mt-8`}>{children}</div>;
};
