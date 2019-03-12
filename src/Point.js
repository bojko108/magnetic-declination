export default class Point {
  constructor(coords) {
    this.lat = coords[0];
    this.lon = coords[1];
    this.height = coords[2] || 0;
  }

  toSphericalPoint(ellipsoid) {
    const coslat = Math.cos((this.lat * Math.PI) / 180);
    const sinlat = Math.sin((this.lat * Math.PI) / 180);
    const rc = ellipsoid.a / Math.sqrt(1 - ellipsoid.epsq * sinlat * sinlat);
    const xp = (rc + this.height) * coslat;
    const zp = (rc * (1 - ellipsoid.epsq) + this.height) * sinlat;
    const r = Math.sqrt(xp * xp + zp * zp);

    return {
      r,
      lon: this.lon,
      lat: (180 / Math.PI) * Math.asin(zp / r)
    };
  }
}
