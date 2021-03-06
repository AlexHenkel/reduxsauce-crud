import R from 'ramda'
import Immutable from 'seamless-immutable'

const d = { deep: true }

////////////////////////////
///////  CREATE INITIAL STATE
////////////////////////////
const getDefaultState = (action, getOneInitial = {}) => {
  switch(action) {
    case 'get':
      return {
        fetching: false,
        error: null,
        results: [],
      }
    case 'getOne':
      return {
        fetching: false,
        error: null,
        result: getOneInitial,
        id: null,
      }
    case 'create':
    case 'update':
      return {
        fetching: false,
        error: null,
        success: false,
      }
    case 'remove':
      return {
        fetching: false,
        pending: null, // Store object to remove while fetching db, to update state without refresh
        error: null,
        success: false,
      }
  }

  return {};
}
/**
  Creates an immutable state with default configuration for defaultActions: get, getOne, create, update, remove
  @param {object} - Object with custom state
  @param {object} config - Configuration for default actions
  @return {object} - An immutable state with merged custom an default properties
*/
export const createState = (customState, defaultConfig = {}) => {
  const defaultActionsObj = {};
  if(defaultConfig.get) {
    Object.assign(defaultActionsObj, { get: getDefaultState('get')})
  }
  if(defaultConfig.getOne) {
    Object.assign(defaultActionsObj, { getOne: getDefaultState('getOne', defaultConfig.getOneInitial)})
  }
  if(defaultConfig.create) {
    Object.assign(defaultActionsObj, { create: getDefaultState('create')})
  }
  if(defaultConfig.update) {
    Object.assign(defaultActionsObj, { upgrade: getDefaultState('update')})
  }
  if(defaultConfig.remove) {
    Object.assign(defaultActionsObj, { remove: getDefaultState('remove')})
  }
  
  return Immutable(R.merge(customState, defaultActionsObj))
}

////////////////////////////
///////  CREATE TYPES
////////////////////////////

/**
  DRY define your types object from a string
  @param {string} config - String with Action types
  @param {object} options - Optional. // See more at https://github.com/skellock/reduxsauce
  @return {object} A types object.
*/
export const createTypes = (types, options) => {
  if (R.isNil(types)) throw new Error('valid types are required')

  const { prefix = '' } = options || {}
  
  return R.pipe(
    R.trim,
    R.split(/\s/),
    R.map(R.trim),
    R.without([null, '']),
    R.map((x) => [x, prefix + camelToScreamingSnake(x)]),
    R.fromPairs
  )(types)
}

////////////////////////////
///////  CREATE ACTIONS
////////////////////////////

// matches on capital letters (except at the start & end of the string)
const RX_CAPS = /(?!^)([A-Z])/g

// converts a camelCaseWord into a SCREAMING_SNAKE_CASE word
const camelToScreamingSnake = R.pipe(
  R.replace(RX_CAPS, '_$1'),
  R.toUpper
)

// Creates an object with default cycle actions, which include: request, success, failure, reset
const getDefaultCycle = action => {
  return {
    [`${action}Request`]: true,
    [`${action}Success`]: true,
    [`${action}Failure`]: true,
    [`${action}Reset`]: true,
  }
}

// Get types from default actions
const defaultTypes = ({ defaultActions = {} }) => {
  let defaultTypesObj = {}

  if(defaultActions.get) {
    Object.assign(defaultTypesObj, getDefaultCycle('get'))
  }
  if(defaultActions.getOne) {
    Object.assign(defaultTypesObj, getDefaultCycle('getOne'), {
      ['getOneCreateFrom']: true,
      ['getOneUpdateFrom']: true,
      ['getOneRemoveFrom']: true,
      ['getOneFromState']: true,
    })
  }
  if(defaultActions.create) {
    Object.assign(defaultTypesObj, getDefaultCycle('create'))
  }
  if(defaultActions.update) {
    Object.assign(defaultTypesObj, getDefaultCycle('update'))
  }
  if(defaultActions.remove) {
    Object.assign(defaultTypesObj, getDefaultCycle('remove'))
  }
  if(defaultActions.reset) {
    Object.assign(defaultTypesObj, { reset: true })
  }

  return defaultTypesObj
}

// build Action Types out of an object
const convertToTypes = (config, options = {}) => {
  const newConfig = R.merge(config, defaultTypes(options))
  const typesCreator = R.curry(createTypes)(R.__, options)

  return R.pipe(
    R.keys, // just the keys
    R.join(' '), // space separated
    typesCreator // make them into Redux Types
  )(newConfig)
}

// an action creator with additional properties
const createActionCreator = (name, extraPropNames, prefix) => {
  // types are upcase and snakey
  const type = prefix + camelToScreamingSnake(name)

  // do we need extra props for this?
  const noKeys = R.isNil(extraPropNames) || R.isEmpty(extraPropNames)

  // a type-only action creator
  if (noKeys) return () => ({
    type
  });

  // an action creator with type + properties
  return (...values) => {
    const extraProps = R.zipObj(extraPropNames, values)

    return R.merge({ type }, extraProps);
  }
}

// build Action Creators out of an objet
const convertToCreators = (config, options = {}) => {
  const { prefix = '', defaultActions } = options

  const userActions = R.mapObjIndexed((num, key, value) => {
    if (typeof value[key] === 'function') {
      // the user brought their own action creator
      return value[key]
    } else {
      // lets make an action creator for them!
      return createActionCreator(key, value[key], prefix)
    }
  })(config)

  // Map default actions with know behavior
  const defaultActionsCreators = {};
  if(defaultActions) {
    const { get, getOne, create, update, remove, reset } = defaultActions

    if(get) {
      Object.assign(defaultActionsCreators, {
        getRequest: createActionCreator('getRequest', ['data', 'force'], prefix),
        getSuccess: createActionCreator('getSuccess', ['results'], prefix),
        getFailure: createActionCreator('getFailure', ['error'], prefix),
        getReset: createActionCreator('getReset', null, prefix),
      })
    }
    
    if(getOne) {
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
        getOneFromState: createActionCreator('getOneFromState', ['id', 'path'], prefix),
      })
    }

    // create is an array with required props
    if(create) {
      Object.assign(defaultActionsCreators, {
        createRequest: createActionCreator('createRequest', ['data'], prefix),
        createSuccess: createActionCreator('createSuccess', ['result'], prefix),
        createFailure: createActionCreator('createFailure', ['error'], prefix),
        createReset: createActionCreator('createReset', null, prefix),
      })
    }

    // update is an array with required props
    if(update) {
      Object.assign(defaultActionsCreators, {
        updateRequest: createActionCreator('updateRequest', ['id', 'data'], prefix),
        updateSuccess: createActionCreator('updateSuccess', ['result'], prefix),
        updateFailure: createActionCreator('updateFailure', ['error'], prefix),
        updateReset: createActionCreator('updateReset', null, prefix),
      })
    }

    if(remove) {
      Object.assign(defaultActionsCreators, {
        removeRequest: createActionCreator('removeRequest', ['id', 'data'], prefix),
        removeSuccess: createActionCreator('removeSuccess', ['id'], prefix),
        removeFailure: createActionCreator('removeFailure', ['error'], prefix),
        removeReset: createActionCreator('removeReset', null, prefix),
      })
    }

    if(reset) {
      Object.assign(defaultActionsCreators, {
        reset: createActionCreator('reset', null, prefix),
      })
    }
  }

  // Merge declared user actions and default actions
  return R.merge(userActions, defaultActionsCreators);
}

/**
  Builds your Action Types and Action Creators at the same time
  @param {object} config - An object with actions as key and an array of props as value
  @param {object} options - Optional. // See more at https://github.com/skellock/reduxsauce
  @return {object} An object with Action Types and Action Creators
*/
export const createActions = (config, options = {}) => {
  if (R.isNil(config)) {
    throw new Error('an object is required to setup types and creators')
  }

  return {
    Types: convertToTypes(config, options),
    Creators: convertToCreators(config, options)
  }
}

////////////////////////////
///////  CREATE REDUCER
////////////////////////////

const defaultActionsReducers = (INITIAL_STATE, { defaultActions = {}, Types }) => {
  const { get, getOne, create, remove, update, reset } = defaultActions;
  let defaultActionsObj = {}

  if(get) {
    Object.assign(defaultActionsObj, {
      [Types.getRequest]: state => state.merge({ get: { fetching: true }}, d),
      [Types.getSuccess]: (state, { results }) => state.merge({ get: { fetching: false, error: null, results }}, d),
      [Types.getFailure]: (state, { error }) => state.merge({ get: { fetching: false, error }}, d),
      [Types.getReset]: state => state.merge({ get: { fetching: false, error: null, results: [] }}, d),
    })
  }
  if(getOne) {
    Object.assign(defaultActionsObj, {
      [Types.getOneRequest]: state => state.merge({ getOne: { fetching: true }}, d),
      [Types.getOneSuccess]: (state, { id, result, noResolve }) => {
        let getOne = {
          error: null,
          result,
        }
        if(!noResolve) {
          getOne.fetching = false;
          getOne.id = id;
        }
        return state.merge({ getOne }, d)
      },
      [Types.getOneFailure]: (state, { id, error }) => state.merge({ getOne: { fetching: false, id, error }}, d),
      [Types.getOneReset]: state => state.merge([
        { getOne: { fetching: false, error: null, id: null, result: null }},
        { getOne: { result: INITIAL_STATE.getOne.result }},
      ], d),
      [Types.getOneCreateFrom]: (state, { newElement, property, customFilter = null}) => {
        // Get the complete object
        let { result } = R.clone(state.getOne);
        // Verify if result exists or if filter exists and if it fails
        if(!result || (customFilter && !customFilter(result, newElement))) return state;
        if (property) {
          // Add new element to desired property array
          result[property].push(newElement);
        } else {
          // If property is set to null, just replace result with newElement
          result = newElement;
        }
        // Update the complete object
        return state.merge({ getOne: { result }}, d)
      },
      [Types.getOneUpdateFrom]: (state, { newElement, property }) => {
        // Get the complete object
        let { result } = R.clone(state.getOne);
        // Get out if it's not defined
        if(!result) return state;
        // Verify if property exists, so we can look for it
        if (property) {
          // Get updated index on the desired property array
          const index = R.findIndex(R.propEq('id', newElement.id))(result[property]);
          // Return if it's not in current object
          if (index === -1) return state;
          // Modify updated index with new info
          result[property][index] = R.merge(result[property][index], newElement);
        } else {
          // Since property is set to null, just replace result with newElement
          result = newElement;
        }
        // Update the complete object
        return state.merge({ getOne: { result }}, d)
      },
      [Types.getOneRemoveFrom]: (state, { id, property }) => {
        // Get the complete object
        let { result } = R.clone(state.getOne);
        // Get out if it's not defined
        if(!result) return state;
        // Get the desired property array without the element
        const currResults = R.filter(item => item.id != id, result[property]);
        // Update result desired property, with the new array
        result[property] = currResults;
        // Update the complete object
        return state.merge({ getOne: { result }}, d)
      },
    })
  }
  if(create) {
    Object.assign(defaultActionsObj, {
      [Types.createRequest]: state => state.merge({ create: { fetching: true }}, d),
      [Types.createSuccess]: (state, { result }) => {
        // Add new element to get elements
        let { results } = R.clone(state.get);
        results.push(result);
        return state.merge({ create: { fetching: false, success: true }, get: { results }}, d)
      },
      [Types.createFailure]: (state, { error }) => state.merge({ create: { fetching: false, error }}, d),
      [Types.createReset]: state => state.merge({ create: { fetching: false, success: false, error: null }}, d),
    })
  }
  if(update) {
    Object.assign(defaultActionsObj, {
      [Types.updateRequest]: state => state.merge({ upgrade: { fetching: true }}, d),
      [Types.updateSuccess]: (state, { result }) => {
        // Get getOne item
        let getOneItem = R.clone(state.getOne.result);
        // Verify if new element is equal to the one in getOne, in order to update it
        if(getOneItem && result.id === getOneItem.id) {
          getOneItem = R.merge(getOneItem, result);
        }
        // Get array with all results
        let { results } = R.clone(state.get);
        // Get updated index
        const index = R.findIndex(R.propEq('id', result.id))(results);
        // Verify if object is found
        if(index >= 0) {
          // Modify updated index with new info
          results[index] = R.merge(results[index], result);
        }
        return state.merge({ upgrade: { fetching: false, success: true }, get: { results }, getOne: { result: getOneItem } }, d)
      },
      [Types.updateFailure]: (state, { error }) => state.merge({ upgrade: { fetching: false, error }}, d),
      [Types.updateReset]: state => state.merge({ upgrade: { fetching: false, success: false, error: null }}, d),
    })
  }
  if(remove) {
    Object.assign(defaultActionsObj, {
      [Types.removeRequest]: (state, { id }) => state.merge({ remove: { fetching: true, pending: id }}, d),
      [Types.removeSuccess]: state => {
        let { results } = R.clone(state.get);
        const { pending } = state.remove;
        
        // Get getOne item
        let getOneItem = R.clone(state.getOne.result);
        let getOneId = state.getOne.id;
        if(getOneItem && getOneItem.id === pending) {
          // Reset getOne item
          getOneItem = null;
          getOneId = null;
        }

        results = R.filter(item => item.id != pending, results);
        return state.merge({ remove: { fetching: false, success: true }, get: { results }, getOne: { result: getOneItem, id: getOneId }}, d)
      },
      [Types.removeFailure]: (state, { error }) => state.merge({ remove: { fetching: false, error, pending: null }}, d),
      [Types.removeReset]: state => state.merge({ remove: { fetching: false, success: false, error: null, pending: null }}, d),
    })
  }
  if(reset) {
    Object.assign(defaultActionsObj, { 
      [Types.reset]: INITIAL_STATE 
    })
  }

  return defaultActionsObj
}

/**
  Creates a reducer.
  @param {object} initialState - The initial state for this reducer.
  @param {object} handlers - Keys are action types (strings), values are reducers (functions).
  @param {object} options - Capable of creating default action reducers (get, getOne, create, update, remove, reset)
  @return {object} A reducer object.
*/
export const createReducer = (initialState, handlers, options) => {
  // initial state is required
  if (R.isNil(initialState)) {
    throw new Error('initial state is required')
  }

  // handlers must be an object
  if (R.isNil(handlers) || !R.is(Object, handlers)) {
    throw new Error('handlers must be an object')
  }

  // handlers cannot have an undefined key
  if (R.any(R.equals('undefined'))(R.keys(handlers))) {
    throw new Error('handlers cannot have an undefined key')
  }

  const newHandlers = options ? R.merge(handlers, defaultActionsReducers(initialState, options)) : handlers

  // create the reducer function
  return (state = initialState, action) => {
    // wrong actions, just return state
    if (R.isNil(action)) return state
    if (!R.has('type', action)) return state

    // look for the handler
    const handler = newHandlers[action.type]

    // no handler no cry
    if (R.isNil(handler)) return state

    // execute the handler
    return handler(state, action)
  }
}

export default {
  createActions,
  createState, 
  createReducer,
  createTypes,
}