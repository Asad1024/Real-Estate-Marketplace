import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "housemarket_favorites";

const getStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setStored = (ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn("Favorites storage failed", e);
  }
};

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(getStored);

  useEffect(() => {
    setStored(favoriteIds);
  }, [favoriteIds]);

  const toggle = useCallback((listingId) => {
    setFavoriteIds((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  }, []);

  const isFavorite = useCallback(
    (listingId) => favoriteIds.includes(listingId),
    [favoriteIds]
  );

  const count = favoriteIds.length;

  return { favoriteIds, toggle, isFavorite, count };
}
