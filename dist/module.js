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
/******/ 	__webpack_require__.p = "/";
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
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GenericConfigCtrl", function() { return GenericConfigCtrl; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var GenericConfigCtrl = /*#__PURE__*/function () {
  function GenericConfigCtrl($scope) {
    _classCallCheck(this, GenericConfigCtrl);

    this.showKey = true;
    this.scope = $scope;

    if (!this.current.jsonData.scalyrUrl) {
      this.current.jsonData.scalyrUrl = 'https://www.scalyr.com';
    }

    if (this.current.jsonData.scalyrApiKey) {
      this.showKey = false;
    }
  }

  _createClass(GenericConfigCtrl, [{
    key: "onChangeKey",
    value: function onChangeKey() {
      this.current.jsonData.scalyrApiKey = this.current.jsonData.scalyrApiKeyView;
    }
  }, {
    key: "resetKey",
    value: function resetKey() {
      this.current.jsonData.scalyrApiKey = "";
      this.current.jsonData.scalyrApiKeyView = "";
      this.showKey = true;
    }
  }]);

  return GenericConfigCtrl;
}();
GenericConfigCtrl.templateUrl = 'partials/config.html';

/***/ }),

/***/ "./datasource.js":
/*!***********************!*\
  !*** ./datasource.js ***!
  \***********************/
/*! exports provided: GenericDatasource */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GenericDatasource", function() { return GenericDatasource; });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util */ "./util.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }



var GenericDatasource = /*#__PURE__*/function () {
  /**
   * Constructor
   * @param {*} instanceSettings 
   * @param {*} $q query
   * @param {*} backendSrv 
   * @param {*} templateSrv 
   */
  function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
    _classCallCheck(this, GenericDatasource);

    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.apiKey = instanceSettings.jsonData.scalyrApiKey;
    this.scalyrUrl = instanceSettings.jsonData.scalyrUrl;
    this.backendSrv = backendSrv;
    this.q = $q;
    this.templateSrv = templateSrv;
    this.headers = {
      'Content-Type': 'application/json'
    };
    this.queryTypes = {
      POWER_QUERY: 'Power Query',
      STANDARD_QUERY: 'Standard Query'
    };
    this.visualizationType = {
      GRAPH: 'graph',
      TABLE: 'table'
    };
  }
  /**
   * Grafana uses this function to initiate all queries
   * @param {*} options - query settings/options https://grafana.com/docs/plugins/developing/datasources/#query
   */


  _createClass(GenericDatasource, [{
    key: "query",
    value: function query(options) {
      // Migrate filters from versions 2.3.0 and older
      for (var i = 0; i < options.targets.length; i += 1) {
        if (options.targets[i].queryText) {
          options.targets[i].filter = options.targets[i].queryText;
          options.targets[i].queryText = null;
        }
      }

      var queryType = options.targets[0].queryType;

      if (!options.targets.every(function (x) {
        return x.queryType === queryType;
      })) {
        return {
          status: "error",
          message: "All queries should have the same query type."
        };
      }

      if (queryType === this.queryTypes.POWER_QUERY) {
        if (options.targets.length === 1) {
          return this.performPowerQuery(options);
        }

        return {
          status: "error",
          message: "You can only have one power query per panel."
        };
      }

      return this.performTimeseriesQuery(options);
    }
  }, {
    key: "annotationQuery",
    value: function annotationQuery(options) {
      var query = this.createLogsQueryForAnnotation(options);
      return this.backendSrv.datasourceRequest(query).then(function (response) {
        var data = response.data;
        var timeField = options.annotation.timeField || "timestamp";
        var timeEndField = options.annotation.timeEndField || null;
        var textField = options.annotation.textField || "message";
        return GenericDatasource.transformAnnotationResults(data.matches, timeField, timeEndField, textField);
      });
    }
    /**
     * Grafana uses this function to test data source settings. 
     * This verifies API key using the facet query API. 
     * The endpoint returns 401 if the token is invalid.
     */

  }, {
    key: "testDatasource",
    value: function testDatasource() {
      return this.backendSrv.datasourceRequest({
        url: this.url + '/facetQuery',
        data: JSON.stringify({
          token: this.apiKey,
          queryType: 'facet',
          filter: '',
          startTime: new Date().getTime(),
          endTime: new Date().getTime(),
          field: 'XYZ'
        }),
        method: 'POST'
      }).then(function (response) {
        if (response && response.status && response.status === 200) {
          return {
            status: "success",
            message: "Successfully connected to Scalyr!"
          };
        } // We will never hit this but eslint complains about lack of return


        return {
          status: "error",
          message: "Scalyr returned HTTP code ".concat(response.status)
        };
      })["catch"](function (err) {
        var message = "Cannot connect to Scalyr!";

        if (err && err.data && err.data.message) {
          message = "".concat(message, " Scalyr response - ").concat(err.data.message);
        }

        return {
          status: "error",
          message: message
        };
      });
    }
    /**
     * Grafana uses this function to load metric values. 
     * @param {*} query - query options
     */

  }, {
    key: "metricFindQuery",
    value: function metricFindQuery(query) {
      var d = new Date();
      d.setHours(d.getHours() - 6);
      return this.backendSrv.datasourceRequest({
        url: this.url + '/facetQuery',
        data: JSON.stringify({
          token: this.apiKey,
          queryType: 'facet',
          filter: '',
          startTime: d.getTime(),
          endTime: new Date().getTime(),
          field: query
        }),
        method: 'POST'
      }).then(function (response) {
        var values = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.get(response, 'data.values', []);

        return values.map(function (value) {
          return {
            text: value.value,
            value: value.value
          };
        });
      });
    }
    /**
     * Default interpolator for Grafana variables for this datasource
     *
     * @param value The value of this variable
     * @param variable The Grafana variable information
     * @returns {string}
     */

  }, {
    key: "createTimeSeriesQuery",
    value:
    /**
     * Create a request to the scalyr time series endpoint.
     * @param {*} options 
     */
    function createTimeSeriesQuery(options) {
      var _this = this;

      var queries = [];
      options.targets.forEach(function (target) {
        var filterText = _this.templateSrv.replace(target.filter, options.scopedVars, GenericDatasource.interpolateVariable);

        var functionText = '';

        if (target.field) {
          functionText = "".concat(target["function"] || 'count', "(").concat(target.field, ")");
        }

        var query = {
          startTime: options.range.from.valueOf(),
          endTime: options.range.to.valueOf(),
          buckets: GenericDatasource.getNumberOfBuckets(options),
          filter: filterText,
          "function": functionText
        };
        queries.push(query);
      });
      return {
        url: this.url + '/timeSeriesApi',
        method: 'POST',
        headers: this.headers,
        data: JSON.stringify({
          token: this.apiKey,
          queries: queries
        })
      };
    }
  }, {
    key: "createLogsQueryForAnnotation",
    value: function createLogsQueryForAnnotation(options) {
      var filterText = this.templateSrv.replace(options.annotation.queryText, options.scopedVars, GenericDatasource.interpolateVariable);
      return {
        url: this.url + '/query',
        method: 'POST',
        headers: this.headers,
        data: JSON.stringify({
          token: this.apiKey,
          queryType: "log",
          filter: filterText,
          startTime: options.range.from.valueOf(),
          endTime: options.range.to.valueOf(),
          maxCount: 5000
        })
      };
    }
    /**
     * Get how many buckets to return based on the query time range
     * @param {*} options 
     */

  }, {
    key: "performTimeseriesQuery",
    value:
    /**
     * Perform the timeseries query using the Grafana proxy.
     * @param {*} options 
     */
    function performTimeseriesQuery(options) {
      var query = this.createTimeSeriesQuery(options);
      return this.backendSrv.datasourceRequest(query).then(function (response) {
        var data = response.data;
        return GenericDatasource.transformTimeSeriesResults(data.results, options);
      });
    }
    /**
     * Transform data returned by time series query into Grafana timeseries format.
     * https://grafana.com/docs/plugins/developing/datasources/#query
     * @param results
     * @param conversionFactor conversion factor to be applied to each data point. This can be used to for example convert bytes to MB.
     * @returns {{data: Array}}
     */

  }, {
    key: "createPowerQuery",
    value:
    /**
     * Create powerquery query to pass to Grafana proxy.
     * @param queryText text of the query
     * @param startTime start time
     * @param endTime end time
     * @returns {{url: string, method: string, headers: {"Content-Type": string}, data: string}}
     */
    function createPowerQuery(queryText, startTime, endTime, options) {
      queryText = this.templateSrv.replace(queryText, options.scopedVars, GenericDatasource.interpolateVariable);
      var query = {
        token: this.apiKey,
        query: queryText,
        startTime: startTime,
        endTime: endTime
      };
      return {
        url: this.url + '/powerQuery',
        method: 'POST',
        headers: this.headers,
        data: JSON.stringify(query)
      };
    }
    /**
     * Perform the powerquery using Grafana proxy.
     * @param options
     * @returns {Promise<{data: *[]}> | *}
     */

  }, {
    key: "performPowerQuery",
    value: function performPowerQuery(options) {
      var _this2 = this;

      var target = options.targets[0];
      var query = this.createPowerQuery(target.filter, options.range.from.valueOf(), options.range.to.valueOf(), options);
      return this.backendSrv.datasourceRequest(query).then(function (response) {
        var data = response && response.data;
        return _this2.transformPowerQueryDataToTable(data);
      });
    }
    /**
     * Transform Power Query Data in table format that Grafana needs.
     * https://grafana.com/docs/plugins/developing/datasources/#query
     * @param data
     * @returns {{data: *[]}}
     */

  }, {
    key: "transformPowerQueryDataToTable",
    value: function transformPowerQueryDataToTable(data) {
      var cloneData = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.clone(data);

      cloneData.columns.map(function (col) {
        col.text = col.name;
        return col;
      });
      cloneData.columns.forEach(function (col, index) {
        if (col.text === "timestamp") {
          col.text = "time";
          col.name = "time";
          cloneData.values.forEach(function (value) {
            value[index] = Number(value[index]) / 1000000;
          });
        }
      });
      return {
        data: [{
          type: this.visualizationType.TABLE,
          columns: cloneData.columns,
          rows: cloneData.values
        }]
      };
    }
  }], [{
    key: "interpolateVariable",
    value: function interpolateVariable(value, variable) {
      if (typeof value === 'string') {
        if (variable.multi || variable.includeAll) {
          return "'" + value.replace(/'/g, "''") + "'";
        }

        return value;
      }

      if (typeof value === 'number') {
        return value;
      }

      var quotedValues = lodash__WEBPACK_IMPORTED_MODULE_0___default.a.map(value, function (val) {
        if (typeof value === 'number') {
          return value;
        }

        return "'" + val.replace(/'/g, "''") + "'";
      });

      return quotedValues.join(',');
    }
  }, {
    key: "getNumberOfBuckets",
    value: function getNumberOfBuckets(options) {
      return Math.floor((options.range.to.valueOf() - options.range.from.valueOf()) / options.intervalMs);
    }
  }, {
    key: "transformTimeSeriesResults",
    value: function transformTimeSeriesResults(results, options) {
      var graphs = {
        data: []
      };
      results.forEach(function (result, index) {
        var timeStamp = options.range.from.valueOf();
        var dataValues = result.values;
        var currentTarget = options.targets[index];
        var responseObject = {
          target: currentTarget.label || currentTarget.filter,
          datapoints: []
        };
        var conversionFactor = Object(_util__WEBPACK_IMPORTED_MODULE_1__["getValidConversionFactor"])(currentTarget.conversionFactor);

        for (var i = 0; i < dataValues.length; i += 1) {
          var dataValue = dataValues[i] * conversionFactor;
          responseObject.datapoints.push([dataValue, timeStamp]);
          timeStamp += options.intervalMs;
        }

        graphs.data.push(responseObject);
      });
      return graphs;
    }
    /**
     * Transform data returned by time series query into Grafana annotation format.
     * @param results
     * @param options
     * @returns Array
     */

  }, {
    key: "transformAnnotationResults",
    value: function transformAnnotationResults(results, timeField, timeEndField, textField) {
      var annotations = [];
      results.forEach(function (result) {
        var responseObject = {};
        responseObject.time = Number(result[timeField]) / 1000000;

        if (!responseObject.time && result.attributes) {
          responseObject.time = Number(result.attributes[timeField]) / 1000000;
        }

        responseObject.text = result[textField];

        if (!responseObject.text && result.attributes) {
          responseObject.text = result.attributes[textField];
        }

        if (timeEndField) {
          responseObject.timeEnd = Number(result[timeEndField]) / 1000000;

          if (!responseObject.timeEnd && result.attributes) {
            responseObject.timeEnd = Number(result.attributes[timeEndField]) / 1000000;
          }
        }

        if (responseObject.time) {
          annotations.push(responseObject);
        }
      });
      return annotations;
    }
  }]);

  return GenericDatasource;
}();

/***/ }),

/***/ "./module.js":
/*!*******************!*\
  !*** ./module.js ***!
  \*******************/
/*! exports provided: Datasource, QueryCtrl, ConfigCtrl, QueryOptionsCtrl, AnnotationsQueryCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "QueryOptionsCtrl", function() { return GenericQueryOptionsCtrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AnnotationsQueryCtrl", function() { return GenericAnnotationsQueryCtrl; });
/* harmony import */ var _datasource__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./datasource */ "./datasource.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Datasource", function() { return _datasource__WEBPACK_IMPORTED_MODULE_0__["GenericDatasource"]; });

/* harmony import */ var _query_ctrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./query_ctrl */ "./query_ctrl.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "QueryCtrl", function() { return _query_ctrl__WEBPACK_IMPORTED_MODULE_1__["GenericDatasourceQueryCtrl"]; });

/* harmony import */ var _config_ctrl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./config_ctrl */ "./config_ctrl.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ConfigCtrl", function() { return _config_ctrl__WEBPACK_IMPORTED_MODULE_2__["GenericConfigCtrl"]; });

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable max-classes-per-file */




var GenericQueryOptionsCtrl = /*#__PURE__*/_createClass(function GenericQueryOptionsCtrl() {
  _classCallCheck(this, GenericQueryOptionsCtrl);
});

GenericQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

var GenericAnnotationsQueryCtrl = /*#__PURE__*/_createClass(function GenericAnnotationsQueryCtrl() {
  _classCallCheck(this, GenericAnnotationsQueryCtrl);
});

GenericAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';


/***/ }),

/***/ "./query_ctrl.js":
/*!***********************!*\
  !*** ./query_ctrl.js ***!
  \***********************/
/*! exports provided: GenericDatasourceQueryCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GenericDatasourceQueryCtrl", function() { return GenericDatasourceQueryCtrl; });
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! grafana/app/plugins/sdk */ "grafana/app/plugins/sdk");
/* harmony import */ var grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util */ "./util.js");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }




var GenericDatasourceQueryCtrl = /*#__PURE__*/function (_QueryCtrl) {
  _inherits(GenericDatasourceQueryCtrl, _QueryCtrl);

  var _super = _createSuper(GenericDatasourceQueryCtrl);

  function GenericDatasourceQueryCtrl($scope, $injector) {
    var _this;

    _classCallCheck(this, GenericDatasourceQueryCtrl);

    _this = _super.call(this, $scope, $injector);
    _this.scope = $scope;
    _this.queryTypes = {
      POWER_QUERY: 'Power Query',
      STANDARD_QUERY: 'Standard Query'
    }; // Default to standard query.

    if (!_this.target.queryType) {
      _this.target.queryType = _this.queryTypes.STANDARD_QUERY;
    }

    _this.target.dataLink = Object(_util__WEBPACK_IMPORTED_MODULE_2__["createDataLinkURL"])(_this.target.filter, _this.getScalyrDatasourceUrl());
    _this.target.copyText = "Copy"; // Migrate filters from versions 2.3.0 and older

    if (_this.target.queryText) {
      _this.target.filter = _this.target.queryText;
      _this.target.queryText = null;
    }

    return _this;
  }
  /**
   * Put the current DataLink into the user's clipboard
   */


  _createClass(GenericDatasourceQueryCtrl, [{
    key: "copyDataLink",
    value: function copyDataLink() {
      var _this2 = this;

      /* eslint-disable no-undef */
      navigator.clipboard.writeText(this.target.dataLink).then(function () {
        _this2.target.copyText = "Copied";
      }, function () {
        _this2.target.copyText = "FAILED";
      });
      /* eslint-enable no-undef */
    }
    /**
     * Return a list of available functions. The 'count' function is only available if no field is selected.
     */

  }, {
    key: "getFunctionOptions",
    value: function getFunctionOptions() {
      var options = [];

      if (!this.target.field) {
        options.push({
          text: 'count',
          value: 'count'
        });
      }

      options = options.concat([{
        text: 'mean',
        value: 'mean'
      }, {
        text: 'min',
        value: 'min'
      }, {
        text: 'max',
        value: 'max'
      }, {
        text: 'sumPerSec',
        value: 'sumPerSec'
      }, {
        text: '10th %ile',
        value: 'p10'
      }, {
        text: '50th %ile',
        value: 'p50'
      }, {
        text: '90th %ile',
        value: 'p90'
      }, {
        text: '95th %ile',
        value: 'p95'
      }, {
        text: '99th %ile',
        value: 'p99'
      }, {
        text: '99.9th %ile',
        value: 'p999'
      }]);
      return options;
    }
    /**
     * Get list of query type options. Only two options are power query or standard query.
     * @returns {*[]}
     */

  }, {
    key: "getQueryTypeOptions",
    value: function getQueryTypeOptions() {
      return [{
        text: this.queryTypes.POWER_QUERY,
        value: this.queryTypes.POWER_QUERY
      }, {
        text: this.queryTypes.STANDARD_QUERY,
        value: this.queryTypes.STANDARD_QUERY
      }];
    }
  }, {
    key: "toggleEditorMode",
    value: function toggleEditorMode() {
      this.target.rawQuery = !this.target.rawQuery;
    }
  }, {
    key: "onChangeInternal",
    value: function onChangeInternal() {
      this.target.panelType = this.panel.type;

      if (GenericDatasourceQueryCtrl.isQueryValid(this.target)) {
        if (this.target.queryType === this.queryTypes.STANDARD_QUERY) {
          this.target.dataLink = Object(_util__WEBPACK_IMPORTED_MODULE_2__["createDataLinkURL"])(this.target.filter, this.getScalyrDatasourceUrl());
        }

        this.target.copyText = "Copy";
        this.panelCtrl.refresh(); // Asks the panel to refresh data.
      }
    }
  }, {
    key: "getScalyrDatasourceUrl",
    value: function getScalyrDatasourceUrl() {
      var str = this.panelCtrl.datasource.scalyrUrl;

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

  }], [{
    key: "isQueryValid",
    value: function isQueryValid(target) {
      if (target.conversionFactor) {
        try {
          var value = Object(_util__WEBPACK_IMPORTED_MODULE_2__["getValidConversionFactor"])(target.conversionFactor);
          return lodash__WEBPACK_IMPORTED_MODULE_0___default.a.isFinite(value);
        } catch (e) {
          return false;
        }
      }

      return true;
    }
  }]);

  return GenericDatasourceQueryCtrl;
}(grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_1__["QueryCtrl"]);
GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

/***/ }),

/***/ "./util.js":
/*!*****************!*\
  !*** ./util.js ***!
  \*****************/
/*! exports provided: getValidConversionFactor, splitOnArrayElements, createDataLinkURL */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getValidConversionFactor", function() { return getValidConversionFactor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "splitOnArrayElements", function() { return splitOnArrayElements; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createDataLinkURL", function() { return createDataLinkURL; });
/* eslint-disable no-template-curly-in-string */

/**
 * Convert the user entered conversion factor to a number. 
 * User entered conversion factor can be expressed as fractions as well. 
 * E.g. 1/4
 * 
 * @param conversionFactor conversion factor.
 * @returns {*|number}
 */
function getValidConversionFactor(conversionFactor) {
  try {
    // https://gist.github.com/drifterz28/6971440
    var result;

    if (conversionFactor.search('/') >= 0) {
      var frac;
      var deci;
      var wholeNum = 0;

      if (conversionFactor.search('-') >= 0) {
        wholeNum = conversionFactor.split('-');
        conversionFactor = wholeNum[1];
        wholeNum = parseInt(wholeNum[0], 10);
      } else {
        frac = conversionFactor;
      }

      if (conversionFactor.search('/') >= 0) {
        frac = frac.split('/');
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

function splitOnArrayElements(str, splitters) {
  var result = [str];

  if (splitters) {
    for (var i = 0; i < splitters.length; i += 1) {
      var subresult = [];

      for (var j = 0; j < result.length; j += 1) {
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

function createDataLinkURL(queryText, scalyrDatasourceUrl) {
  var dataLinkFilter = "";

  if (queryText) {
    // This regex should be the same one that Grafana uses to find variables, at time of writing it is here:
    // https://github.com/grafana/grafana/blob/cf2cc713933599e7646416a56a665282c9d9e3bb/public/app/features/templating/variable.ts#L11
    var varRegex = /\$(\w+)|\[\[([\s\S]+?)(?::(\w+))?\]\]|\${(\w+)(?:\.([^:^}]+))?(?::(\w+))?}/g;
    var extractedVars = [];
    var extractedVarNames = [];
    var match = varRegex.exec(queryText);

    while (match != null) {
      extractedVars.push(match[0]);

      for (var i = 1; i < match.length; i += 1) {
        if (match[i]) {
          extractedVarNames.push(match[i]);
          break;
        }
      }

      match = varRegex.exec(queryText);
    }

    var queryWithoutVars = splitOnArrayElements(queryText, extractedVars);

    for (var _i = 0; _i < queryWithoutVars.length; _i += 1) {
      queryWithoutVars[_i] = encodeURIComponent(queryWithoutVars[_i]);
    }

    var filterText = "";

    if (extractedVars) {
      filterText = queryWithoutVars.reduce(function (arr, v, i) {
        if (extractedVarNames[i]) {
          return arr.concat(v, "${" + extractedVarNames[i] + ":lucene}");
        }

        return arr.concat(v, extractedVarNames[i]);
      }, []).join("");
    } else {
      filterText = '"' + queryWithoutVars[0] + '"';
    }

    dataLinkFilter = "&filter=" + filterText;
  } // Deal with grafana-redirect only working with "app." prefix in EU regions. This simple replacement should be
  // safe as long as we don't plan on allowing custom domains running Scalyr that have "eu." somewhere in the middle.


  var host = scalyrDatasourceUrl.replace("eu.", "app.eu.");
  return host + "v2/grafana-redirect?startTime=${__from}&endTime=${__to}" + dataLinkFilter;
}

/***/ }),

/***/ "grafana/app/plugins/sdk":
/*!**********************************!*\
  !*** external "app/plugins/sdk" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_grafana_app_plugins_sdk__;

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_lodash__;

/***/ })

/******/ })});;
//# sourceMappingURL=module.js.map