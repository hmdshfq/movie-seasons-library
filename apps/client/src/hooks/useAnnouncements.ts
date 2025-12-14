import { useState } from 'react';

export function useAnnouncements() {
  const [announcement, setAnnouncement] = useState<string>('');

  const announce = (message: string): void => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 100);
  };

  return { announcement, announce };
}
