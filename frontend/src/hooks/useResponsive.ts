import { useState, useEffect } from 'react';
import type { DeviceType, ScreenSize } from '@/types';

const BREAKPOINTS = {
  mobile: 414,
  tablet: 1024,
  desktop: 1200,
} as const;

export function useResponsive() {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [screenSize, setScreenSize] = useState<ScreenSize>('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width <= BREAKPOINTS.mobile) {
        setDeviceType('mobile');
        setScreenSize(width <= 320 ? 'xs' : 'sm');
      } else if (width <= BREAKPOINTS.tablet) {
        setDeviceType('tablet');
        setScreenSize('md');
      } else {
        setDeviceType('desktop');
        setScreenSize(width >= BREAKPOINTS.desktop ? 'xl' : 'lg');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    deviceType,
    screenSize,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
  };
}