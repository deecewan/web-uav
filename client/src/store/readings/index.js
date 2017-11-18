/* @flow */

import type { StateType, ActionType, ReadingType } from './types.js.flow';

const initialState: StateType = {
  displayAll: true,
  loading: false,
  gas: [],
  temperature: [],
  humidity: [],
};

function addReadings(state, readings: ReadingType | Array<ReadingType>): StateType {
  const split = [].concat(readings)
    .reduce((items, { type, value, timestamp }) => ({
      ...items,
      [type]: items[type].concat({ value, timestamp }),
    }), { gas: state.gas, temperature: state.temperature, humidity: state.humidity });

  return {
    ...state,
    ...split,
  };
}

export default function reducer(state: StateType = initialState, action: ActionType) {
  switch (action.type) {
    case '@readings/ADD':
      return addReadings(state, action.payload);
    case '@readings/CLEAR':
      return { ...initialState, loading: state.loading };
    case '@readings/LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case '@readings/DISPLAY_ALL':
      return {
        ...state,
        displayAll: action.payload,
      };
    default:
      (action.type: void); // eslint-disable-line no-unused-expressions
      return state;
  }
}
