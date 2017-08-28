import test from 'ava'
import R from 'ramda'
import reduxsauce from '../reduxsauce-polymer'
import Immutable from 'seamless-immutable'

const { createReducer, createState, createActions } = reduxsauce;

const { Types, Creators } = createActions({}, { 
  prefix: 'SUPER_',
  defaultActions: {
    get: true,
    getOne: true,
    create: true,
    update: true,
    reset: true,
    remove: true,
  }
})

const INITIAL_STATE = createState({}, {
  get: true,
  getOne: true,
  create: true,
  update: true,
  reset: true,
  remove: true,
})

const Reducer = createReducer(INITIAL_STATE, {}, {
  defaultActions: {
    get: true,
    getOne: true,
    create: true,
    update: true,
    reset: true,
    remove: true,
  },
  Types,
})


///////////////////////////////////////////////////
///
/// Get
///
///////////////////////////////////////////////////
test('get request-success default action', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.getRequest())
  t.is(newState.get.fetching, true) 
  // Success
  newState = Reducer(newState, Creators.getSuccess([1,2,3]))
  t.is(newState.get.fetching, false)   
  t.is(newState.get.results.length, 3)  
  t.is(newState.get.error, null)     
})

test('get request-error default action', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.getRequest());
  t.is(newState.get.fetching, true) 
  // Error
  newState = Reducer(newState, Creators.getFailure({ message: 'fail' }))
  t.is(newState.get.fetching, false)
  t.is(newState.get.error.message, 'fail')
  t.is(newState.get.results.length, 0)
})

test('get request-success-reset default action', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.getRequest())
  t.is(newState.get.fetching, true) 
  // Success
  newState = Reducer(newState, Creators.getSuccess([1,2,3]))
  t.is(newState.get.fetching, false)   
  t.is(newState.get.results.length, 3)  
  t.is(newState.get.error, null) 
  // Reset
  newState = Reducer(newState, Creators.getReset())
  t.is(newState.get.fetching, false)   
  t.is(newState.get.results.length, 0)     
  t.is(newState.get.error, null)     
})

///////////////////////////////////////////////////
///
/// Get One
///
///////////////////////////////////////////////////
test('getOne request-success default action', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.getOneRequest())
  t.is(newState.getOne.fetching, true) 
  // Success
  newState = Reducer(newState, Creators.getOneSuccess(2, { foo: 'bar' }))
  t.is(newState.getOne.fetching, false)   
  t.is(newState.getOne.result.foo, 'bar')  
  t.is(newState.getOne.id, 2)     
})

test('getOne request-success not resolving loading', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.getOneRequest())
  t.is(newState.getOne.fetching, true) 
  // Success
  newState = Reducer(newState, Creators.getOneSuccess(2, { foo: 'bar' }, true))
  t.is(newState.getOne.fetching, true)   
  t.is(newState.getOne.result.foo, 'bar')  
  t.is(newState.getOne.id, null)     
})

// GetOne Create From
test('in getOne state, create a new item in nested prop', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.getOneRequest())
  // Success
  newState = Reducer(newState, Creators.getOneSuccess(2, { foo: [] }))
  t.is(newState.getOne.result.foo.length, 0)

  // Push new item to foo
  newState = Reducer(newState, Creators.getOneCreateFrom(1, 'foo'));
  t.is(newState.getOne.result.foo.length, 1)    
})

test('in getOne state, create a new item in nested prop, passing also the filter', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.getOneRequest())
  // Success
  newState = Reducer(newState, Creators.getOneSuccess(2, { id: 1, foo: [] }))
  t.is(newState.getOne.result.foo.length, 0)  

  // Push new item to foo
  newState = Reducer(newState, Creators.getOneCreateFrom({ fooId: 1 , bar: []}, 'foo', (current, item) => item.fooId === current.id));
  t.is(newState.getOne.result.foo.length, 1)    
})

test('in getOne state, create a new item in nested prop, but ignore request since filter failed', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.getOneRequest())
  // Success
  newState = Reducer(newState, Creators.getOneSuccess(2, { id: 10, foo: [] }))
  t.is(newState.getOne.result.foo.length, 0)  

  // Try to push new item to foo
  newState = Reducer(newState, Creators.getOneCreateFrom({ foo: 2 , bar: []}, 'foo', (current, item) => item.foo === current.id));
  t.is(newState.getOne.result.foo.length, 0)       
})

// GetOne Update From
test('in getOne state, update an existing item nested prop', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.getOneRequest())
  // Success
  newState = Reducer(newState, Creators.getOneSuccess(2, { foo: [{ id: 10, name: 'foo' }]}))
  t.is(newState.getOne.result.foo.length, 1)
  t.is(newState.getOne.result.foo[0].name, 'foo')  

  // Update new item to foo
  newState = Reducer(newState, Creators.getOneUpdateFrom({ id: 10, name: 'bar'}, 'foo'));
  t.is(newState.getOne.result.foo.length, 1)    
  t.is(newState.getOne.result.foo[0].name, 'bar')    
})

// GetOne Remove From
test('in getOne state, remove an existing item nested prop', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.getOneRequest())
  // Success
  newState = Reducer(newState, Creators.getOneSuccess(2, { foo: [{ id: 10, name: 'foo' }]}))
  t.is(newState.getOne.result.foo.length, 1)

  // Remove new item to foo
  newState = Reducer(newState, Creators.getOneRemoveFrom(10, 'foo'));
  t.is(newState.getOne.result.foo.length, 0)    
})

///////////////////////////////////////////////////
///
/// Create
///
///////////////////////////////////////////////////
test('create request-success default action, new item is added to get state', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.createRequest())
  t.is(newState.create.fetching, true) 
  t.is(newState.get.results.length, 0)    
  // Success
  newState = Reducer(newState, Creators.createSuccess(1))
  t.is(newState.create.fetching, false)   
  t.is(newState.create.success, true)   
  t.is(newState.get.results.length, 1)  
  t.is(newState.create.error, null)     
})

test('create request-error default action', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.createRequest());
  t.is(newState.create.fetching, true) 
  // Error
  newState = Reducer(newState, Creators.createFailure({ message: 'fail' }))
  t.is(newState.create.fetching, false)
  t.is(newState.create.success, false)     
  t.is(newState.create.error.message, 'fail')
  t.is(newState.get.results.length, 0)
})

test('create request-success-reset default action', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.createRequest())
  t.is(newState.create.fetching, true) 
  // Success
  newState = Reducer(newState, Creators.createSuccess(1))
  t.is(newState.create.fetching, false)   
  t.is(newState.get.results.length, 1)  
  t.is(newState.create.error, null) 
  // Reset
  newState = Reducer(newState, Creators.createReset())
  t.is(newState.create.fetching, false)   
  t.is(newState.create.error, null)     
})

///////////////////////////////////////////////////
///
/// Update
///
///////////////////////////////////////////////////
test('update request-success default action, new item is updated in get array and getOne result', (t) => {
  // Add some element to state
  let newState = Reducer(INITIAL_STATE, Creators.getSuccess([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]))
  t.is(newState.get.results.length, 2);
  t.is(newState.get.results[1].name, 'Jane');  
  newState = Reducer(newState, Creators.getOneSuccess(2, { id: 2, name: 'Jane', likesFrom: [] }))
  t.is(newState.getOne.result.likesFrom.length, 0)
  t.is(newState.getOne.result.name, 'Jane')   
  t.is(newState.getOne.result.likesFrom.length, 0)
  
  // Request update
  newState = Reducer(newState, Creators.updateRequest())
  t.is(newState.upgrade.fetching, true) 
  t.is(newState.get.results.length, 2)    
  // Success
  newState = Reducer(newState, Creators.updateSuccess({ id: 2, name: 'James', likesFrom: [1, 2] }))
  t.is(newState.upgrade.fetching, false)   
  t.is(newState.upgrade.success, true)
  t.is(newState.get.results.length, 2)  
  t.is(newState.upgrade.error, null) 
  // Success update on get
  t.is(newState.get.results[1].name, 'James')   
  // Success update on getOne
  t.is(newState.getOne.result.name, 'James') 
  t.is(newState.getOne.result.likesFrom.length, 2)
})

test('update request-success default action, new item is updated in get array but not getOne result', (t) => {
  // Add some element to state
  let newState = Reducer(INITIAL_STATE, Creators.getSuccess([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]))
  t.is(newState.get.results.length, 2);
  t.is(newState.get.results[1].name, 'Jane');  
  newState = Reducer(newState, Creators.getOneSuccess(2, { id: 2, name: 'Jane', likesFrom: [] }))
  t.is(newState.getOne.result.likesFrom.length, 0)
  t.is(newState.getOne.result.name, 'Jane')   
  t.is(newState.getOne.result.likesFrom.length, 0)
  
  // Request update
  newState = Reducer(newState, Creators.updateRequest())
  t.is(newState.upgrade.fetching, true) 
  t.is(newState.get.results.length, 2)    
  // Success
  newState = Reducer(newState, Creators.updateSuccess({ id: 1, name: 'James', likesFrom: [1, 2] }))
  t.is(newState.upgrade.fetching, false)   
  t.is(newState.upgrade.success, true)
  t.is(newState.get.results.length, 2)  
  t.is(newState.upgrade.error, null) 
  // Success update on get
  t.is(newState.get.results[0].name, 'James')   
  // Success update on getOne
  t.is(newState.getOne.result.name, 'Jane') 
  t.is(newState.getOne.result.likesFrom.length, 0)
})

test('update request-error default action', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.updateRequest());
  t.is(newState.upgrade.fetching, true) 
  // Error
  newState = Reducer(newState, Creators.updateFailure({ message: 'fail' }))
  t.is(newState.upgrade.fetching, false)
  t.is(newState.upgrade.success, false)     
  t.is(newState.upgrade.error.message, 'fail')
  t.is(newState.get.results.length, 0)
})

test('update request-success-reset default action', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.updateRequest())
  t.is(newState.upgrade.fetching, true) 
  // Success
  newState = Reducer(newState, Creators.updateSuccess({ id: 1, name: 'Jane' }))
  t.is(newState.upgrade.fetching, false) 
  t.is(newState.upgrade.error, null) 
  // Reset
  newState = Reducer(newState, Creators.updateReset())
  t.is(newState.upgrade.fetching, false)   
  t.is(newState.upgrade.error, null)     
})

///////////////////////////////////////////////////
///
/// Remove
///
///////////////////////////////////////////////////
test('remove request-success default action, new item is removed in get array and getOne result', (t) => {
  // Add some element to state
  let newState = Reducer(INITIAL_STATE, Creators.getSuccess([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]))
  t.is(newState.get.results.length, 2);
  t.is(newState.get.results[1].name, 'Jane');  
  newState = Reducer(newState, Creators.getOneSuccess(2, { id: 2, name: 'Jane', likesFrom: [] }))
  t.is(newState.getOne.result.likesFrom.length, 0)
  t.is(newState.getOne.result.name, 'Jane')   
  t.is(newState.getOne.result.likesFrom.length, 0)
  
  // Request remove
  newState = Reducer(newState, Creators.removeRequest(2))
  t.is(newState.remove.fetching, true) 
  t.is(newState.remove.pending, 2) 
  t.is(newState.get.results.length, 2)    
  // Success
  newState = Reducer(newState, Creators.removeSuccess({ id: 2, name: 'James', likesFrom: [1, 2] }))
  t.is(newState.remove.fetching, false)   
  t.is(newState.remove.success, true)
  t.is(newState.remove.error, null) 
  // // Success remove on get
  t.is(newState.get.results.length, 1)  
  // Success remove on getOne
  t.is(newState.getOne.result, null) 
  t.is(newState.getOne.id, null) 
})

test('remove request-success default action, new item is removed in get array but not getOne result', (t) => {
  // Add some element to state
  let newState = Reducer(INITIAL_STATE, Creators.getSuccess([{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]))
  t.is(newState.get.results.length, 2);
  t.is(newState.get.results[1].name, 'Jane');  
  newState = Reducer(newState, Creators.getOneSuccess(2, { id: 2, name: 'Jane', likesFrom: [] }))
  t.is(newState.getOne.result.likesFrom.length, 0)
  t.is(newState.getOne.result.name, 'Jane')   
  t.is(newState.getOne.result.likesFrom.length, 0)
  
  // Request remove
  newState = Reducer(newState, Creators.removeRequest(1))
  // Success
  newState = Reducer(newState, Creators.removeSuccess({ id: 2, name: 'James', likesFrom: [1, 2] }))
  t.is(newState.remove.fetching, false)   
  t.is(newState.remove.success, true)
  t.is(newState.remove.error, null) 
  // // Success remove on get
  t.is(newState.get.results.length, 1)  
  // Success remove on getOne
  t.is(newState.getOne.result.id, 2) 
  t.is(newState.getOne.id, 2) 
})

test('remove request-error default action', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.removeRequest(2));
  t.is(newState.remove.fetching, true) 
  // Error
  newState = Reducer(newState, Creators.removeFailure({ message: 'fail' }))
  t.is(newState.remove.fetching, false)
  t.is(newState.remove.success, false)    
  t.is(newState.remove.pending, null)      
  t.is(newState.remove.error.message, 'fail')
})

test('remove request-error-reset default action', (t) => {
  // Request
  let newState = Reducer(INITIAL_STATE, Creators.removeRequest(1))
  t.is(newState.remove.fetching, true) 
  // Error
  newState = Reducer(newState, Creators.removeFailure({ message: 'fail' }))
  // Reset
  newState = Reducer(newState, Creators.removeReset())
  t.is(newState.remove.fetching, false)   
  t.is(newState.remove.error, null)     
  t.is(newState.remove.pending, null)     
})