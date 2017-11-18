/* @flow */

import {
  createStore,
  combineReducers,
  compose,
  applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';
import images from './images';
import missions from './missions';
import readings from './readings';

const reducer = combineReducers({
  images,
  missions,
  readings,
});

const DEV = process.env.NODE_ENV === 'development';

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = (DEV && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(
  reducer,
  window.__INITIAL_STATE__ || {}, // eslint-disable-line no-underscore-dangle
  composeEnhancers(
    applyMiddleware(thunk),
  ),
);

export default store;
