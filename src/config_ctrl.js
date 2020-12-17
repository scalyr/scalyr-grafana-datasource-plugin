
export class GenericConfigCtrl {
  constructor($scope)  {
    this.showKey = true;
    this.scope = $scope;
    if (!this.current.jsonData.scalyrUrl) {
      this.current.jsonData.scalyrUrl = 'https://www.scalyr.com';
    }
    if (this.current.jsonData.scalyrApiKey) {
      this.showKey = false;
    }
  }

  onChangeKey() {
    this.current.jsonData.scalyrApiKey = this.current.jsonData.scalyrApiKeyView
  }

  resetKey() {
    this.current.jsonData.scalyrApiKey = "";
    this.current.jsonData.scalyrApiKeyView = "";
    this.showKey = true;
  }
}

GenericConfigCtrl.templateUrl = 'partials/config.html';
