import model from './data/model.json';
import Ellipsoid from './Ellipsoid';
import Point from './Point.js';
import { LegendreFunction, fromGeoMagneticVector, getHarmonicVariables, getSummation, rotate, toSphericalPoint } from './Math';

export default class MagneticModel {
  constructor(date) {
    this.model = model;
    if (date) {
      console.log(this.model);
      this.model = this.useTimedModel(date);
    }
    this.ellipsoid = new Ellipsoid(6378.137, 6356.752314245, 6371.2);
  }

  useTimedModel(date) {
    const year_int = date.getFullYear();
    const year_start = new Date(year_int, 0, 1);
    const fractional_year = (date.valueOf() - year_start.valueOf()) / (1000 * 3600 * 24 * 365);
    const year = year_int + fractional_year;
    const dyear = year - this.model.epoch;
    console.log(date < this.model.start_date);
    if (date < this.model.start_date || date > this.model.end_date) {
      throw new RangeError('Model is only valid from ' + this.model.start_date.toDateString() + ' to ' + this.model.end_date.toDateString());
    }

    let timedModel = {
      epoch: this.model.epoch,
      n_max: this.model.n_max,
      n_max_sec_var: this.model.n_max_sec_var,
      name: this.model.name
    };

    const a = timedModel.n_max_sec_var;
    const b = (a * (a + 1)) / 2 + a;
    for (let n = 1; n <= this.model.n_max; n++) {
      for (let m = 0; m <= n; m++) {
        const i = (n * (n + 1)) / 2 + m;
        const hnm = this.model.main_field_coeff_h[i];
        const gnm = this.model.main_field_coeff_g[i];
        const dhnm = this.model.secular_var_coeff_h[i];
        const dgnm = this.model.secular_var_coeff_g[i];
        if (i <= b) {
          timedModel.main_field_coeff_h[i] = hnm + dyear * dhnm;
          timedModel.main_field_coeff_g[i] = gnm + dyear * dgnm;
          timedModel.secular_var_coeff_h[i] = dhnm;
          timedModel.secular_var_coeff_g[i] = dgnm;
        } else {
          timedModel.main_field_coeff_h[i] = hnm;
          timedModel.main_field_coeff_g[i] = gnm;
        }
      }
    }
    return timedModel;
  }

  calculate(coordinates, ellipsoid = this.ellipsoid) {
    const geodeticPoint = new Point(coordinates);
    const sphericalPoint = geodeticPoint.toSphericalPoint(ellipsoid);

    const legendre = LegendreFunction(sphericalPoint, this.model.n_max);
    const harmonic_variables = getHarmonicVariables(sphericalPoint, ellipsoid, this.model.n_max);

    const vector = getSummation(legendre, harmonic_variables, sphericalPoint, this.model);

    const data = fromGeoMagneticVector(rotate(vector, sphericalPoint, geodeticPoint));

    return data;
  }
}
