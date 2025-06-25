// src/hooks/useKeyboardControls.js
import { useEffect } from 'react';

export function useKeyboardControls(keyMap) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keyMap[e.code]) {
        e.preventDefault();
        keyMap[e.code]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyMap]);
}