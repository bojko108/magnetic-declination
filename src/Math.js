export function fromGeoMagneticVector(magnetic_vector) {
  var bx = magnetic_vector.bx;
  var by = magnetic_vector.by;
  var bz = magnetic_vector.bz;
  var h = Math.sqrt(bx * bx + by * by);
  return {
    x: bx,
    y: by,
    z: bz,
    h: h,
    f: Math.sqrt(h * h + bz * bz),
    decl: (180 / Math.PI) * Math.atan2(by, bx),
    incl: (180 / Math.PI) * Math.atan2(bz, h)
  };
}

export function LegendreFunction(sphericalPoint, n_max) {
  const sin_phi = Math.sin((Math.PI / 180) * sphericalPoint.lat);
  let result;
  if (n_max <= 16 || 1 - Math.abs(sin_phi) < 1e-10) {
    result = PcupLow(sin_phi, n_max);
  } else {
    result = PcupHigh(sin_phi, n_max);
  }
  return result;
}

export function getHarmonicVariables(sphericalPoint, ellipsoid, n_max) {
  let m, n;
  const cos_lambda = Math.cos((Math.PI / 180) * sphericalPoint.lon);
  const sin_lambda = Math.sin((Math.PI / 180) * sphericalPoint.lon);

  let cos_mlambda = [1.0, cos_lambda];
  let sin_mlambda = [0.0, sin_lambda];
  let relative_radius_power = [(ellipsoid.r / sphericalPoint.r) * (ellipsoid.r / sphericalPoint.r)];

  for (n = 1; n <= n_max; n++) {
    relative_radius_power[n] = relative_radius_power[n - 1] * (ellipsoid.r / sphericalPoint.r);
  }
  for (m = 2; m <= n_max; m++) {
    cos_mlambda[m] = cos_mlambda[m - 1] * cos_lambda - sin_mlambda[m - 1] * sin_lambda;
    sin_mlambda[m] = cos_mlambda[m - 1] * sin_lambda + sin_mlambda[m - 1] * cos_lambda;
  }

  return {
    relative_radius_power,
    cos_mlambda,
    sin_mlambda
  };
}

export function getSummation(legendre, sph_variables, coord_spherical, model) {
  let bx = 0;
  let by = 0;
  let bz = 0;
  let n, m, i, k;
  let relative_radius_power = sph_variables.relative_radius_power;
  let cos_mlambda = sph_variables.cos_mlambda;
  let sin_mlambda = sph_variables.sin_mlambda;
  let g = model.main_field_coeff_g;
  let h = model.main_field_coeff_h;

  for (n = 1; n <= model.n_max; n++) {
    for (m = 0; m <= n; m++) {
      i = (n * (n + 1)) / 2 + m;
      bz -= relative_radius_power[n] * (g[i] * cos_mlambda[m] + h[i] * sin_mlambda[m]) * (n + 1) * legendre.pcup[i];
      by += relative_radius_power[n] * (g[i] * sin_mlambda[m] - h[i] * cos_mlambda[m]) * m * legendre.pcup[i];
      bx -= relative_radius_power[n] * (g[i] * cos_mlambda[m] + h[i] * sin_mlambda[m]) * legendre.dpcup[i];
    }
  }
  let cos_phi = Math.cos((Math.PI / 180) * coord_spherical.lat);
  if (Math.abs(cos_phi) > 1e-10) {
    by = by / cos_phi;
  } else {
    //special calculation around poles
    by = 0;
    let schmidt_quasi_norm1 = 1.0,
      schmidt_quasi_norm2,
      schmidt_quasi_norm3;
    let pcup_s = [1];
    let sin_phi = Math.sin((Math.PI / 180) * coord_spherical.lat);

    for (n = 1; n <= model.n_max; n++) {
      i = (n * (n + 1)) / 2 + 1;
      schmidt_quasi_norm2 = (schmidt_quasi_norm1 * (2 * n - 1)) / n;
      schmidt_quasi_norm3 = schmidt_quasi_norm2 * Math.sqrt((2 * n) / (n + 1));
      schmidt_quasi_norm1 = schmidt_quasi_norm2;
      if (n == 1) {
        pcup_s[n] = pcup_s[n - 1];
      } else {
        k = ((n - 1) * (n - 1) - 1) / ((2 * n - 1) * (2 * n - 3));
        pcup_s[n] = sin_phi * pcup_s[n - 1] - k * pcup_s[n - 2];
      }
      by += relative_radius_power[n] * (g[i] * sin_mlambda[1] - h[i] * cos_mlambda[1]) * pcup_s[n] * schmidt_quasi_norm3;
    }
  }
  return {
    bx,
    by,
    bz
  };
}

export function rotate(vector, coord_spherical, coord_geodetic) {
  var psi = (Math.PI / 180) * (coord_spherical.lat - coord_geodetic.lat);

  return {
    bz: vector.bx * Math.sin(psi) + vector.bz * Math.cos(psi),
    bx: vector.bx * Math.cos(psi) - vector.bz * Math.sin(psi),
    by: vector.by
  };
}

const PcupLow = (x, n_max) => {
  var k, z, n, m, i, i1, i2, num_terms;
  var schmidt_quasi_norm = [1.0];
  var pcup = [1.0];
  var dpcup = [0.0];

  z = Math.sqrt((1 - x) * (1 + x));
  num_terms = ((n_max + 1) * (n_max + 2)) / 2;

  for (n = 1; n <= n_max; n++) {
    for (m = 0; m <= n; m++) {
      i = (n * (n + 1)) / 2 + m;
      if (n == m) {
        i1 = ((n - 1) * n) / 2 + m - 1;
        pcup[i] = z * pcup[i1];
        dpcup[i] = z * dpcup[i1] + x * pcup[i1];
      } else if (n == 1 && m == 0) {
        i1 = ((n - 1) * n) / 2 + m;
        pcup[i] = x * pcup[i1];
        dpcup[i] = x * dpcup[i1] - z * pcup[i1];
      } else if (n > 1 && n != m) {
        i1 = ((n - 2) * (n - 1)) / 2 + m;
        i2 = ((n - 1) * n) / 2 + m;
        if (m > n - 2) {
          pcup[i] = x * pcup[i2];
          dpcup[i] = x * dpcup[i2] - z * pcup[i2];
        } else {
          k = ((n - 1) * (n - 1) - m * m) / ((2 * n - 1) * (2 * n - 3));
          pcup[i] = x * pcup[i2] - k * pcup[i1];
          dpcup[i] = x * dpcup[i2] - z * pcup[i2] - k * dpcup[i1];
        }
      }
    }
  }

  for (n = 1; n <= n_max; n++) {
    i = (n * (n + 1)) / 2;
    i1 = ((n - 1) * n) / 2;
    schmidt_quasi_norm[i] = (schmidt_quasi_norm[i1] * (2 * n - 1)) / n;
    for (m = 1; m <= n; m++) {
      i = (n * (n + 1)) / 2 + m;
      i1 = (n * (n + 1)) / 2 + m - 1;
      schmidt_quasi_norm[i] = schmidt_quasi_norm[i1] * Math.sqrt(((n - m + 1) * (m == 1 ? 2 : 1)) / (n + m));
    }
  }

  for (n = 1; n <= n_max; n++) {
    for (m = 0; m <= n; m++) {
      i = (n * (n + 1)) / 2 + m;
      pcup[i] *= schmidt_quasi_norm[i];
      dpcup[i] *= -schmidt_quasi_norm[i];
    }
  }

  return {
    pcup,
    dpcup
  };
};

const PcupHigh = (x, n_max) => {
  if (Math.abs(x) == 1.0) {
    throw new Error('Error in PcupHigh: derivative cannot be calculated at poles');
  }

  let n, m, k;
  let num_terms = ((n_max + 1) * (n_max + 2)) / 2;
  let f1 = [];
  let f2 = [];
  let pre_sqr = [];
  let scalef = 1.0e-280;

  for (n = 0; n <= 2 * n_max + 1; ++n) {
    pre_sqr[n] = Math.sqrt(n);
  }

  k = 2;
  for (n = 0; n <= n_max; n++) {
    k++;
    f1[k] = (2 * n - 1) / n;
    f2[k] = (n - 1) / n;
    for (m = 1; m <= n - 2; m++) {
      k++;
      f1[k] = (2 * n - 1) / pre_sqr[n + m] / pre_sqr[n - m];
      f2[k] = (pre_sqr[n - m - 1] * pre_sqr[n + m - 1]) / pre_sqr[n + m] / pre_sqr[n - m];
    }
    k += 2;
  }

  let z = Math.sqrt((1 - x) * (1 + x));
  let plm;
  let pm1 = x;
  let pm2 = 1;
  let pcup = [1.0, pm1];
  let dpcup = [0.0, z];
  if (n_max == 0) {
    throw new Error('Error in PcupHigh: n_max must be greater than 0');
  }

  k = 1;
  for (n = 2; n <= n_max; n++) {
    k = k + n;
    plm = f1[k] * x * pm1 - f2[k] * pm2;
    pcup[k] = plm;
    dpcup[k] = (n * (pm1 - x * plm)) / z;
    pm2 = pm1;
    pm1 = plm;
  }

  let pmm = pre_sqr[2] * scalef;
  let rescalem = 1 / scalef;
  let kstart = 0;

  for (let m = 1; m <= n_max - 1; ++m) {
    rescalem *= z;

    //calculate pcup(m,m)
    kstart = kstart + m + 1;
    pmm = (pmm * pre_sqr[2 * m + 1]) / pre_sqr[2 * m];
    pcup[kstart] = (pmm * rescalem) / pre_sqr[2 * m + 1];
    dpcup[kstart] = -((m * x * pcup[kstart]) / z);
    pm2 = pmm / pre_sqr[2 * m + 1];

    //calculate pcup(m+1,m)
    k = kstart + m + 1;
    pm1 = x * pre_sqr[2 * m + 1] * pm2;
    pcup[k] = pm1 * rescalem;
    dpcup[k] = (pm2 * rescalem * pre_sqr[2 * m + 1] - x * (m + 1) * pcup[k]) / z;

    //calculate pcup(n,m)
    for (n = m + 2; n <= n_max; ++n) {
      k = k + n;
      plm = x * f1[k] * pm1 - f2[k] * pm2;
      pcup[k] = plm * rescalem;
      dpcup[k] = (pre_sqr[n + m] * pre_sqr[n - m] * pm1 * rescalem - n * x * pcup[k]) / z;
      pm2 = pm1;
      pm1 = plm;
    }
  }

  //calculate pcup(n_max,n_max)
  rescalem = rescalem * z;
  kstart = kstart + m + 1;
  pmm = pmm / pre_sqr[2 * n_max];
  pcup[kstart] = pmm * rescalem;
  dpcup[kstart] = (-n_max * x * pcup[kstart]) / z;

  return {
    pcup,
    dpcup
  };
};
