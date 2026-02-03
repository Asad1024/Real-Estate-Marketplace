/**
 * Apply search (address + name), price range, beds, baths, parking, furnished, and sort to a list of listings.
 * Each item is { id, data } where data has address, name, regularPrice, discountedPrice, bedrooms, bathrooms, parking, furnished, timestamp, offer.
 */
export function applyListingFilters(listings, filters) {
  if (!listings?.length) return [];

  let result = [...listings];

  const search = (filters.search || "").trim().toLowerCase();
  if (search) {
    result = result.filter(({ data }) => {
      const address = (data.address || "").toLowerCase();
      const name = (data.name || "").toLowerCase();
      return address.includes(search) || name.includes(search);
    });
  }

  if (filters.minPrice) {
    const min = Number(filters.minPrice);
    result = result.filter(({ data }) => {
      const price = data.offer ? data.discountedPrice : data.regularPrice;
      return Number(price) >= min;
    });
  }

  if (filters.maxPrice) {
    const max = Number(filters.maxPrice);
    result = result.filter(({ data }) => {
      const price = data.offer ? data.discountedPrice : data.regularPrice;
      return Number(price) <= max;
    });
  }

  if (filters.minBeds) {
    const minBeds = Number(filters.minBeds);
    result = result.filter(({ data }) => Number(data.bedrooms || 0) >= minBeds);
  }

  if (filters.minBaths) {
    const minBaths = Number(filters.minBaths);
    result = result.filter(({ data }) => Number(data.bathrooms || 0) >= minBaths);
  }

  if (filters.parking === "yes") {
    result = result.filter(({ data }) => data.parking === true);
  } else if (filters.parking === "no") {
    result = result.filter(({ data }) => !data.parking);
  }

  if (filters.furnished === "yes") {
    result = result.filter(({ data }) => data.furnished === true);
  } else if (filters.furnished === "no") {
    result = result.filter(({ data }) => !data.furnished);
  }

  const sort = filters.sort || "newest";
  result.sort((a, b) => {
    const priceA = a.data.offer ? a.data.discountedPrice : a.data.regularPrice;
    const priceB = b.data.offer ? b.data.discountedPrice : b.data.regularPrice;
    const timeA = a.data.timestamp?.toDate?.()?.getTime?.() ?? 0;
    const timeB = b.data.timestamp?.toDate?.()?.getTime?.() ?? 0;

    if (sort === "price-asc") return Number(priceA) - Number(priceB);
    if (sort === "price-desc") return Number(priceB) - Number(priceA);
    return timeB - timeA; // newest first
  });

  return result;
}
