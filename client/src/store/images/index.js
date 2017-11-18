/* @flow */

import type { StateType, ActionType } from './types.js.flow';

const initialState: StateType = {
  loading: false,
  items: [],
};

function addToItems(state, item) {
  return state.items
    .concat(item)
    .sort((a, b) => (a.path < b.path ? 1 : -1));
}

export default function reducer(state: StateType = initialState, action: ActionType) {
  switch (action.type) {
    case '@images/ADD':
      return {
        ...state,
        items: addToItems(state, action.payload),
      };
    case '@images/CLEAR':
      return { items: [], loading: false };
    case '@images/LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
}
