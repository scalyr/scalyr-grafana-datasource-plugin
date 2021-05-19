/* eslint-disable no-template-curly-in-string */
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

  /**
   * Split a given string on multiple separators given in a list
   *
   * @param str String to split
   * @param splitters List of values to split the string on
   * @returns {string[]}
   */
  export function splitOnArrayElements(str, splitters) {
    let result = [str];
    if (splitters) {
      for (let i = 0; i < splitters.length; i += 1) {
        let subresult = [];
        for (let j = 0; j < result.length; j += 1) {
          subresult = subresult.concat(result[j].split(splitters[i]));
        }
        result = subresult;
      }
    }
    return result;
  }


  /**
   * Create a DataLink URL for a given query and datasource destination
   *
   * @param queryText Query for this DataLink
   * @param scalyrDatasourceUrl Scalyr server URL this datasource is pointed to
   * @returns {string}
   */
  export function createDataLinkURL(queryText, scalyrDatasourceUrl) {
    let dataLinkFilter = "";
    if (queryText) {
      // This regex should be the same one that Grafana uses to find variables, at time of writing it is here:
      // https://github.com/grafana/grafana/blob/cf2cc713933599e7646416a56a665282c9d9e3bb/public/app/features/templating/variable.ts#L11
      const varRegex = /\$(\w+)|\[\[([\s\S]+?)(?::(\w+))?\]\]|\${(\w+)(?:\.([^:^}]+))?(?::(\w+))?}/g;

      const extractedVars = [];
      const extractedVarNames = [];
      let match = varRegex.exec(queryText);
      while (match != null) {
        extractedVars.push(match[0]);
        for (let i = 1; i < match.length; i += 1) {
          if (match[i]) {
            extractedVarNames.push(match[i]);
            break;
          }
        }
        match = varRegex.exec(queryText);
      }

      const queryWithoutVars = splitOnArrayElements(queryText, extractedVars);
      for (let i = 0; i < queryWithoutVars.length; i += 1) {
        queryWithoutVars[i] = encodeURIComponent(queryWithoutVars[i]);
      }
      let filterText = "";
      if (extractedVars) {
        filterText = queryWithoutVars.reduce((arr, v, i) => {
                         if (extractedVarNames[i]) {
                           return arr.concat(v, "${" + extractedVarNames[i] + ":lucene}");
                         }
                         return arr.concat(v, extractedVarNames[i]);
                       }, []).join("");
      }
      else {
        filterText = '"' + queryWithoutVars[0] + '"';
      }
      dataLinkFilter = "&filter=" + filterText;
    }

    // Deal with grafana-redirect only working with "app." prefix in EU regions. This simple replacement should be
    // safe as long as we don't plan on allowing custom domains running Scalyr that have "eu." somewhere in the middle.
    const host = scalyrDatasourceUrl.replace("eu.","app.eu.");

    return host + "v2/grafana-redirect?startTime=${__from}&endTime=${__to}" + dataLinkFilter;
  }
