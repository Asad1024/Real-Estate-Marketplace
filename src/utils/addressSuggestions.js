const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Build a short, to-the-point label from Nominatim result (no long repeated parts).
 * Prefers: area/neighbourhood, then city/town, then state/country.
 */
export const formatShortLabel = (item) => {
  const addr = item?.address;
  if (!addr) return (item?.display_name || "").slice(0, 50);

  const parts = [];
  const area =
    addr.suburb ||
    addr.neighbourhood ||
    addr.village ||
    addr.road ||
    addr.quarter ||
    addr.locality;
  const city = addr.city || addr.town || addr.municipality || addr.county;
  const region = addr.state || addr.country;

  if (area && area !== city) parts.push(area);
  if (city && parts[parts.length - 1] !== city) parts.push(city);
  if (region && parts[parts.length - 1] !== region) parts.push(region);

  const short = parts.join(", ");
  if (short.length > 0) return short.length > 55 ? short.slice(0, 52) + "…" : short;
  return (item?.display_name || "").slice(0, 50);
};

/**
 * Fetch address suggestions from Nominatim and return items with shortLabel.
 */
export const fetchAddressSuggestions = async (query) => {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `${NOMINATIM_URL}?q=${encodeURIComponent(query.trim())}&format=json&addressdetails=1&limit=5`,
      { headers: { "User-Agent": "HouseMarket/1.0" } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      ...item,
      shortLabel: formatShortLabel(item),
    }));
  } catch {
    return [];
  }
};
