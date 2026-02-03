import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "housemarket_recently_viewed";
const MAX_ITEMS = 10;

const getStored = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setStored = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch (e) {
    console.warn("Recently viewed storage failed", e);
  }
};

export function useRecentlyViewed() {
  const [items, setItems] = useState(getStored);

  useEffect(() => {
    setStored(items);
  }, [items]);

  const add = useCallback(({ id, type, name }) => {
    if (!id || !type) return;
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      return [{ id, type, name: name || "Listing" }, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  return { recentlyViewed: items, addRecentlyViewed: add };
}
