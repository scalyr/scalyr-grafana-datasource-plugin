define(["app/plugins/sdk","lodash"], function(__WEBPACK_EXTERNAL_MODULE_grafana_app_plugins_sdk__, __WEBPACK_EXTERNAL_MODULE_lodash__) { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./module.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./config_ctrl.js":
/*!************************!*\
  !*** ./config_ctrl.js ***!
  \************************/
/*! exports provided: GenericConfigCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"GenericConfigCtrl\", function() { return GenericConfigCtrl; });\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nvar GenericConfigCtrl = function GenericConfigCtrl($scope) {\n  _classCallCheck(this, GenericConfigCtrl);\n\n  this.scope = $scope;\n\n  if (!this.current.jsonData.scalyrUrl) {\n    this.current.jsonData.scalyrUrl = 'https://www.scalyr.com';\n  }\n};\nGenericConfigCtrl.templateUrl = 'partials/config.html';\n\n//# sourceURL=webpack:///./config_ctrl.js?");

/***/ }),

/***/ "./datasource.js":
/*!***********************!*\
  !*** ./datasource.js ***!
  \***********************/
/*! exports provided: GenericDatasource */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"GenericDatasource\", function() { return GenericDatasource; });\n/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ \"lodash\");\n/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util */ \"./util.js\");\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\n\nvar GenericDatasource =\n/*#__PURE__*/\nfunction () {\n  /**\n   * Constructor\n   * @param {*} instanceSettings \n   * @param {*} $q \n   * @param {*} backendSrv \n   * @param {*} templateSrv \n   */\n  function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {\n    _classCallCheck(this, GenericDatasource);\n\n    this.type = instanceSettings.type;\n    this.url = instanceSettings.url;\n    this.name = instanceSettings.name;\n    this.apiKey = instanceSettings.jsonData.scalyrApiKey;\n    this.scalyrUrl = instanceSettings.jsonData.scalyrUrl;\n    this.backendSrv = backendSrv;\n    this.q = $q;\n    this.templateSrv = templateSrv;\n    this.headers = {\n      'Content-Type': 'application/json'\n    };\n    this.queryTypes = {\n      POWER_QUERY: 'Power Query',\n      STANDARD_QUERY: 'Standard Query'\n    };\n    this.visualizationType = {\n      GRAPH: 'graph',\n      TABLE: 'table'\n    };\n  }\n  /**\n   * Grafana uses this function to initiate all queries\n   * @param {*} options - query settings/options https://grafana.com/docs/plugins/developing/datasources/#query\n   */\n\n\n  _createClass(GenericDatasource, [{\n    key: \"query\",\n    value: function query(options) {\n      var queryType = options.targets[0].queryType;\n\n      if (!options.targets.every(function (x) {\n        return x.queryType === queryType;\n      })) {\n        return {\n          status: \"error\",\n          message: \"All queries should have the same query type.\"\n        };\n      }\n\n      if (queryType === this.queryTypes.POWER_QUERY) {\n        if (options.targets.length === 1) {\n          var panelType = options.targets[0].panelType;\n          return this.performPowerQuery(options, panelType);\n        }\n\n        return {\n          status: \"error\",\n          message: \"You can only have one power query per panel.\"\n        };\n      }\n\n      return this.performTimeseriesQuery(options);\n    }\n    /**\n     * Grafana uses this function to test data source settings. \n     * This verifies API key using the facet query API. \n     * The endpoint returns 401 if the token is invalid.\n     */\n\n  }, {\n    key: \"testDatasource\",\n    value: function testDatasource() {\n      return this.backendSrv.datasourceRequest({\n        url: this.url + '/facetQuery',\n        data: JSON.stringify({\n          token: this.apiKey,\n          queryType: 'facet',\n          filter: '',\n          startTime: new Date().getTime(),\n          endTime: new Date().getTime(),\n          field: 'XYZ'\n        }),\n        method: 'POST'\n      }).then(function (response) {\n        if (response && response.status && response.status === 200) {\n          return {\n            status: \"success\",\n            message: \"Successfully connected to Scalyr!\"\n          };\n        } // We will never hit this but eslint complains about lack of return\n\n\n        return {\n          status: \"error\",\n          message: \"Scalyr returned HTTP code \".concat(response.status)\n        };\n      })[\"catch\"](function (err) {\n        var message = \"Cannot connect to Scalyr!\";\n\n        if (err && err.data && err.data.message) {\n          message = \"\".concat(message, \" Scalyr repsponse - \").concat(err.data.message);\n        }\n\n        return {\n          status: \"error\",\n          message: message\n        };\n      });\n    }\n    /**\n     * Grafana uses this function to load metric values. \n     * @param {*} query - query options\n     */\n\n  }, {\n    key: \"metricFindQuery\",\n    value: function metricFindQuery(query) {\n      var d = new Date();\n      d.setHours(d.getHours() - 6);\n      return this.backendSrv.datasourceRequest({\n        url: this.url + '/facetQuery',\n        data: JSON.stringify({\n          token: this.apiKey,\n          queryType: 'facet',\n          filter: '',\n          startTime: d.getTime(),\n          endTime: new Date().getTime(),\n          field: query\n        }),\n        method: 'POST'\n      }).then(function (response) {\n        var values = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(response, 'data.values', []);\n\n        return values.map(function (value) {\n          return {\n            text: value.value,\n            value: value.value\n          };\n        });\n      });\n    }\n    /**\n     * Default interpolator for Grafana variables for this datasource\n     *\n     * @param value The value of this variable\n     * @param variable The Grafana variable information\n     * @returns {string}\n     */\n\n  }, {\n    key: \"createTimeSeriesQuery\",\n\n    /**\n     * Create a request to the scalyr time series endpoint.\n     * @param {*} options \n     */\n    value: function createTimeSeriesQuery(options) {\n      var _this = this;\n\n      var queries = [];\n      options.targets.forEach(function (target) {\n        var queryText = _this.templateSrv.replace(target.queryText, options.scopedVars, GenericDatasource.interpolateVariable);\n\n        var facetFunction = '';\n\n        if (target.facet) {\n          facetFunction = \"\".concat(target[\"function\"] || 'count', \"(\").concat(target.facet, \")\");\n        }\n\n        var query = {\n          startTime: options.range.from.valueOf(),\n          endTime: options.range.to.valueOf(),\n          buckets: GenericDatasource.getNumberOfBuckets(options),\n          filter: queryText,\n          \"function\": facetFunction\n        };\n        queries.push(query);\n      });\n      return {\n        url: this.url + '/timeSeriesApi',\n        method: 'POST',\n        headers: this.headers,\n        data: JSON.stringify({\n          token: this.apiKey,\n          queries: queries\n        })\n      };\n    }\n    /**\n     * Get how many buckets to return based on the query time range\n     * @param {*} options \n     */\n\n  }, {\n    key: \"performTimeseriesQuery\",\n\n    /**\n     * Perform the timeseries query using the Grafana proxy.\n     * @param {*} options \n     */\n    value: function performTimeseriesQuery(options) {\n      var query = this.createTimeSeriesQuery(options);\n      return this.backendSrv.datasourceRequest(query).then(function (response) {\n        var data = response.data;\n        return GenericDatasource.transformTimeSeriesResults(data.results, options);\n      });\n    }\n    /**\n     * Transform data returned by time series query into Grafana timeseries format.\n     * https://grafana.com/docs/plugins/developing/datasources/#query\n     * @param results\n     * @param conversionFactor conversion factor to be applied to each data point. This can be used to for example convert bytes to MB.\n     * @returns {{data: Array}}\n     */\n\n  }, {\n    key: \"createPowerQuery\",\n\n    /**\n     * Create powerquery query to pass to Grafana proxy.\n     * @param queryText text of the query\n     * @param startTime start time\n     * @param endTime end time\n     * @returns {{url: string, method: string, headers: {\"Content-Type\": string}, data: string}}\n     */\n    value: function createPowerQuery(queryText, startTime, endTime) {\n      var query = {\n        token: this.apiKey,\n        query: queryText,\n        startTime: startTime,\n        endTime: endTime\n      };\n      return {\n        url: this.url + '/powerQuery',\n        method: 'POST',\n        headers: this.headers,\n        data: JSON.stringify(query)\n      };\n    }\n    /**\n     * Perform the powerquery using Grafana proxy.\n     * @param options\n     * @returns {Promise<{data: *[]}> | *}\n     */\n\n  }, {\n    key: \"performPowerQuery\",\n    value: function performPowerQuery(options, visualizationType) {\n      var _this2 = this;\n\n      var target = options.targets[0];\n      var query = this.createPowerQuery(target.queryText, options.range.from.valueOf(), options.range.to.valueOf());\n      return this.backendSrv.datasourceRequest(query).then(function (response) {\n        var data = response && response.data;\n        return _this2.transformPowerQueryData(data, visualizationType);\n      });\n    }\n    /**\n     * Transform power query data based on the visualization type\n     * @param data data returned by the power query API\n     * @returns {{data: Object[]}} transformed data that can be used by Grafana\n     */\n\n  }, {\n    key: \"transformPowerQueryData\",\n    value: function transformPowerQueryData(data, visualizationType) {\n      if (visualizationType === this.visualizationType.TABLE) {\n        return this.transformPowerQueryDataToTable(data);\n      }\n\n      return GenericDatasource.transformPowerQueryDataToGraph(data);\n    }\n    /**\n     * Transform data returned by power query to a graph format.\n     * Each row is an individual series; this helps in looking at each value as bar in graphs.\n     * @param {*} data \n     */\n\n  }, {\n    key: \"transformPowerQueryDataToTable\",\n\n    /**\n     * Transform Power Query Data in table format that Grafana needs.\n     * https://grafana.com/docs/plugins/developing/datasources/#query\n     * @param data\n     * @returns {{data: *[]}}\n     */\n    value: function transformPowerQueryDataToTable(data) {\n      var cloneData = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.clone(data);\n\n      cloneData.columns.map(function (col) {\n        col.text = col.name;\n        return col;\n      });\n      return {\n        data: [{\n          type: this.visualizationType.TABLE,\n          columns: cloneData.columns,\n          rows: cloneData.values\n        }]\n      };\n    }\n  }], [{\n    key: \"interpolateVariable\",\n    value: function interpolateVariable(value, variable) {\n      if (typeof value === 'string') {\n        if (variable.multi || variable.includeAll) {\n          return \"'\" + value.replace(/'/g, \"''\") + \"'\";\n        }\n\n        return value;\n      }\n\n      if (typeof value === 'number') {\n        return value;\n      }\n\n      var quotedValues = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.map(value, function (val) {\n        if (typeof value === 'number') {\n          return value;\n        }\n\n        return \"'\" + val.replace(/'/g, \"''\") + \"'\";\n      });\n\n      return quotedValues.join(',');\n    }\n  }, {\n    key: \"getNumberOfBuckets\",\n    value: function getNumberOfBuckets(options) {\n      return Math.floor((options.range.to.valueOf() - options.range.from.valueOf()) / options.intervalMs);\n    }\n  }, {\n    key: \"transformTimeSeriesResults\",\n    value: function transformTimeSeriesResults(results, options) {\n      var graphs = {\n        data: []\n      };\n      results.forEach(function (result, index) {\n        var timeStamp = options.range.from.valueOf();\n        var dataValues = result.values;\n        var currentTarget = options.targets[index];\n        var responseObject = {\n          target: currentTarget.label || currentTarget.queryText,\n          datapoints: []\n        };\n        var conversionFactor = Object(_util__WEBPACK_IMPORTED_MODULE_1__[\"getValidConversionFactor\"])(currentTarget.conversionFactor);\n\n        for (var i = 0; i < dataValues.length; i += 1) {\n          var dataValue = dataValues[i] * conversionFactor;\n          responseObject.datapoints.push([dataValue, timeStamp]);\n          timeStamp += options.intervalMs;\n        }\n\n        graphs.data.push(responseObject);\n      });\n      return graphs;\n    }\n  }, {\n    key: \"transformPowerQueryDataToGraph\",\n    value: function transformPowerQueryDataToGraph(data) {\n      var result = [];\n      var values = data.values;\n\n      for (var i = 0; i < values.length; i += 1) {\n        var dataValue = values[i];\n\n        for (var j = 1; j < dataValue.length; j += 1) {\n          var responseObject = {\n            target: dataValue[0] + \": \" + data.columns[j].name,\n            datapoints: [[dataValue[j], Date.now()]]\n          };\n          result.push(responseObject);\n        }\n      }\n\n      return {\n        data: result\n      };\n    }\n  }]);\n\n  return GenericDatasource;\n}();\n\n//# sourceURL=webpack:///./datasource.js?");

/***/ }),

/***/ "./module.js":
/*!*******************!*\
  !*** ./module.js ***!
  \*******************/
/*! exports provided: Datasource, QueryCtrl, ConfigCtrl, QueryOptionsCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"QueryOptionsCtrl\", function() { return GenericQueryOptionsCtrl; });\n/* harmony import */ var _datasource__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./datasource */ \"./datasource.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"Datasource\", function() { return _datasource__WEBPACK_IMPORTED_MODULE_0__[\"GenericDatasource\"]; });\n\n/* harmony import */ var _query_ctrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./query_ctrl */ \"./query_ctrl.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"QueryCtrl\", function() { return _query_ctrl__WEBPACK_IMPORTED_MODULE_1__[\"GenericDatasourceQueryCtrl\"]; });\n\n/* harmony import */ var _config_ctrl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./config_ctrl */ \"./config_ctrl.js\");\n/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, \"ConfigCtrl\", function() { return _config_ctrl__WEBPACK_IMPORTED_MODULE_2__[\"GenericConfigCtrl\"]; });\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\n/* eslint-disable max-classes-per-file */\n\n\n\n\nvar GenericQueryOptionsCtrl = function GenericQueryOptionsCtrl() {\n  _classCallCheck(this, GenericQueryOptionsCtrl);\n};\n\nGenericQueryOptionsCtrl.templateUrl = 'partials/query.options.html';\n\nvar GenericAnnotationsQueryCtrl = function GenericAnnotationsQueryCtrl() {\n  _classCallCheck(this, GenericAnnotationsQueryCtrl);\n};\n\nGenericAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';\n\n\n//# sourceURL=webpack:///./module.js?");

/***/ }),

/***/ "./query_ctrl.js":
/*!***********************!*\
  !*** ./query_ctrl.js ***!
  \***********************/
/*! exports provided: GenericDatasourceQueryCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"GenericDatasourceQueryCtrl\", function() { return GenericDatasourceQueryCtrl; });\n/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ \"lodash\");\n/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! grafana/app/plugins/sdk */ \"grafana/app/plugins/sdk\");\n/* harmony import */ var grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util */ \"./util.js\");\nfunction _typeof(obj) { \"@babel/helpers - typeof\"; if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } return _assertThisInitialized(self); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\n\n\n\nvar GenericDatasourceQueryCtrl =\n/*#__PURE__*/\nfunction (_QueryCtrl) {\n  _inherits(GenericDatasourceQueryCtrl, _QueryCtrl);\n\n  function GenericDatasourceQueryCtrl($scope, $injector) {\n    var _this;\n\n    _classCallCheck(this, GenericDatasourceQueryCtrl);\n\n    _this = _possibleConstructorReturn(this, _getPrototypeOf(GenericDatasourceQueryCtrl).call(this, $scope, $injector));\n    _this.scope = $scope;\n    _this.queryTypes = {\n      POWER_QUERY: 'Power Query',\n      STANDARD_QUERY: 'Standard Query'\n    }; // Default to standard query.\n\n    if (!_this.target.queryType) {\n      _this.target.queryType = _this.queryTypes.STANDARD_QUERY;\n    }\n\n    _this.target.dataLink = Object(_util__WEBPACK_IMPORTED_MODULE_2__[\"createDataLinkURL\"])(_this.target.queryText, _this.getScalyrDatasourceUrl());\n    _this.target.copyText = \"Copy\";\n    return _this;\n  }\n  /**\n   * Put the current DataLink into the user's clipboard\n   */\n\n\n  _createClass(GenericDatasourceQueryCtrl, [{\n    key: \"copyDataLink\",\n    value: function copyDataLink() {\n      var _this2 = this;\n\n      /* eslint-disable no-undef */\n      navigator.clipboard.writeText(this.target.dataLink).then(function () {\n        _this2.target.copyText = \"Copied\";\n      }, function () {\n        _this2.target.copyText = \"FAILED\";\n      });\n      /* eslint-enable no-undef */\n    }\n    /**\n     * Return a list of available functions. The 'count' function is only available if a facet isn't selected.\n     */\n\n  }, {\n    key: \"getFacetFunctionOptions\",\n    value: function getFacetFunctionOptions() {\n      var options = [];\n\n      if (!this.target.facet) {\n        options.push({\n          text: 'count',\n          value: 'count'\n        });\n      }\n\n      options = options.concat([{\n        text: 'mean',\n        value: 'mean'\n      }, {\n        text: 'min',\n        value: 'min'\n      }, {\n        text: 'max',\n        value: 'max'\n      }, {\n        text: 'sumPerSec',\n        value: 'sumPerSec'\n      }, {\n        text: '10th %ile',\n        value: 'p10'\n      }, {\n        text: '50th %ile',\n        value: 'p50'\n      }, {\n        text: '90th %ile',\n        value: 'p90'\n      }, {\n        text: '95th %ile',\n        value: 'p95'\n      }, {\n        text: '99th %ile',\n        value: 'p99'\n      }, {\n        text: '99.9th %ile',\n        value: 'p999'\n      }]);\n      return options;\n    }\n    /**\n     * Get list of query type options. Only two options are power query or standard query.\n     * @returns {*[]}\n     */\n\n  }, {\n    key: \"getQueryTypeOptions\",\n    value: function getQueryTypeOptions() {\n      return [{\n        text: this.queryTypes.POWER_QUERY,\n        value: this.queryTypes.POWER_QUERY\n      }, {\n        text: this.queryTypes.STANDARD_QUERY,\n        value: this.queryTypes.STANDARD_QUERY\n      }];\n    }\n  }, {\n    key: \"toggleEditorMode\",\n    value: function toggleEditorMode() {\n      this.target.rawQuery = !this.target.rawQuery;\n    }\n  }, {\n    key: \"onChangeInternal\",\n    value: function onChangeInternal() {\n      this.target.panelType = this.panel.type;\n\n      if (GenericDatasourceQueryCtrl.isQueryValid(this.target)) {\n        if (this.target.queryType === this.queryTypes.STANDARD_QUERY) {\n          this.target.dataLink = Object(_util__WEBPACK_IMPORTED_MODULE_2__[\"createDataLinkURL\"])(this.target.queryText, this.getScalyrDatasourceUrl());\n        }\n\n        this.target.copyText = \"Copy\";\n        this.panelCtrl.refresh(); // Asks the panel to refresh data.\n      }\n    }\n  }, {\n    key: \"getScalyrDatasourceUrl\",\n    value: function getScalyrDatasourceUrl() {\n      var str = this.panelCtrl.datasource.scalyrUrl;\n\n      if (str.charAt(str.length - 1) !== \"/\") {\n        return str + \"/\";\n      }\n\n      return str;\n    }\n    /**\n     * Check if the current query target is valid.\n     * @param target\n     * @returns {boolean}\n     */\n\n  }], [{\n    key: \"isQueryValid\",\n    value: function isQueryValid(target) {\n      if (target.conversionFactor) {\n        try {\n          var value = Object(_util__WEBPACK_IMPORTED_MODULE_2__[\"getValidConversionFactor\"])(target.conversionFactor);\n          return lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isFinite(value);\n        } catch (e) {\n          return false;\n        }\n      }\n\n      return true;\n    }\n  }]);\n\n  return GenericDatasourceQueryCtrl;\n}(grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_1__[\"QueryCtrl\"]);\nGenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';\n\n//# sourceURL=webpack:///./query_ctrl.js?");

/***/ }),

/***/ "./util.js":
/*!*****************!*\
  !*** ./util.js ***!
  \*****************/
/*! exports provided: getValidConversionFactor, splitOnArrayElements, createDataLinkURL */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getValidConversionFactor\", function() { return getValidConversionFactor; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"splitOnArrayElements\", function() { return splitOnArrayElements; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"createDataLinkURL\", function() { return createDataLinkURL; });\n/* eslint-disable no-template-curly-in-string */\n\n/**\n * Convert the user entered conversion factor to a number. \n * User entered conversion factor can be expressed as fractions as well. \n * E.g. 1/4\n * \n * @param conversionFactor conversion factor.\n * @returns {*|number}\n */\nfunction getValidConversionFactor(conversionFactor) {\n  try {\n    // https://gist.github.com/drifterz28/6971440\n    var result;\n\n    if (conversionFactor.search('/') >= 0) {\n      var frac;\n      var deci;\n      var wholeNum = 0;\n\n      if (conversionFactor.search('-') >= 0) {\n        wholeNum = conversionFactor.split('-');\n        conversionFactor = wholeNum[1];\n        wholeNum = parseInt(wholeNum[0], 10);\n      } else {\n        frac = conversionFactor;\n      }\n\n      if (conversionFactor.search('/') >= 0) {\n        frac = frac.split('/');\n        deci = parseInt(frac[0], 10) / parseInt(frac[1], 10);\n      }\n\n      result = wholeNum + deci;\n    } else {\n      result = conversionFactor;\n    }\n\n    return parseFloat(result) || 1.0;\n  } catch (e) {\n    return 1.0;\n  }\n}\n/**\n * Split a given string on multiple separators given in a list\n *\n * @param str String to split\n * @param splitters List of values to split the string on\n * @returns {string[]}\n */\n\nfunction splitOnArrayElements(str, splitters) {\n  var result = [str];\n\n  if (splitters) {\n    for (var i = 0; i < splitters.length; i += 1) {\n      var subresult = [];\n\n      for (var j = 0; j < result.length; j += 1) {\n        subresult = subresult.concat(result[j].split(splitters[i]));\n      }\n\n      result = subresult;\n    }\n  }\n\n  return result;\n}\n/**\n * Create a DataLink URL for a given query and datasource destination\n *\n * @param queryText Query for this DataLink\n * @param scalyrDatasourceUrl Scalyr server URL this datasource is pointed to\n * @returns {string}\n */\n\nfunction createDataLinkURL(queryText, scalyrDatasourceUrl) {\n  var dataLinkFilter = \"\";\n\n  if (queryText) {\n    // This regex should be the same one that Grafana uses to find variables, at time of writing it is here:\n    // https://github.com/grafana/grafana/blob/cf2cc713933599e7646416a56a665282c9d9e3bb/public/app/features/templating/variable.ts#L11\n    var varRegex = /\\$(\\w+)|\\[\\[([\\s\\S]+?)(?::(\\w+))?\\]\\]|\\${(\\w+)(?:\\.([^:^}]+))?(?::(\\w+))?}/g;\n    var extractedVars = [];\n    var extractedVarNames = [];\n    var match = varRegex.exec(queryText);\n\n    while (match != null) {\n      extractedVars.push(match[0]);\n\n      for (var i = 1; i < match.length; i += 1) {\n        if (match[i]) {\n          extractedVarNames.push(match[i]);\n          break;\n        }\n      }\n\n      match = varRegex.exec(queryText);\n    }\n\n    var queryWithoutVars = splitOnArrayElements(queryText, extractedVars);\n\n    for (var _i = 0; _i < queryWithoutVars.length; _i += 1) {\n      queryWithoutVars[_i] = encodeURIComponent(queryWithoutVars[_i]);\n    }\n\n    var filterText = \"\";\n\n    if (extractedVars) {\n      filterText = queryWithoutVars.reduce(function (arr, v, i) {\n        if (extractedVarNames[i]) {\n          return arr.concat(v, \"${\" + extractedVarNames[i] + \":lucene}\");\n        }\n\n        return arr.concat(v, extractedVarNames[i]);\n      }, []).join(\"\");\n    } else {\n      filterText = '\"' + queryWithoutVars[0] + '\"';\n    }\n\n    dataLinkFilter = \"&filter=\" + filterText;\n  }\n\n  return scalyrDatasourceUrl + \"v2/grafana-redirect?startTime=${__from}&endTime=${__to}\" + dataLinkFilter;\n}\n\n//# sourceURL=webpack:///./util.js?");

/***/ }),

/***/ "grafana/app/plugins/sdk":
/*!**********************************!*\
  !*** external "app/plugins/sdk" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_grafana_app_plugins_sdk__;\n\n//# sourceURL=webpack:///external_%22app/plugins/sdk%22?");

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_lodash__;\n\n//# sourceURL=webpack:///external_%22lodash%22?");

/***/ })

/******/ })});;