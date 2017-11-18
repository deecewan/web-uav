/* @flow */

import axios from 'axios';
import type { Dispatch } from 'redux';
import type {
  CreateActionType,
  AddActionType,
  MissionType,
  ActionType,
  SetCurrentActionType,
  StopActionType,
  StateType,
} from './types.js.flow';

type DispatchType = Dispatch<ActionType>;

export function addMission(mission: MissionType): AddActionType {
  return {
    type: '@missions/ADD',
    payload: mission,
  };
}

export function setCurrent(mission: ?MissionType): SetCurrentActionType {
  return {
    type: '@missions/SET_CURRENT',
    payload: mission,
  };
}

export function clearCurrent() {
  return setCurrent(null);
}

export function stopMission(): StopActionType {
  return {
    type: '@missions/STOP',
  };
}

export function remoteMissionStop() {
  return (dispatch: DispatchType, getState: () => ({ missions: StateType })) => {
    const state = getState().missions;
    const current = state.current;
    if (!current) { return null; }
    return axios.put(`/missions/${current.id}/complete`);
  };
}

export function createAction(): CreateActionType {
  return {
    type: '@missions/CREATE',
  };
}

export function createMission() {
  return () => {
    axios.post('/missions/new');
  };
}

