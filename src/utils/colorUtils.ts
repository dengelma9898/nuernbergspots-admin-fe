export const convertFFToHex = (ffColor: string): string => {
  // Entfernt "0x" und nimmt die letzten 6 Zeichen für RGB
  const hex = ffColor.replace('0x', '').slice(-6);
  return `#${hex}`;
};

export const convertHexToFF = (hexColor: string): string => {
  // Entfernt "#" und fügt "0xff" hinzu
  const ff = hexColor.replace('#', '');
  return `0xff${ff}`;
}; 