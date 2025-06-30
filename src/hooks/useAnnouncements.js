import { useState } from 'react';

export function useAnnouncements() {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 100);
  };

  return { announcement, announce };
}