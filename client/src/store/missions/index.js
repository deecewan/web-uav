/* @flow */

import type { StateType, ActionType } from './types.js.flow';

const initialState: StateType = {
  current: null,
  started: false,
  missions: [],
};

function addMission(state: StateType, mission) {
  return {
    ...state,
    missions: state.missions
      .filter(m => m.id !== mission.id)
      .concat(mission)
      .sort((a, b) => {
        if (a == null || b == null) {
          return 0;
        }
        return a.startedAt < b.startedAt ? 1 : -1;
      }),
  };
}

export default function reducer(
  state: StateType = initialState,
  action: ActionType,
) {
  switch (action.type) {
    case '@missions/ADD':
      return addMission(state, action.payload);
    case '@missions/SET_CURRENT':
      if (action.payload === null && state.current != null) {
        // clearing the current mission
        return {
          ...addMission(state, state.current),
          current: null,
        };
      }
      return {
        ...state,
        current: action.payload,
      };
    case '@missions/CREATE':
      return {
        ...state,
        started: true,
      };
    case '@missions/STOP':
      return {
        ...state,
        ...(state.current != null ? addMission(state, state.current) : {}),
        started: false,
      };
    default:
      return state;
  }
}
