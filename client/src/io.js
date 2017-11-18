/* @flow */

import io from 'socket.io-client';
import store from './store';
import { setCurrent, stopMission, createAction } from './store/missions/actions';
import { addImage, clearImages } from './store/images/actions';
import { addReading, clearReadings } from './store/readings/actions';

const socket = io('/reading');

socket.on('connect', () => {
  console.log('connected', socket);
});

socket
  .on('completed', (data) => {
    const { mission } = data;

    store.dispatch(setCurrent(mission));
    store.dispatch(stopMission());
  })
  .on('new', (data) => {
    const mission = data.mission;
    const startedAt = mission.startedAt;
    const id = mission.id;
    store.dispatch(clearImages());
    store.dispatch(clearReadings());
    store.dispatch(setCurrent({
      id,
      startedAt,
      coverImage: null,
      completedAt: null,
    }));
    store.dispatch(createAction());
  })
  .on('image', (data) => {
    store.dispatch(addImage({ path: data.path, id: data.id, detected: data.detected }));
  })
  .on('gas', (data) => {
    store.dispatch(addReading(data));
  })
  .on('temperature', (data) => {
    store.dispatch(addReading(data));
  })
  .on('humidity', (data) => {
    store.dispatch(addReading(data));
  });
