import { describe, it, expect } from 'vitest';
import { processLine } from './utils';

describe('processLine', () => {
  it('A verdade é a', () => {
    const line = 'A verdade é a';
    const result = processLine(line);
    expect(result).toEqual({
      parts: [{ type: 'text', content: 'A verdade é a' }],
    });
  });

  it('E assim vamos te', () => {
    const line = 'E assim vamos te';
    const result = processLine(line);
    expect(result).toEqual({
      parts: [{ type: 'text', content: 'E assim vamos te' }],
    });
  });

  it('D G/B A/C# G7(13) F#7(b9#5) Cmaj7(#11)', () => {
    const line = 'D G/B A/C# G7(13) F#7(b9#5) Cmaj7(#11)';
    const result = processLine(line);
    expect(result).toEqual({
      parts: [
        {
          content: 'D',
          type: 'chord',
        },
        {
          content: ' ',
          type: 'text',
        },
        {
          content: 'G/B',
          type: 'chord',
        },
        {
          content: ' ',
          type: 'text',
        },
        {
          content: 'A/C#',
          type: 'chord',
        },
        {
          content: ' ',
          type: 'text',
        },
        {
          content: 'G7(13)',
          type: 'chord',
        },
        {
          content: ' ',
          type: 'text',
        },
        {
          content: 'F#7(b9#5)',
          type: 'chord',
        },
        {
          content: ' ',
          type: 'text',
        },
        {
          content: 'Cmaj7(#11)',
          type: 'chord',
        },
      ],
    });
  });

  it('   C', () => {
    const line = '   C';
    const result = processLine(line);
    expect(result).toEqual({
      parts: [
        {
          content: ' ',
          type: 'text',
        },
        {
          content: 'C',
          type: 'chord',
        },
      ],
    });
  });

  it('A Luz', () => {
    const line = 'A Luz';
    const result = processLine(line);
    expect(result).toEqual({
      parts: [{ type: 'text', content: 'A Luz' }],
    });
  });

  it('C', () => {
    const line = 'C';
    const result = processLine(line);
    expect(result).toEqual({
      parts: [{ type: 'chord', content: 'C' }],
    });
  });

  it('D', () => {
    const line = 'D';
    const result = processLine(line);
    expect(result).toEqual({
      parts: [{ type: 'chord', content: 'D' }],
    });
  });

  it('E            E/G#    A  ( A E/G# F#m A/E B/D# )', () => {
    const line = 'E            E/G#    A  ( A E/G# F#m A/E B/D# )';
    const result = processLine(line);
    expect(result).toEqual({
      parts: [
        { type: 'chord', content: 'E' },
        { type: 'text', content: '            ' },
        { type: 'chord', content: 'E/G#' },
        { type: 'text', content: '    ' },
        { type: 'chord', content: 'A' },
        { type: 'text', content: '  ( ' },
        { type: 'chord', content: 'A' },
        { type: 'text', content: ' ' },
        { type: 'chord', content: 'E/G#' },
        { type: 'text', content: ' ' },
        { type: 'chord', content: 'F#m' },
        { type: 'text', content: ' ' },
        { type: 'chord', content: 'A/E' },
        { type: 'text', content: ' ' },
        { type: 'chord', content: 'B/D#' },
        { type: 'text', content: ' )' },
      ],
    });
  });

  it('   A              E/G#        F#m', () => {
    const line = '   A              E/G#        F#m';
    const result = processLine(line);
    expect(result).toEqual({
      parts: [
        { type: 'text', content: '   ' },
        { type: 'chord', content: 'A' },
        { type: 'text', content: '              ' },
        { type: 'chord', content: 'E/G#' },
        { type: 'text', content: '        ' },
        { type: 'chord', content: 'F#m' },
      ],
    });
  });

  it('Em Tuas mãos está todo o vencer', () => {
    const line = 'Em Tuas mãos está todo o vencer';
    const result = processLine(line);
    expect(result).toEqual({
      parts: [{ type: 'text', content: 'Em Tuas mãos está todo o vencer' }],
    });
  });
});
