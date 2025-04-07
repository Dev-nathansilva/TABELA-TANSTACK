import React, { useEffect } from "react";
import { useState } from "react";
import { useCallback, useMemo } from "react";

export default function usePopupManager(keys) {
  const [popupStates, setPopupStates] = useState(
    Object.fromEntries(keys.map((key) => [key, false]))
  );

  const popupRefs = useMemo(
    () => Object.fromEntries(keys.map((key) => [key, React.createRef()])),
    [keys]
  );

  const togglePopup = useCallback((key) => {
    setPopupStates((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const closePopup = useCallback((key) => {
    setPopupStates((prev) => ({ ...prev, [key]: false }));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      Object.entries(popupRefs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(event.target)) {
          closePopup(key);
        }
      });
    }

    const isAnyOpen = Object.values(popupStates).some(Boolean);
    if (isAnyOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupStates, popupRefs, closePopup]);

  return { popupStates, popupRefs, togglePopup, closePopup };
}
