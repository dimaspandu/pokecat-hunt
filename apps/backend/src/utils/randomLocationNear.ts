// ----------------------
// Utility Functions
// ----------------------

export function randomLocationNear(lat: number, lng: number, radiusInMeters: number) {
  const r = radiusInMeters / 111300;
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;

  const deltaLat = w * Math.cos(t);
  const deltaLng = w * Math.sin(t) / Math.cos(lat * (Math.PI / 180));

  return {
    lat: lat + deltaLat,
    lng: lng + deltaLng,
  };
}