/* @flow */

import axios from 'axios';
import type { Dispatch } from 'redux';
import type {
  ActionType,
  AddActionType,
  ClearActionType,
  ImageType,
  LoadingActionType,
} from './types.js.flow';

type DispatchType = Dispatch<ActionType>;

export function addImage(image: ImageType | Array<ImageType>): AddActionType {
  return {
    type: '@images/ADD',
    payload: image,
  };
}

function loading(): LoadingActionType {
  return {
    type: '@images/LOADING',
    payload: true,
  };
}

function complete(): LoadingActionType {
  return {
    type: '@images/LOADING',
    payload: false,
  };
}

export function clearImages(): ClearActionType {
  return {
    type: '@images/CLEAR',
  };
}

export function loadImages(missionId: number) {
  return (dispatch: DispatchType) => {
    dispatch(loading());
    axios.get(`/missions/${missionId}/images`)
      .then(({ data }) => {
        const images = data.images.map(i => ({
          id: i.id,
          path: i.path,
          detected: i.detected,
        }));

        dispatch(addImage(images));
      })
      .then(() => {
        dispatch(complete());
      });
  };
}
