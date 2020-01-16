/* eslint-disable no-template-curly-in-string */
import _ from "lodash";

import { QueryCtrl } from 'grafana/app/plugins/sdk';

import { getValidConversionFactor } from './util';

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector)  {
    super($scope, $injector);
    this.scope = $scope;
    this.queryTypes = {
      POWER_QUERY: 'Power Query',
      STANDARD_QUERY: 'Standard Query'
    };
    this.createDataLinkURL();

    // Default to standard query.
    if (!this.target.queryType) {
      this.target.queryType = this.queryTypes.STANDARD_QUERY;
    }
  }

  copyDataLink() {
    navigator.clipboard.writeText(this.target.dataLink);
  }

  /**
   * Return a list of available functions. The 'count' function is only available if a facet isn't selected.
   */
  getFacetFunctionOptions() {
    let options = [];
    if (!this.target.facet) {
      options.push({
        text: 'count', value: 'count'
      });
    }
    options = options.concat(
      [
        { text: 'mean', value: 'mean'},
        { text: 'min', value: 'min'},
        { text: 'max', value: 'max'},
        { text: 'sumPerSec', value: 'sumPerSec'},
        { text: '10th %ile', value: 'p10'},
        { text: '50th %ile', value: 'p50'},
        { text: '90th %ile', value: 'p90'},
        { text: '95th %ile', value: 'p95'},
        { text: '99th %ile', value: 'p99'},
        { text: '99.9th %ile', value: 'p999'}
      ]
    );
    return options;
  }

  /**
   * Get list of query type options. Only two options are power query or standard query.
   * @returns {*[]}
   */
  getQueryTypeOptions() {
    return [
      { text: this.queryTypes.POWER_QUERY, value: this.queryTypes.POWER_QUERY },
      { text: this.queryTypes.STANDARD_QUERY, value: this.queryTypes.STANDARD_QUERY }
    ];
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal() {
    this.target.panelType = this.panel.type;
    if (GenericDatasourceQueryCtrl.isQueryValid(this.target)) {
      this.createDataLinkURL();
      this.panelCtrl.refresh(); // Asks the panel to refresh data.
    }
  }

  static splitOnArrayElements(str, splitters) {
    let result = [str];
    for (let i = 0; i < splitters.length; i += 1) {
      let subresult = [];
      for (let j = 0; j < result.length; j += 1) {
        subresult = subresult.concat(result[j].split(splitters[i]));
      }
      result = subresult;
    }
    return result;
  }

  static getScalyrDatasourceUrl() {
    /* eslint-disable no-undef */
    const str = grafanaBootData.settings.datasources.Scalyr.jsonData.scalyrUrl;
    /* eslint-enable no-undef */
    if (str.charAt(str.length - 1) !== "/") {
      return str + "/";
    }
    return str;
  }

  createDataLinkURL() {
      if (this.target.queryType === this.queryTypes.STANDARD_QUERY) {
        let dataLinkFilter = ""
        if (this.target.queryText !== "") {
          const varRegex = /\$(\w+)|\[\[([\s\S]+?)(?::(\w+))?\]\]|\${(\w+)(?:\.([^:^}]+))?(?::(\w+))?}/g
          const extractedVars = this.target.queryText.match(varRegex);
          // TODO: encode any extractedVars that dont match up to a variable the user has defined maybe?
          const queryWithoutVars = GenericDatasourceQueryCtrl.splitOnArrayElements(this.target.queryText, extractedVars);
          for (let i = 0; i < queryWithoutVars.length; i += 1) {
            queryWithoutVars[i] = encodeURIComponent(queryWithoutVars[i]);
          }
          const queryText = queryWithoutVars.reduce((arr, v, i) => {
                             return arr.concat(v, extractedVars[i]);
                           }, []).join("");
          dataLinkFilter = "&filter=" + queryText;
        }
        this.target.dataLink = GenericDatasourceQueryCtrl.getScalyrDatasourceUrl() + "events?startTime=${__from}&endTime=${__to}" + dataLinkFilter
      }
  }

  /**
   * Check if the current query target is valid.
   * @param target
   * @returns {boolean}
   */
  static isQueryValid(target) {
    if (target.conversionFactor) {
      try {
        const value = getValidConversionFactor(target.conversionFactor);
        return _.isFinite(value);
      } catch (e) {
        return false;
      }
    }

    return true;
  }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
