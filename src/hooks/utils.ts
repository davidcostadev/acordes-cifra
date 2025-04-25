export type ProcessedLine = {
  parts: {
    type: 'text' | 'chord';
    content: string;
  }[];
};

//https://chatgpt.com/c/680b74d8-d0c0-8002-9492-485f241cff6a?model=o4-mini
export const processLine = (line: string): ProcessedLine => {
  const note = '[A-G]';
  const ac = '(?:#|b|##|bb)';
  const suf = '(?:maj|min|m|M|dim|aug|sus|\\+|\\-|add|no)';
  const num = '\\d+';
  const paren = '\\([^\\)]+\\)';
  const bass = '\\/[A-G](?:#|b|##|bb)?';

  const chordMod = `${note}(?:${ac}|${suf}|${num}|${paren}|${bass})+`;
  const chordRaw = `${note}(?=\\s*(?:$|[A-G]|[^A-Za-zÀ-ÖØ-öø-ÿ]))`;
  const chordToken = `(?:${chordMod}|${chordRaw})`;
  const regex = new RegExp(`(?<=^|\\s)(?<chord>${chordToken})(?=\\s|$)`, 'g');

  const parts: ProcessedLine['parts'] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    const chord = match.groups!.chord;
    const index = match.index;

    // False positive: single-letter chord before ordinary word
    if (parts.length === 0 && chord.length === 1) {
      const after = line.slice(index + chord.length);
      const m2 = after.match(/^\s*([A-Za-zÀ-ÖØ-öø-ÿ])/);
      if (m2 && !/[A-G]/.test(m2[1])) {
        return { parts: [{ type: 'text', content: line }] };
      }
    }
    // False positive: two-letter minor chord (e.g., Em) before ordinary word
    if (parts.length === 0 && /^[A-G][mM]$/.test(chord)) {
      const after = line.slice(index + chord.length);
      const m2 = after.match(/^\s*([A-Za-zÀ-ÖØ-öø-ÿ])/);
      if (m2 && !/[A-G]/.test(m2[1])) {
        return { parts: [{ type: 'text', content: line }] };
      }
    }

    if (index > lastIndex) {
      const textSegment = line.slice(lastIndex, index);
      parts.push({ type: 'text', content: textSegment });
    }
    parts.push({ type: 'chord', content: chord });
    lastIndex = index + chord.length;
  }

  if (lastIndex < line.length) {
    const textSegment = line.slice(lastIndex);
    parts.push({ type: 'text', content: textSegment });
  }

  // Collapse only when a single chord follows pure whitespace
  if (
    parts.length === 2 &&
    parts[0].type === 'text' &&
    parts[1].type === 'chord' &&
    /^\s+$/.test(parts[0].content)
  ) {
    parts[0].content = ' ';
  }

  return { parts };
};
