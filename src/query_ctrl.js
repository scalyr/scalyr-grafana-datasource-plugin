import _ from "lodash";

import {QueryCtrl} from 'grafana/app/plugins/sdk';

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector)  {
    super($scope, $injector);
    this.scope = $scope;
    this.queryTypes = {
      POWER_QUERY: 'Power Query',
      STANDARD_QUERY: 'Standard Query'
    };

    // Default to standard query.
    if (!this.target.queryType) {
      this.target.queryType = this.queryTypes.STANDARD_QUERY;
    }
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
      this.panelCtrl.refresh(); // Asks the panel to refresh data.
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
        const value = parseFloat(target.conversionFactor);
        return _.isFinite(value);
      } catch (e) {
        return false;
      }
    }

    return true;
  }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
