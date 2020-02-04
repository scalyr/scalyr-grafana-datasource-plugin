/* eslint-disable no-template-curly-in-string */
import { getValidConversionFactor, splitOnArrayElements, createDataLinkURL } from './util';

describe('Util - Conversion Factor', () => {
    it('Should convert fractions', () => {
      expect(getValidConversionFactor('1/4')).toBe(0.25);
    });

    it('Should return 1 for invalid conversion factor', () => {
      expect(getValidConversionFactor('xxx')).toBe(1);
    });
  });

describe('Util - Split on Array Elements', () => {
    it('Should split on all elements', () => {
      expect(splitOnArrayElements("abc,123:xyz", [",", ":"])).toStrictEqual(["abc", "123", "xyz"]);
    });

    it('Should not split with no elements', () => {
      expect(splitOnArrayElements("abc,123:xyz", null)).toStrictEqual(["abc,123:xyz"]);
    });
});

describe('Util - Build DataLink URL for Query', () => {
    it('Should %encode the query', () => {
      expect(createDataLinkURL("test : test", "test/")).toBe("test/v2/grafana-redirect?startTime=${__from}&endTime=${__to}&filter=test%20%3A%20test");
    });
    it('Should not %encode variables', () => {
      expect(createDataLinkURL("${aaa:aaa}", "test/")).toBe("test/v2/grafana-redirect?startTime=${__from}&endTime=${__to}&filter=${aaa:aaa}");
    });
});
