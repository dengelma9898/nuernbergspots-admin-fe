import { getContrastTextColor } from '@/utils/eventListUtils';

describe('getContrastTextColor', () => {
  it('returns dunkle Schrift auf hellen Hintergründen', () => {
    expect(getContrastTextColor('#ffffff')).toBe('#1f2937');
    expect(getContrastTextColor('#fef08a')).toBe('#1f2937');
    expect(getContrastTextColor('#fff7ed')).toBe('#1f2937');
    expect(getContrastTextColor('#e7e5e4')).toBe('#1f2937');
  });

  it('returns helle Schrift auf dunklen Hintergründen', () => {
    expect(getContrastTextColor('#000000')).toBe('#fff');
    expect(getContrastTextColor('#1f2937')).toBe('#fff');
    expect(getContrastTextColor('#0f172a')).toBe('#fff');
    expect(getContrastTextColor('#7f1d1d')).toBe('#fff');
  });

  it('toleriert hex ohne führendes #', () => {
    expect(getContrastTextColor('ffffff')).toBe('#1f2937');
    expect(getContrastTextColor('000000')).toBe('#fff');
  });

  it('fällt auf helle Schrift bei ungültigen Werten zurück', () => {
    expect(getContrastTextColor('#zzzzzz')).toBe('#fff');
    expect(getContrastTextColor('nope')).toBe('#fff');
  });
});
