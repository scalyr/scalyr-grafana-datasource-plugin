import _ from "lodash";

import { QueryCtrl } from 'grafana/app/plugins/sdk';

import { getValidConversionFactor, createDataLinkURL } from './util';

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector) {
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

    this.target.dataLink = createDataLinkURL(this.target.queryText, this.getScalyrDatasourceUrl());

    this.target.copyText = "Copy";

    // Migrate filters from versions 2.3.0 and older
    if (this.target.queryText) {
      this.target.filter = this.target.queryText;
      this.target.queryText = null;
    }
  }

  /**
   * Put the current DataLink into the user's clipboard
   */
  copyDataLink() {
    /* eslint-disable no-undef */
    navigator.clipboard.writeText(this.target.dataLink).then(() => {
      this.target.copyText = "Copied";
    }, () => {
      this.target.copyText = "FAILED";
    });
    /* eslint-enable no-undef */
  }

  /**
   * Return a list of available functions. The 'count' function is only available if no field is selected.
   */
  getFunctionOptions() {
    let options = [];
    if (!this.target.field) {
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
      if (this.target.queryType === this.queryTypes.STANDARD_QUERY) {
        this.target.dataLink = createDataLinkURL(this.target.queryText, this.getScalyrDatasourceUrl());
      }
      this.target.copyText = "Copy";
      this.panelCtrl.refresh(); // Asks the panel to refresh data.
    }
  }

  getScalyrDatasourceUrl() {
    const str = this.panelCtrl.datasource.scalyrUrl;
    if (str.charAt(str.length - 1) !== "/") {
      return str + "/";
    }
    return str;
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
