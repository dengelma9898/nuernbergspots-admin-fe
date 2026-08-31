import { useEffect, useState } from 'react';

function getGridColumns(width: number): number {
  if (width >= 1280) {
    return 4;
  }
  if (width >= 1024) {
    return 3;
  }
  if (width >= 768) {
    return 2;
  }
  return 1;
}

export function useEventListGridColumns(): number {
  const [columns, setColumns] = useState(() =>
    typeof window === 'undefined' ? 1 : getGridColumns(window.innerWidth)
  );

  useEffect(() => {
    const updateColumns = () => {
      setColumns(getGridColumns(window.innerWidth));
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columns;
}
