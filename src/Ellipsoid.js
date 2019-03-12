export default class Ellipsoid {
  constructor(a, b, r) {
    // semi najor axis
    this.a = a;
    //semi minor axis
    this.b = b;
    // radius
    this.r = r;

    // flattening
    this.f = (this.a - this.b) / this.a;
    // inverse flattening
    this.invFlatt = 1 / this.f;
    // first eccentricity squared
    this.epsq = (this.a * this.a - this.b * this.b) / (this.a * this.a);
    // first eccentricity
    this.ep = Math.sqrt(this.epsq);
  }
}
