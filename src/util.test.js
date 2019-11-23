import { getValidConversionFactor } from './util';

describe('Util - Conversion Factor', () => {
    it('Should convert fractions', () => {
      expect(getValidConversionFactor('1/4')).toBe(0.25);
    });

    it('Should return 1 for invalid conversion factor', () => {
      expect(getValidConversionFactor('xxx')).toBe(1);
    });
  });
