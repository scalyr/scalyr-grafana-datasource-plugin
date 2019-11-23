  /**
   * Convert the user entered conversion factor to a number. 
   * User entered conversion factor can be expressed as fractions as well. 
   * E.g. 1/4
   * 
   * @param conversionFactor conversion factor.
   * @returns {*|number}
   */
  export function getValidConversionFactor(conversionFactor) {
    try {
      // https://gist.github.com/drifterz28/6971440
      let result;
      if(conversionFactor.search('/') >= 0) {
          let frac;
          let deci;
          let wholeNum = 0;
          if(conversionFactor.search('-') >= 0) {
              wholeNum = conversionFactor.split('-');
              conversionFactor = wholeNum[1];
              wholeNum = parseInt(wholeNum[0], 10);
          } else {
              frac = conversionFactor;
          }
          if(conversionFactor.search('/') >=0) {
              frac =  frac.split('/');
              deci = parseInt(frac[0], 10) / parseInt(frac[1], 10);
          }
          result = wholeNum + deci;
      } else {
          result = conversionFactor;
      }
      return parseFloat(result) || 1.0;
    } catch (e) {
      return 1.0;  
    }
  }
