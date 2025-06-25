import { useEffect, useState } from "react";

export default function useKeyboard() {
  const [keys, setKeys] = useState({});

  useEffect(() => {
    const handleDown = (e) => {
      setKeys((prev) => ({ ...prev, [e.key]: true }));
    };

    const handleUp = (e) => {
      setKeys((prev) => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);

    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, []);

  return keys;
}
