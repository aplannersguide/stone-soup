export async function geocodeLocation(locationStr) {
  if (!locationStr || locationStr.trim() === '') return { lat: null, lng: null };
  
  try {
    const encodedAddress = encodeURIComponent(locationStr);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'StoneSoupApp/1.0'
      }
    });

    if (!response.ok) {
      console.error("Geocoding failed with status:", response.status);
      return { lat: null, lng: null };
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return { lat: null, lng: null };
  } catch (err) {
    console.error("Geocoding error:", err);
    return { lat: null, lng: null };
  }
}
