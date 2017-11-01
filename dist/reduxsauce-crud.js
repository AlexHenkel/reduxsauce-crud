'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createReducer = exports.createActions = exports.createTypes = exports.createState = undefined;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _seamlessImmutable = require('seamless-immutable');

var _seamlessImmutable2 = _interopRequireDefault(_seamlessImmutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var d = { deep: true

  ////////////////////////////
  ///////  CREATE INITIAL STATE
  ////////////////////////////
};var getDefaultState = function getDefaultState(action) {
  var getOneInitial = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  switch (action) {
    case 'get':
      return {
        fetching: false,
        error: null,
        results: []
      };
    case 'getOne':
      return {
        fetching: false,
        error: null,
        result: getOneInitial,
        id: null
      };
    case 'create':
    case 'update':
      return {
        fetching: false,
        error: null,
        success: false
      };
    case 'remove':
      return {
        fetching: false,
        pending: null, // Store object to remove while fetching db, to update state without refresh
        error: null,
        success: false
      };
  }

  return {};
};
/**
  Creates an immutable state with default configuration for defaultActions: get, getOne, create, update, remove
  @param {object} - Object with custom state
  @param {object} config - Configuration for default actions
  @return {object} - An immutable state with merged custom an default properties
*/
var createState = exports.createState = function createState(customState) {
  var defaultConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var defaultActionsObj = {};
  if (defaultConfig.get) {
    Object.assign(defaultActionsObj, { get: getDefaultState('get') });
  }
  if (defaultConfig.getOne) {
    Object.assign(defaultActionsObj, { getOne: getDefaultState('getOne', defaultConfig.getOneInitial) });
  }
  if (defaultConfig.create) {
    Object.assign(defaultActionsObj, { create: getDefaultState('create') });
  }
  if (defaultConfig.update) {
    Object.assign(defaultActionsObj, { upgrade: getDefaultState('update') });
  }
  if (defaultConfig.remove) {
    Object.assign(defaultActionsObj, { remove: getDefaultState('remove') });
  }

  return (0, _seamlessImmutable2.default)(_ramda2.default.merge(customState, defaultActionsObj));
};

////////////////////////////
///////  CREATE TYPES
////////////////////////////

/**
  DRY define your types object from a string
  @param {string} config - String with Action types
  @param {object} options - Optional. // See more at https://github.com/skellock/reduxsauce
  @return {object} A types object.
*/
var createTypes = exports.createTypes = function createTypes(types, options) {
  if (_ramda2.default.isNil(types)) throw new Error('valid types are required');

  var _ref = options || {},
      _ref$prefix = _ref.prefix,
      prefix = _ref$prefix === undefined ? '' : _ref$prefix;

  return _ramda2.default.pipe(_ramda2.default.trim, _ramda2.default.split(/\s/), _ramda2.default.map(_ramda2.default.trim), _ramda2.default.without([null, '']), _ramda2.default.map(function (x) {
    return [x, prefix + camelToScreamingSnake(x)];
  }), _ramda2.default.fromPairs)(types);
};

////////////////////////////
///////  CREATE ACTIONS
////////////////////////////

// matches on capital letters (except at the start & end of the string)
var RX_CAPS = /(?!^)([A-Z])/g;

// converts a camelCaseWord into a SCREAMING_SNAKE_CASE word
var camelToScreamingSnake = _ramda2.default.pipe(_ramda2.default.replace(RX_CAPS, '_$1'), _ramda2.default.toUpper);

// Creates an object with default cycle actions, which include: request, success, failure, reset
var getDefaultCycle = function getDefaultCycle(action) {
  var _ref2;

  return _ref2 = {}, _defineProperty(_ref2, action + 'Request', true), _defineProperty(_ref2, action + 'Success', true), _defineProperty(_ref2, action + 'Failure', true), _defineProperty(_ref2, action + 'Reset', true), _ref2;
};

// Get types from default actions
var defaultTypes = function defaultTypes(_ref3) {
  var _ref3$defaultActions = _ref3.defaultActions,
      defaultActions = _ref3$defaultActions === undefined ? {} : _ref3$defaultActions;

  var defaultTypesObj = {};

  if (defaultActions.get) {
    Object.assign(defaultTypesObj, getDefaultCycle('get'));
  }
  if (defaultActions.getOne) {
    var _Object$assign;

    Object.assign(defaultTypesObj, getDefaultCycle('getOne'), (_Object$assign = {}, _defineProperty(_Object$assign, 'getOneCreateFrom', true), _defineProperty(_Object$assign, 'getOneUpdateFrom', true), _defineProperty(_Object$assign, 'getOneRemoveFrom', true), _defineProperty(_Object$assign, 'getOneFromState', true), _Object$assign));
  }
  if (defaultActions.create) {
    Object.assign(defaultTypesObj, getDefaultCycle('create'));
  }
  if (defaultActions.update) {
    Object.assign(defaultTypesObj, getDefaultCycle('update'));
  }
  if (defaultActions.remove) {
    Object.assign(defaultTypesObj, getDefaultCycle('remove'));
  }
  if (defaultActions.reset) {
    Object.assign(defaultTypesObj, { reset: true });
  }

  return defaultTypesObj;
};

// build Action Types out of an object
var convertToTypes = function convertToTypes(config) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var newConfig = _ramda2.default.merge(config, defaultTypes(options));
  var typesCreator = _ramda2.default.curry(createTypes)(_ramda2.default.__, options);

  return _ramda2.default.pipe(_ramda2.default.keys, // just the keys
  _ramda2.default.join(' '), // space separated
  typesCreator // make them into Redux Types
  )(newConfig);
};

// an action creator with additional properties
var createActionCreator = function createActionCreator(name, extraPropNames, prefix) {
  // types are upcase and snakey
  var type = prefix + camelToScreamingSnake(name);

  // do we need extra props for this?
  var noKeys = _ramda2.default.isNil(extraPropNames) || _ramda2.default.isEmpty(extraPropNames);

  // a type-only action creator
  if (noKeys) return function () {
    return {
      type: type
    };
  };

  // an action creator with type + properties
  return function () {
    for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
      values[_key] = arguments[_key];
    }

    var extraProps = _ramda2.default.zipObj(extraPropNames, values);

    return _ramda2.default.merge({ type: type }, extraProps);
  };
};

// build Action Creators out of an objet
var convertToCreators = function convertToCreators(config) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$prefix = options.prefix,
      prefix = _options$prefix === undefined ? '' : _options$prefix,
      defaultActions = options.defaultActions;


  var userActions = _ramda2.default.mapObjIndexed(function (num, key, value) {
    if (typeof value[key] === 'function') {
      // the user brought their own action creator
      return value[key];
    } else {
      // lets make an action creator for them!
      return createActionCreator(key, value[key], prefix);
    }
  })(config);

  // Map default actions with know behavior
  var defaultActionsCreators = {};
  if (defaultActions) {
    var get = defaultActions.get,
        getOne = defaultActions.getOne,
        create = defaultActions.create,
        update = defaultActions.update,
        remove = defaultActions.remove,
        reset = defaultActions.reset;


    if (get) {
      Object.assign(defaultActionsCreators, {
        getRequest: createActionCreator('getRequest', ['data', 'force'], prefix),
        getSuccess: createActionCreator('getSuccess', ['results'], prefix),
        getFailure: createActionCreator('getFailure', ['error'], prefix),
        getReset: createActionCreator('getReset', null, prefix)
      });
    }

    if (getOne) {
      Object.assign(defaultActionsCreators, {
        getOneRequest: createActionCreator('getOneRequest', ['id', 'data', 'force'], prefix),
        getOneSuccess: createActionCreator('getOneSuccess', ['id', 'result', 'noResolve'], prefix),
        getOneFailure: createActionCreator('getOneFailure', ['error'], prefix),
        getOneReset: createActionCreator('getOneReset', null, prefix),
        // Action to add an object of a nested property
        getOneCreateFrom: createActionCreator('getOneCreateFrom', ['newElement', 'property', 'customFilter'], prefix),
        // Action to update an object of a nested property
        getOneUpdateFrom: createActionCreator('getOneUpdateFrom', ['newElement', 'property'], prefix),
        // Action to remove an object of a nested property
        getOneRemoveFrom: createActionCreator('getOneRemoveFrom', ['id', 'property'], prefix),
        // Action to get one from other redux action path
        getOneFromState: createActionCreator('getOneFromState', ['id', 'path'], prefix)
      });
    }

    // create is an array with required props
    if (create) {
      Object.assign(defaultActionsCreators, {
        createRequest: createActionCreator('createRequest', ['data'], prefix),
        createSuccess: createActionCreator('createSuccess', ['result'], prefix),
        createFailure: createActionCreator('createFailure', ['error'], prefix),
        createReset: createActionCreator('createReset', null, prefix)
      });
    }

    // update is an array with required props
    if (update) {
      Object.assign(defaultActionsCreators, {
        updateRequest: createActionCreator('updateRequest', ['id', 'data'], prefix),
        updateSuccess: createActionCreator('updateSuccess', ['result'], prefix),
        updateFailure: createActionCreator('updateFailure', ['error'], prefix),
        updateReset: createActionCreator('updateReset', null, prefix)
      });
    }

    if (remove) {
      Object.assign(defaultActionsCreators, {
        removeRequest: createActionCreator('removeRequest', ['id', 'data'], prefix),
        removeSuccess: createActionCreator('removeSuccess', ['id'], prefix),
        removeFailure: createActionCreator('removeFailure', ['error'], prefix),
        removeReset: createActionCreator('removeReset', null, prefix)
      });
    }

    if (reset) {
      Object.assign(defaultActionsCreators, {
        reset: createActionCreator('reset', null, prefix)
      });
    }
  }

  // Merge declared user actions and default actions
  return _ramda2.default.merge(userActions, defaultActionsCreators);
};

/**
  Builds your Action Types and Action Creators at the same time
  @param {object} config - An object with actions as key and an array of props as value
  @param {object} options - Optional. // See more at https://github.com/skellock/reduxsauce
  @return {object} An object with Action Types and Action Creators
*/
var createActions = exports.createActions = function createActions(config) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (_ramda2.default.isNil(config)) {
    throw new Error('an object is required to setup types and creators');
  }

  return {
    Types: convertToTypes(config, options),
    Creators: convertToCreators(config, options)
  };
};

////////////////////////////
///////  CREATE REDUCER
////////////////////////////

var defaultActionsReducers = function defaultActionsReducers(INITIAL_STATE, _ref4) {
  var _ref4$defaultActions = _ref4.defaultActions,
      defaultActions = _ref4$defaultActions === undefined ? {} : _ref4$defaultActions,
      Types = _ref4.Types;
  var get = defaultActions.get,
      getOne = defaultActions.getOne,
      create = defaultActions.create,
      remove = defaultActions.remove,
      update = defaultActions.update,
      reset = defaultActions.reset;

  var defaultActionsObj = {};

  if (get) {
    var _Object$assign2;

    Object.assign(defaultActionsObj, (_Object$assign2 = {}, _defineProperty(_Object$assign2, Types.getRequest, function (state) {
      return state.merge({ get: { fetching: true } }, d);
    }), _defineProperty(_Object$assign2, Types.getSuccess, function (state, _ref5) {
      var results = _ref5.results;
      return state.merge({ get: { fetching: false, error: null, results: results } }, d);
    }), _defineProperty(_Object$assign2, Types.getFailure, function (state, _ref6) {
      var error = _ref6.error;
      return state.merge({ get: { fetching: false, error: error } }, d);
    }), _defineProperty(_Object$assign2, Types.getReset, function (state) {
      return state.merge({ get: { fetching: false, error: null, results: [] } }, d);
    }), _Object$assign2));
  }
  if (getOne) {
    var _Object$assign3;

    Object.assign(defaultActionsObj, (_Object$assign3 = {}, _defineProperty(_Object$assign3, Types.getOneRequest, function (state) {
      return state.merge({ getOne: { fetching: true } }, d);
    }), _defineProperty(_Object$assign3, Types.getOneSuccess, function (state, _ref7) {
      var id = _ref7.id,
          result = _ref7.result,
          noResolve = _ref7.noResolve;

      var getOne = {
        error: null,
        result: result
      };
      if (!noResolve) {
        getOne.fetching = false;
        getOne.id = id;
      }
      return state.merge({ getOne: getOne }, d);
    }), _defineProperty(_Object$assign3, Types.getOneFailure, function (state, _ref8) {
      var id = _ref8.id,
          error = _ref8.error;
      return state.merge({ getOne: { fetching: false, id: id, error: error } }, d);
    }), _defineProperty(_Object$assign3, Types.getOneReset, function (state) {
      return state.merge([{ getOne: { fetching: false, error: null, id: null, result: null } }, { getOne: { result: INITIAL_STATE.getOne.result } }], d);
    }), _defineProperty(_Object$assign3, Types.getOneCreateFrom, function (state, _ref9) {
      var newElement = _ref9.newElement,
          property = _ref9.property,
          _ref9$customFilter = _ref9.customFilter,
          customFilter = _ref9$customFilter === undefined ? null : _ref9$customFilter;

      // Get the complete object
      var _R$clone = _ramda2.default.clone(state.getOne),
          result = _R$clone.result;
      // Verify if result exists or if filter exists and if it fails


      if (!result || customFilter && !customFilter(result, newElement)) return state;
      // Add new element to desired property array
      result[property].push(newElement);
      // Update the complete object
      return state.merge({ getOne: { result: result } }, d);
    }), _defineProperty(_Object$assign3, Types.getOneUpdateFrom, function (state, _ref10) {
      var newElement = _ref10.newElement,
          property = _ref10.property;

      // Get the complete object
      var _R$clone2 = _ramda2.default.clone(state.getOne),
          result = _R$clone2.result;
      // Get out if it's not defined


      if (!result) return state;
      // Get updated index on the desired property array
      var index = _ramda2.default.findIndex(_ramda2.default.propEq('id', newElement.id))(result[property]);
      // Return if it's not in current object
      if (index === -1) return state;
      // Modify updated index with new info
      result[property][index] = _ramda2.default.merge(result[property][index], newElement);
      // Update the complete object
      return state.merge({ getOne: { result: result } }, d);
    }), _defineProperty(_Object$assign3, Types.getOneRemoveFrom, function (state, _ref11) {
      var id = _ref11.id,
          property = _ref11.property;

      // Get the complete object
      var _R$clone3 = _ramda2.default.clone(state.getOne),
          result = _R$clone3.result;
      // Get out if it's not defined


      if (!result) return state;
      // Get the desired property array without the element
      var currResults = _ramda2.default.filter(function (item) {
        return item.id != id;
      }, result[property]);
      // Update result desired property, with the new array
      result[property] = currResults;
      // Update the complete object
      return state.merge({ getOne: { result: result } }, d);
    }), _Object$assign3));
  }
  if (create) {
    var _Object$assign4;

    Object.assign(defaultActionsObj, (_Object$assign4 = {}, _defineProperty(_Object$assign4, Types.createRequest, function (state) {
      return state.merge({ create: { fetching: true } }, d);
    }), _defineProperty(_Object$assign4, Types.createSuccess, function (state, _ref12) {
      var result = _ref12.result;

      // Add new element to get elements
      var _R$clone4 = _ramda2.default.clone(state.get),
          results = _R$clone4.results;

      results.push(result);
      return state.merge({ create: { fetching: false, success: true }, get: { results: results } }, d);
    }), _defineProperty(_Object$assign4, Types.createFailure, function (state, _ref13) {
      var error = _ref13.error;
      return state.merge({ create: { fetching: false, error: error } }, d);
    }), _defineProperty(_Object$assign4, Types.createReset, function (state) {
      return state.merge({ create: { fetching: false, success: false, error: null } }, d);
    }), _Object$assign4));
  }
  if (update) {
    var _Object$assign5;

    Object.assign(defaultActionsObj, (_Object$assign5 = {}, _defineProperty(_Object$assign5, Types.updateRequest, function (state) {
      return state.merge({ upgrade: { fetching: true } }, d);
    }), _defineProperty(_Object$assign5, Types.updateSuccess, function (state, _ref14) {
      var result = _ref14.result;

      // Get getOne item
      var getOneItem = _ramda2.default.clone(state.getOne.result);
      // Verify if new element is equal to the one in getOne, in order to update it
      if (getOneItem && result.id === getOneItem.id) {
        getOneItem = _ramda2.default.merge(getOneItem, result);
      }
      // Get array with all results

      var _R$clone5 = _ramda2.default.clone(state.get),
          results = _R$clone5.results;
      // Get updated index


      var index = _ramda2.default.findIndex(_ramda2.default.propEq('id', result.id))(results);
      // Verify if object is found
      if (index >= 0) {
        // Modify updated index with new info
        results[index] = _ramda2.default.merge(results[index], result);
      }
      return state.merge({ upgrade: { fetching: false, success: true }, get: { results: results }, getOne: { result: getOneItem } }, d);
    }), _defineProperty(_Object$assign5, Types.updateFailure, function (state, _ref15) {
      var error = _ref15.error;
      return state.merge({ upgrade: { fetching: false, error: error } }, d);
    }), _defineProperty(_Object$assign5, Types.updateReset, function (state) {
      return state.merge({ upgrade: { fetching: false, success: false, error: null } }, d);
    }), _Object$assign5));
  }
  if (remove) {
    var _Object$assign6;

    Object.assign(defaultActionsObj, (_Object$assign6 = {}, _defineProperty(_Object$assign6, Types.removeRequest, function (state, _ref16) {
      var id = _ref16.id;
      return state.merge({ remove: { fetching: true, pending: id } }, d);
    }), _defineProperty(_Object$assign6, Types.removeSuccess, function (state) {
      var _R$clone6 = _ramda2.default.clone(state.get),
          results = _R$clone6.results;

      var pending = state.remove.pending;

      // Get getOne item

      var getOneItem = _ramda2.default.clone(state.getOne.result);
      var getOneId = state.getOne.id;
      if (getOneItem && getOneItem.id === pending) {
        // Reset getOne item
        getOneItem = null;
        getOneId = null;
      }

      results = _ramda2.default.filter(function (item) {
        return item.id != pending;
      }, results);
      return state.merge({ remove: { fetching: false, success: true }, get: { results: results }, getOne: { result: getOneItem, id: getOneId } }, d);
    }), _defineProperty(_Object$assign6, Types.removeFailure, function (state, _ref17) {
      var error = _ref17.error;
      return state.merge({ remove: { fetching: false, error: error, pending: null } }, d);
    }), _defineProperty(_Object$assign6, Types.removeReset, function (state) {
      return state.merge({ remove: { fetching: false, success: false, error: null, pending: null } }, d);
    }), _Object$assign6));
  }
  if (reset) {
    Object.assign(defaultActionsObj, _defineProperty({}, Types.reset, INITIAL_STATE));
  }

  return defaultActionsObj;
};

/**
  Creates a reducer.
  @param {object} initialState - The initial state for this reducer.
  @param {object} handlers - Keys are action types (strings), values are reducers (functions).
  @param {object} options - Capable of creating default action reducers (get, getOne, create, update, remove, reset)
  @return {object} A reducer object.
*/
var createReducer = exports.createReducer = function createReducer(initialState, handlers, options) {
  // initial state is required
  if (_ramda2.default.isNil(initialState)) {
    throw new Error('initial state is required');
  }

  // handlers must be an object
  if (_ramda2.default.isNil(handlers) || !_ramda2.default.is(Object, handlers)) {
    throw new Error('handlers must be an object');
  }

  // handlers cannot have an undefined key
  if (_ramda2.default.any(_ramda2.default.equals('undefined'))(_ramda2.default.keys(handlers))) {
    throw new Error('handlers cannot have an undefined key');
  }

  var newHandlers = options ? _ramda2.default.merge(handlers, defaultActionsReducers(initialState, options)) : handlers;

  // create the reducer function
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    // wrong actions, just return state
    if (_ramda2.default.isNil(action)) return state;
    if (!_ramda2.default.has('type', action)) return state;

    // look for the handler
    var handler = newHandlers[action.type];

    // no handler no cry
    if (_ramda2.default.isNil(handler)) return state;

    // execute the handler
    return handler(state, action);
  };
};

exports.default = {
  createActions: createActions,
  createState: createState,
  createReducer: createReducer,
  createTypes: createTypes
};