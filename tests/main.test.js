import MagneticModel from '../src/main';
import { assert } from 'chai';

const tolerances = {
  incl: 0.01, //deg
  decl: 0.01, //deg
  x: 5, //nT
  y: 5, //nT
  z: 5, //nT
  h: 5, //nT
  f: 5 //nT
};

describe('Test model', function() {
  // it('calculatePoint with base model', function() {
  //   const model = new MagneticModel();

  //   let result = model.calculate([80, 0]);
  //   let expected = { x: 6636.6, y: -451.9, z: 54408.9, h: 6651.9, f: 54814.0, decl: -3.9, incl: 83.03 };

  //   assert.closeTo(result.x, expected.x, tolerances.x);
  //   assert.closeTo(result.y, expected.y, tolerances.y);
  //   assert.closeTo(result.z, expected.z, tolerances.z);
  //   assert.closeTo(result.h, expected.h, tolerances.h);
  //   assert.closeTo(result.f, expected.f, tolerances.f);
  //   assert.closeTo(result.decl, expected.decl, tolerances.decl);
  //   assert.closeTo(result.incl, expected.incl, tolerances.incl);

  //   result = model.calculate([0, 120]);
  //   expected = { x: 39521.1, y: 377.7, z: -11228.8, h: 39522.9, f: 41087.1, decl: 0.55, incl: -15.86 };

  //   assert.closeTo(result.x, expected.x, tolerances.x);
  //   assert.closeTo(result.y, expected.y, tolerances.y);
  //   assert.closeTo(result.z, expected.z, tolerances.z);
  //   assert.closeTo(result.h, expected.h, tolerances.h);
  //   assert.closeTo(result.f, expected.f, tolerances.f);
  //   assert.closeTo(result.decl, expected.decl, tolerances.decl);
  //   assert.closeTo(result.incl, expected.incl, tolerances.incl);
  // });

  it('calculatePoint with timed model', function() {
    const model = new MagneticModel(new Date('2008/10/02'));

    let result = model.calculate([80, 0]);
    let expected = { x: 6636.6, y: -451.9, z: 54408.9, h: 6651.9, f: 54814.0, decl: -3.9, incl: 83.03 };

    assert.closeTo(result.x, expected.x, tolerances.x);
    assert.closeTo(result.y, expected.y, tolerances.y);
    assert.closeTo(result.z, expected.z, tolerances.z);
    assert.closeTo(result.h, expected.h, tolerances.h);
    assert.closeTo(result.f, expected.f, tolerances.f);
    assert.closeTo(result.decl, expected.decl, tolerances.decl);
    assert.closeTo(result.incl, expected.incl, tolerances.incl);

    // result = model.calculate([0, 120]);
    // expected = { x: 39521.1, y: 377.7, z: -11228.8, h: 39522.9, f: 41087.1, decl: 0.55, incl: -15.86 };

    // assert.closeTo(result.x, expected.x, tolerances.x);
    // assert.closeTo(result.y, expected.y, tolerances.y);
    // assert.closeTo(result.z, expected.z, tolerances.z);
    // assert.closeTo(result.h, expected.h, tolerances.h);
    // assert.closeTo(result.f, expected.f, tolerances.f);
    // assert.closeTo(result.decl, expected.decl, tolerances.decl);
    // assert.closeTo(result.incl, expected.incl, tolerances.incl);
  });
});
