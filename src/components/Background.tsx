import { useTheme } from 'next-themes';

export function Background() {
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <>
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900'
            : 'bg-gradient-to-br from-white via-gray-50 to-white'
        }`}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none w-full max-w-full">
        <div
          className={`absolute top-1/2 left-1/2 motion-background-pulse w-[600px] h-[600px] max-w-[100vw] max-h-[100vh] rounded-full blur-3xl transition-opacity duration-500 ${
            isDark ? 'bg-red-500/10' : 'bg-red-500/5'
          }`}
          style={{
            willChange: 'transform, opacity',
            transformOrigin: 'center center',
          }}
        />
      </div>
    </>
  );
}
