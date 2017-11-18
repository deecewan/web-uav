/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import {
  Header,
  Button,
  Card,
  Image,
} from 'semantic-ui-react';
import moment from 'moment';
import { createMission, setCurrent } from '../store/missions/actions';
import type { MissionType } from '../store/missions/types.js.flow';
import { loadImages } from '../store/images/actions';

type PropsType = {
  createMission: typeof createMission,
  loadImages: typeof loadImages,
  missions: Array<MissionType>,
  setCurrent: typeof setCurrent,
  started: boolean,
};

function missionImage(coverImage) {
  if (coverImage == null) {
    return null;
  }
  return <Image src={`/image/${coverImage.path}`} />;
}

function missionTime(started, finished) {
  if (finished == null) {
    return `Started ${moment(started).fromNow()}`;
  }

  return moment.duration(finished - started).humanize();
}

export function Missions(props: PropsType) {
  const set = (mission) => {
    props.setCurrent(mission);
    props.loadImages(mission.id);
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Header as="h1">Missions</Header>

      <div>
        <Button
          onClick={() => props.createMission()}
          inverted
          color="green"
        >
          {props.started ? 'Stop Mission' : 'Start Mission'}
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: 20,
        }}
      >
        <Card.Group>
          {props.missions.map(mission => (
            <Card key={mission.id}>
              {missionImage(mission.coverImage)}
              <Card.Content>
                <Card.Header>Mission #{mission.id}</Card.Header>
                <Card.Meta>
                  Started {moment(mission.startedAt).format('YY-MM-DD HH:mm:ss')}
                </Card.Meta>
                <Card.Description>
                  Fly Time: {missionTime(mission.startedAt, mission.completedAt)}
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <a onClick={() => set(mission)}>
                  Open Mission
                </a>
              </Card.Content>
            </Card>
          ))}
        </Card.Group>
      </div>
    </div>
  );
}

export default connect(
  ({ missions: { missions, started } }) => ({ missions, started }),
  { createMission, setCurrent, loadImages },
)(Missions);
