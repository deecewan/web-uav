/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';
import './io';
import store from './store';
import App from './App';

const render = (Component) => {
  ReactDOM.render(
    <Provider store={store}>
      <AppContainer>
        <Component />
      </AppContainer>
    </Provider>,
    document.getElementById('app'),
  );
};

render(App);

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require
  module.hot.accept('./App', () => { render(require('./App').default); });
}
