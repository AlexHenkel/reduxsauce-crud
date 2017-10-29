
# reduxsauce-crud

Adapted from [reduxsauce](https://github.com/skellock/reduxsauce)

## Usage

`yarn add https://github.com/AlexHenkel/reduxsauce-crud.git`

## Overview

This library intends to be a powered version of [reduxsauce](https://github.com/skellock/reduxsauce), so the available functions are the same:
- createReducer
- createTypes
- createActions

**Check the oficial [docs](https://github.com/skellock/reduxsauce) before using this library**

The features added here intend to reduce boilerplate while working with _CRUD systems_  to have a nice DRY code on redux files. This will increase scalability and maintainability as there's only one file to maintain.

We assume that the following pattern is used to handle API request through redux:

 1. Add the following props to handle the state while requesting some data to API:
	 1. `fetching`: Flag to provide a nice loading message while request is in process
	 2. `results`: The array or object with the data fetched from API
	 3. `error`: Flag to handle API errors in the UI, and even get error messages directly from API 
 2. Create the following action creators and reducers:
	 1. `FETCH_REQUEST`: Will set `fetching` flag to true 
	 2. `FETCH_SUCCESS`: Will set `fetching` to false and store the data from API
	 3. `FETCH_ERROR`: Will set `fetching` to false and the error from API
	 4. `FETCH_RESET`: Reset to initial state to clear results or error

As this is a very repetitive process, we intend to abstract the CRUD requests, as they will be used in the same way across the process. (And for special cases, there's always a way to create custom actions)

**Note: This library is optimized to be used along [redux-observable-crud](https://github.com/AlexHenkel/redux-observable-crud) to handle ansync requests with Redux**

# createActions #
Originally, this function has a second parameter **options**. So we made available a new default option called *defaultActions* to generate *CRUD* **ActionCreators** and **Types**

`src/Data/Redux/UsersRedux.js`
```js
import { createActions } from 'reduxsauce-polymer'

export const UsersRedux = createActions({}, {
  prefix: 'USERS_',
  defaultActions: {
    get: true,
	getOne: true,
	create: true,
	update: true,
	remove: true,
	reset: true,
  },
})

const { Types, Creators } = UsersRedux
export const UsersTypes = Types
export default Creators
```
`src/Components/Users.jsx`
```js
import UsersActions from '../../Data/Redux/UsersRedux'
...
const mapDispatchToProps = dispatch => ({
  getUsers: () => dispatch(UsersActions.getRequest()),
})
```
The following action creators are available. *Only new methods are explained*

 - get:
	 -  `getRequest(data)`
		 - `data`: Allows you to pass optional data
	 - `getSuccess(results)`
	 - `getFailure(error)`
	 - `getReset()`
- getOne:
	 -  `getOneRequest(id, data)`
		 - `id`: Specific Id to be fetched from API
		 - `data`: Allows you to pass optional data
	 - `getOneSuccess(id, result, noResolve)`
		 - `result`: This is assumed to be an object
		 - `noResolve`: When true, prevents `fetching` flag to be set to false
	 - `getOneFailure(error)`
	 - `getOneReset()`:
	 - `getOneCreateFrom(newElement, property, customFilter = null)`:  Handle a situation where `getOne` result have nested array, related to another entity. To allow sync, this function appends a new instance to a given path of a `getOne` result.
		 - `newElement`: The element to append
		 - `property`: The key of `getOne.result` where the `newElement` belongs
			 - `customFilter(result, newElement)`: It compares `getOne.result` and `newElement` and return true if they are related, therefore, `newElement` added.
	 - `getOneUpdateFrom(newElement, property)`:  Same as `getOneCreateFrom` but to update an element. In order to find the `newElement` in the existing object, it's compared by **id**.
		 - `newElement`: The element to append
		 - `property`: The key of `getOne.result` where the `newElement` belongs
			 - `customFilter(result, newElement)`: It compares `getOne.result` and `newElement` and return true if they are related, therefore, `newElement` added.
	 - `getOneRemoveFrom(id, property)`:  Same as `getOneCreateFrom` but to remove an element. It only look for the **id** in the `property` path and remove it if it's found.
		 - `newElement`: The element to append
		 - `property`: The key of `getOne.result` where the `newElement` belongs
			 - `customFilter(result, newElement)`: It compares `getOne.result` and `newElement` and return true if they are related, therefore, `newElement` added.
	 - `getOneFromState(id, path)`: Allows you to select an object from any path in the state. This intends to "save" an innecesary API call
		 - `id`: Specific Id to be looked at
		 - `path`: Path in state of the data we are going to extract for
 - create:
	 -  `createRequest(data)`
	 - `createSuccess(result)`: Append the new element to `get.result`
	 - `createFailure(error)`
	 - `createReset()`
 - update:
	 -  `updateRequest(id, data)`
	 - `updateSuccess(result)`: Try to find the element in `get.results` and `getOne.result` to update those as well.
	 - `updateFailure(error)`
	 - `updateReset()`
 - remove:
	 -  `removeRequest(id, data)`
	 - `removeSuccess(result)`: Try to find the element in `get.results` and `getOne.result` to remove them as well.
	 - `removeFailure(error)`
	 - `removeReset()`
 - reset:
	 - `reset()`: Reset **everything** to the initial state

# createState #
Add a second parameter to set *default Actions* initial state.
`src/Data/Redux/UsersRedux.js`
```js
import { createActions } from 'reduxsauce-polymer'

export const INITIAL_STATE = createState({}, {
    get: true,
	getOne: true,
	getOneInitial: {
		/** 
		 * This will set a default value on 
		 * `state.users.getOne.result.sessions`, so array operations
		 * are always available without checking if any data exists!!
		 **/
		sessions: []
	},
	create: true,
	update: true,
	remove: true,
})
```
`src/Components/Users.jsx`
```js
...
const mapStateToProps = state => ({
  loading: state.users.get.fetching,
  users: state.users.get.results,
  sessions: state.users.getOne.result.sessions,
})
```
This will be the complete tree available for *users*:
```
├── users
│   ├── get
│   │   ├── fetching: false
│   │   ├── error: null
│   │   ├── results: []
│   ├── getOne
│   │   ├── fetching: false
│   │   ├── error: null
│   │   ├── result:
│   │   │   ├── sessions * (Specific for this example)
│   ├── create
│   │   ├── fetching: false
│   │   ├── error: null
│   │   ├── success: false
│   ├── update
│   │   ├── fetching: false
│   │   ├── error: null
│   │   ├── success: false
│   ├── remove
│   │   ├── fetching: false
│   │   ├── pending: false
│   │   ├── error: null
│   │   ├── success: false
```
# createReducer #
Add a third parameter of options. Here all the reducers are created to be available as *actionCreators* mentioned earlier. They need the **Types** generated also by `createActions()`.

`src/Data/Redux/UsersRedux.js`
```js
import { createActions } from 'reduxsauce-polymer'

export const reducer = createReducer(INITIAL_STATE, {}, {
  defaultActions: {
    get: true,
    getOne: true,
    create: true,
    update: true,
    remove: true,
    reset: true,
  },
  Types,
})
```
`src/Data/Redux/index.js`
```js
/* ------------- Assemble The Reducers ------------- */
  const rootReducer = combineReducers({
    users: require('./UsersRedux').reducer,
  })
```