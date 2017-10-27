import test from 'ava'
import reduxsauce from '../src/reduxsauce-crud'

const { createActions } = reduxsauce;

///////////////////////////////////////////////////
///
/// Default redux sauce tests
///
///////////////////////////////////////////////////

test('throws an error if passed empty or null', t => {
  t.throws(() => createActions(null))
  t.throws(() => createActions())
})

test('has Creators and Types', t => {
  const { Creators, Types } = createActions({ one: null })
  t.truthy(Creators)
  t.truthy(Types)
})

test('types are snake case', t => {
  const { Types } = createActions({ helloWorld: null })
  t.is(Types.helloWorld, 'HELLO_WORLD')
})

test('null produces a type-only action creator', t => {
  const { Creators } = createActions({ helloWorld: null })
  t.is(typeof Creators.helloWorld, 'function')
  t.deepEqual(Creators.helloWorld(), { type: 'HELLO_WORLD' })
})

test('[] produces a type-only action creator', t => {
  const { Creators } = createActions({ helloWorld: [] })
  t.is(typeof Creators.helloWorld, 'function')
  t.deepEqual(Creators.helloWorld(), { type: 'HELLO_WORLD' })
})

test('[\'steve\'] produces a valid action creator', t => {
  const { Creators } = createActions({ helloWorld: ['steve'] })
  t.is(typeof Creators.helloWorld, 'function')
  t.deepEqual(Creators.helloWorld('hi'), { type: 'HELLO_WORLD', steve: 'hi' })
})

test('custom action creators are supported', t => {
  const { Creators } = createActions({ custom: () => 123 })
  t.is(Creators.custom(), 123)
})

test('action types prefix is supported', t => {
  const { Types, Creators } = createActions({ helloWorld: null }, { prefix: 'SUPER_' })
  t.is(Types.helloWorld, 'SUPER_HELLO_WORLD')
  t.is('SUPER_HELLO_WORLD', Creators.helloWorld().type)
})

///////////////////////////////////////////////////
///
/// Default actions types tests
///
///////////////////////////////////////////////////

test('action types accepts default actions as options', t => {
  const { Types, Creators } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {},
  })

  t.truthy(Creators)
  t.truthy(Types)
})

test('action types creates get default actions when present in defaultActions', t => {
  const { Types } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      get: true,
    },
  })

  t.is(Types.getRequest, 'SUPER_GET_REQUEST')
  t.is(Types.getSuccess, 'SUPER_GET_SUCCESS')
  t.is(Types.getFailure, 'SUPER_GET_FAILURE')
  t.is(Types.getReset, 'SUPER_GET_RESET')  
})

test('action types creates getOne default actions when present in defaultActions', t => {
  const { Types } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      getOne: true,
    },
  })

  t.is(Types.getOneRequest, 'SUPER_GET_ONE_REQUEST')
  t.is(Types.getOneSuccess, 'SUPER_GET_ONE_SUCCESS')
  t.is(Types.getOneFailure, 'SUPER_GET_ONE_FAILURE')
  t.is(Types.getOneReset, 'SUPER_GET_ONE_RESET')  
})

test('action types creates getOne CRUD actions when present in defaultActions', t => {
  const { Types } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      getOne: true,
    },
  })

  t.is(Types.getOneCreateFrom, 'SUPER_GET_ONE_CREATE_FROM')
  t.is(Types.getOneUpdateFrom, 'SUPER_GET_ONE_UPDATE_FROM')
  t.is(Types.getOneRemoveFrom, 'SUPER_GET_ONE_REMOVE_FROM')
})

test('action types creates create default actions when present in defaultActions', t => {
  const { Types } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      create: true,
    },
  })

  t.is(Types.createRequest, 'SUPER_CREATE_REQUEST')
  t.is(Types.createSuccess, 'SUPER_CREATE_SUCCESS')
  t.is(Types.createFailure, 'SUPER_CREATE_FAILURE')  
  t.is(Types.createReset, 'SUPER_CREATE_RESET')
})

test('action types creates update default actions when present in defaultActions', t => {
  const { Types } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      update: true,
    },
  })

  t.is(Types.updateRequest, 'SUPER_UPDATE_REQUEST')
  t.is(Types.updateSuccess, 'SUPER_UPDATE_SUCCESS')
  t.is(Types.updateFailure, 'SUPER_UPDATE_FAILURE')  
  t.is(Types.updateReset, 'SUPER_UPDATE_RESET')
})

test('action types creates reset when present in defaultActions', t => {
  const { Types } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      reset: true,
    },
  })

  t.is(Types.reset, 'SUPER_RESET')
})

///////////////////////////////////////////////////
///
/// Default actions creators tests
///
///////////////////////////////////////////////////
test('get creators functions have the correct redux type', t => {
  const { Creators } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      get: true,
    },
  })

  t.is(Creators.getRequest().type, 'SUPER_GET_REQUEST')
  t.is(Creators.getSuccess().type, 'SUPER_GET_SUCCESS')
  t.is(Creators.getFailure().type, 'SUPER_GET_FAILURE')
  t.is(Creators.getReset().type, 'SUPER_GET_RESET')  
})

test('get creators functions have the correct parameters', t => {
  const { Creators } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      get: true,
    },
  })
  t.deepEqual(Creators.getSuccess([1,2]).results, [1,2])
  t.deepEqual(Creators.getFailure({}).error, {})
})

test('getOne creators functions have the correct redux type', t => {
  const { Creators } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      getOne: true,
    },
  })

  t.is(Creators.getOneRequest().type, 'SUPER_GET_ONE_REQUEST')
  t.is(Creators.getOneSuccess().type, 'SUPER_GET_ONE_SUCCESS')
  t.is(Creators.getOneFailure().type, 'SUPER_GET_ONE_FAILURE')
  t.is(Creators.getOneReset().type, 'SUPER_GET_ONE_RESET')  
})

test('getOne creators functions have the correct parameters', t => {
  const { Creators } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      getOne: true,
    },
  })
  t.is(Creators.getOneRequest(1).id, 1)
  t.is(Creators.getOneSuccess(1, {}, true).id, 1)
  t.deepEqual(Creators.getOneSuccess(1, {}, true).result, {})
  t.is(Creators.getOneSuccess(1, {}, true).noResolve, true)  
  t.deepEqual(Creators.getOneFailure({}).error, {})

  t.deepEqual(Creators.getOneCreateFrom({}, 'hello', () => {}).newElement, {})
  t.is(Creators.getOneCreateFrom({}, 'hello', () => {}).property, 'hello')    
  t.truthy(Creators.getOneCreateFrom({}, 'hello', () => {}).customFilter)

  t.deepEqual(Creators.getOneUpdateFrom({}, 'hello', () => {}).newElement, {})
  t.is(Creators.getOneUpdateFrom({}, 'hello', () => {}).property, 'hello')   
  
  t.is(Creators.getOneRemoveFrom(1, 'hello').id, 1)
  t.is(Creators.getOneRemoveFrom(1, 'hello').property, 'hello')
  
  t.is(Creators.getOneFromState(1, 'hello').id, 1)
  t.is(Creators.getOneFromState(1, 'hello').path, 'hello')
})

test('create creators functions have the correct redux type', t => {
  const { Creators } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      create: true,
    },
  })

  t.is(Creators.createRequest().type, 'SUPER_CREATE_REQUEST')
  t.is(Creators.createSuccess().type, 'SUPER_CREATE_SUCCESS')
  t.is(Creators.createFailure().type, 'SUPER_CREATE_FAILURE')
  t.is(Creators.createReset().type, 'SUPER_CREATE_RESET')  
})

test('create creators functions have the correct parameters', t => {
  const { Creators } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      create: true,
    },
  })
  t.deepEqual(Creators.createRequest({}).data, {})
  t.deepEqual(Creators.createSuccess({}).result, {})
  t.deepEqual(Creators.createFailure({}).error, {})
})

test('update creators functions have the correct redux type', t => {
  const { Creators } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      update: true,
    },
  })

  t.is(Creators.updateRequest().type, 'SUPER_UPDATE_REQUEST')
  t.is(Creators.updateSuccess().type, 'SUPER_UPDATE_SUCCESS')
  t.is(Creators.updateFailure().type, 'SUPER_UPDATE_FAILURE')
  t.is(Creators.updateReset().type, 'SUPER_UPDATE_RESET')  
})

test('update creators functions have the correct parameters', t => {
  const { Creators } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      update: true,
    },
  })

  t.is(Creators.updateRequest(1, {}).id, 1)  
  t.deepEqual(Creators.updateRequest(1, {}).data, {})
  t.deepEqual(Creators.updateSuccess({}).result, {})
  t.deepEqual(Creators.updateFailure({}).error, {})
})

test('update creators functions have the correct redux type', t => {
  const { Creators } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      remove: true,
    },
  })

  t.is(Creators.removeRequest().type, 'SUPER_REMOVE_REQUEST')
  t.is(Creators.removeSuccess().type, 'SUPER_REMOVE_SUCCESS')
  t.is(Creators.removeFailure().type, 'SUPER_REMOVE_FAILURE')
  t.is(Creators.removeReset().type, 'SUPER_REMOVE_RESET') 
})

test('update creators functions have the correct parameters', t => {
  const { Creators } = createActions({}, {
    prefix: 'SUPER_',
    defaultActions: {
      remove: true,
    },
  })

  t.is(Creators.removeRequest(1).id, 1)  
  t.is(Creators.removeSuccess(1).id, 1)
})