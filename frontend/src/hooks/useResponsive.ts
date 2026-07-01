import { useState, useEffect, useSyncExternalStore } from 'react';

type Breakpoint = 'phone' | 'tablet' | 'desktop';

function getBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 640) return 'phone';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

export function useResponsive(): {
  breakpoint: Breakpoint;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
} {
  const [breakpoint, setBreakpoint] = useState(getBreakpoint);

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    isPhone: breakpoint === 'phone',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
  };
}
