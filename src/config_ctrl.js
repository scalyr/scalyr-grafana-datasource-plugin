
export class GenericConfigCtrl {
  constructor($scope)  {
    this.scope = $scope;
    if (!this.current.jsonData.scalyrUrl) {
      this.current.jsonData.scalyrUrl = 'https://www.scalyr.com';
    }
  }
}

GenericConfigCtrl.templateUrl = 'partials/config.html';

