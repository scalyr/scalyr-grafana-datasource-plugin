import {QueryCtrl} from 'grafana/app/plugins/sdk'

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector)  {
    super($scope, $injector);
    this.scope = $scope;
  }

  /**
   * Return a list of available functions. The 'count' function is only available if a facet isn't selected.
   */
  getFacetFunctionOptions() {
    let options = [];
    if (!this.target.facet) {
      options.push({
        text: 'count', value: 'count'
      })
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
    )
    return options;
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
