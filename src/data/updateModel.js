const fs = require('fs');

const readCof = str => {
  let result = {
    main_field_coeff_g: [0],
    main_field_coeff_h: [0],
    secular_var_coeff_g: [0],
    secular_var_coeff_h: [0],
    n_max: 0,
    n_max_sec_var: 0
  };
  const lines = str.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let vals = line.match(/\S+/g);
    if (!vals) continue;
    if (vals.length === 3) {
      result.epoch = parseFloat(vals[0]);
      result.name = vals[1];
      result.start_date = new Date(vals[2]);
      result.end_date = new Date(vals[2]);
      const year = result.start_date.getFullYear();
      result.end_date.setFullYear(year + 5);
    }
    if (vals.length === 6) {
      const n = parseInt(vals[0]);
      const m = parseInt(vals[1]);
      if (m <= n) {
        const i = (n * (n + 1)) / 2 + m;
        result.main_field_coeff_g[i] = parseFloat(vals[2]);
        result.main_field_coeff_h[i] = parseFloat(vals[3]);
        result.secular_var_coeff_g[i] = parseFloat(vals[4]);
        result.secular_var_coeff_h[i] = parseFloat(vals[5]);
      }
      if (n > result.n_max) {
        result.n_max = n;
        result.n_max_sec_var = n;
      }
    }
  }
  return result;
};

const input_filename = 'src/data/wmm.cof',
  output_filename = 'src/data/model.json';

const data = fs.readFileSync(input_filename, { encoding: 'utf8' });
const obj = readCof(data);
const json = JSON.stringify(obj, null, 2);

fs.writeFileSync(output_filename, json);

console.log(`\n\tModel was successfully created in ${output_filename}\n`);
