/* @flow */

import type { Dispatch } from 'redux';
import axios from 'axios';
import type {
  ReadingType,
  AddReadingActionType,
  ClearReadingActionType,
  ActionType,
  LoadingActionType,
  UpdateAllActionType,
} from './types.js.flow';

type DispatchType = Dispatch<ActionType>;


export function addReading(reading: ReadingType | Array<ReadingType>): AddReadingActionType {
  return {
    type: '@readings/ADD',
    payload: reading,
  };
}

export function clearReadings(): ClearReadingActionType {
  return { type: '@readings/CLEAR' };
}

export function loading(): LoadingActionType {
  return {
    type: '@readings/LOADING',
    payload: true,
  };
}

export function complete(): LoadingActionType {
  return {
    type: '@readings/LOADING',
    payload: false,
  };
}

export function showAll(): UpdateAllActionType {
  return {
    type: '@readings/DISPLAY_ALL',
    payload: true,
  };
}

export function showLimited(): UpdateAllActionType {
  return {
    type: '@readings/DISPLAY_ALL',
    payload: false,
  };
}

export function loadReadings(missionId: number) {
  return (dispatch: DispatchType) => {
    dispatch(loading());
    axios.get(`/missions/${missionId}/readings`)
      .then(({ data }) => {
        const readings = data.readings.map(reading => ({
          type: reading.type,
          timestamp: +reading.timestamp,
          value: +reading.value,
        }));

        dispatch(addReading(readings));
      })
      .then(() => {
        dispatch(complete());
      });
  };
}
