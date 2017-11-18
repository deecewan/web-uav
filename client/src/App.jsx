/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import Missions from './views/Missions';
import Mission from './views/Mission';

type PropsType = {
  showMission: boolean,
};

export function App(props: PropsType) {
  return (<div>
    {props.showMission ? <Mission /> : <Missions />}
  </div>);
}

export default connect(
  state => ({ showMission: state.missions.current !== null }),
)(App);
