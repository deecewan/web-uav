/* @flow */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { List } from 'react-virtualized';
import {
  Button,
  Loader,
  Image,
  Header,
  Card,
} from 'semantic-ui-react';
import Graphs from '../components/Graphs';
import Graph from '../components/Graph';
import type { MissionType } from '../store/missions/types.js.flow';
import type { StateType as ImageStateType } from '../store/images/types.js.flow';
import type { StateType as ReadingsStateType } from '../store/readings/types.js.flow';
import { clearImages, loadImages } from '../store/images/actions';
import { remoteMissionStop, clearCurrent } from '../store/missions/actions';
import { loadReadings } from '../store/readings/actions';

type PropsType = {
  clearCurrent: typeof clearCurrent,
  clearImages: typeof clearImages,
  images: ImageStateType,
  loadImages: typeof loadImages,
  loadReadings: typeof loadReadings,
  loading: boolean,
  mission: MissionType,
  readings: ReadingsStateType,
  remoteMissionStop: typeof remoteMissionStop,
  started: boolean,
};

type StateType = {
  selectedImage: number,
};

function PastImage(props: {
  detected: string,
  isScrolling: boolean,
  onClick: () => void,
  path: string,
  style: Object, // eslint-disable-line
}) {
  const time = moment(+props.path.replace('.jpg', ''));
  const header = !['A', 'B'].includes(props.detected) ?
    'No Target Detected' :
    `Target ${props.detected} Detected`;
  const content = props.isScrolling ? 'Loading...' :
    [
      <Image key="image" src={`/image/${props.path}`} />,
      <Card.Content key="card">
        <Card.Header>{header}</Card.Header>
        <Card.Meta>{time.format('YY-MM-DD HH:mm:ss.SSS')}</Card.Meta>
      </Card.Content>,
    ];
  return (
    <div style={{ ...props.style, padding: 10, height: 240 }}>
      <Card onClick={props.onClick}>
        {content}
      </Card>
    </div>
  );
}

export class Mission extends Component {
  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);
    this.state = {
      selectedImage: 0, // always 0 for live stream
    };
  }

  componentDidMount() {
    if (this.props.images.items.length === 0 && !this.props.images.loading) {
      this.props.loadImages(this.props.mission.id);
    }

    if (!this.props.readings.loading) {
      this.props.loadReadings(this.props.mission.id);
    }
  }

  stopButton(type: boolean) {
    if (type) {
      this.props.remoteMissionStop();
    } else {
      this.props.clearCurrent();
      this.props.clearImages();
    }
  }

  buttonTitle() {
    if (this.props.started) {
      return 'Stop Mission';
    }
    return 'Back to Missions';
  }

  getHeader() {
    const status = this.props.started ? 'Started' : 'Stopped';
    return (
      <div
        style={{
          minHeight: '5vh',
          maxHeight: '5vh',
          padding: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Header as="h3">Mission #{this.props.mission.id}: {status}</Header>

        <Button
          color="red"
          inverted
          onClick={() => this.stopButton(this.props.started)}
        >
          {this.buttonTitle()}
        </Button>
      </div>
    );
  }

  pastImageClick(index) {
    return () => {
      if (this.props.started) {
        return;
      }
      this.setState({ selectedImage: index });
    };
  }

  generateImage({ index, key, style }) {
    if (this.props.images.items.length < 1) { return null; }
    const modifier = this.props.started ? 1 : 0;
    const image = this.props.images.items[index + modifier];
    return (
      <PastImage
        key={key}
        detected={image.detected}
        onClick={this.pastImageClick(index + modifier)}
        path={image.path}
        style={style}
      />
    );
  }

  getPastImages() {
    const height = window.innerHeight * 0.95;
    const width = window.innerWidth * 0.14;

    const modifier = this.props.started ? -1 : 0;

    const list = this.props.images.items.length > 0 ? (
      <List
        rowHeight={250}
        rowCount={this.props.images.items.length + modifier}
        height={height}
        rowRenderer={p => this.generateImage(p)}
        width={width}
      />) :
      null;

    return (
      <div
        id="past-images"
        style={{
          display: 'flex',
          flexGrow: 2,
          flexDirection: 'column',
          height: '95vh',
          overflow: 'auto',
          maxWidth: '14%',
          alignItems: 'center',
        }}
      >
        <Card.Group style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {list}
        </Card.Group>
      </div>
    );
  }

  getCurrentImage() {
    const currentImage = this.props.images.items[this.state.selectedImage];
    return (
      <div
        id="current-image"
        style={{
          maxWidth: '50%',
          marginLeft: 10,
          marginRight: 10,
          height: '50%',
        }}
      >
        {
          this.props.images.loading || currentImage == null
            ? <Loader />
            : <Image src={`/image/${currentImage.path}`} />
        }
      </div>
    );
  }

  getGraphs() {
    return (
      <div
        style={{
          display: 'flex',
          width: '50%',
          height: '50%',
        }}
      >
        <Graphs>
          <Graph name="gas" data={this.props.readings.gas} />
          <Graph name="temperature" data={this.props.readings.temperature} />
          <Graph name="humidity" data={this.props.readings.humidity} />
        </Graphs>
      </div>
    );
  }

  getDetected() {
    const image = this.props.images.items[this.state.selectedImage];
    if (image == null || !['A', 'B'].includes(image.detected)) {
      return (
        <Card
          header="No Target Detected"
        />
      );
    }
    return (
      <Card
        header={`Detected Target ${image.detected}`}
      />
    );
  }

  getBottom() {
    const gasAverage = (this.props.readings.gas
      .reduce((a, c) => a + c.value, 0) / this.props.readings.gas.length)
      .toFixed(2);
    const tempAverage = (this.props.readings.temperature
      .reduce((a, c) => a + c.value, 0) / this.props.readings.temperature.length)
      .toFixed(2);
    const humidityAverage = (this.props.readings.humidity
      .reduce((a, c) => a + c.value, 0) / this.props.readings.humidity.length)
      .toFixed(2);

    const cards = Object.entries({
      Gas: gasAverage,
      Temperature: tempAverage,
      Humidity: humidityAverage,
    }).map(([name, value]) => (
      <Card
        key={name}
        header={`Average ${name}`}
        description={Number.isNaN(value) ? 'No Value Yet' : value}
      />
    ));
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '30%',
        }}
      >
        <Card.Group>
          {this.getDetected()}
          {cards}
        </Card.Group>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.getHeader()}

        <div id="main-content" style={{ display: 'flex' }}>
          {this.getPastImages()}
          <div style={{ width: '80%' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
              {this.getCurrentImage()}
              {this.getGraphs()}
            </div>
            {this.getBottom()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ missions, images, readings }) => ({
    images,
    readings,
    mission: missions.current,
    started: missions.started,
  }),
  { remoteMissionStop, clearCurrent, clearImages, loadImages, loadReadings },
)(Mission);
