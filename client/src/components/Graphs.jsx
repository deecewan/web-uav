/* @flow */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Menu, Button } from 'semantic-ui-react';
import { showAll, showLimited } from '../store/readings/actions';
import Graph from './Graph';

type PropsType = {
  all: boolean,
  children: Array<Graph>,
  showAll: typeof showAll,
  showLimited: typeof showLimited,
};

type StateType = { selected: number };

export class Graphs extends PureComponent {
  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);

    this.state = { selected: 0 };
  }

  getButtons() {
    return this.props.children.map(
      (child, i) => (
        <Menu.Item
          key={child.props.name}
          active={this.state.selected === i}
          name={child.props.name}
          onClick={() => {
            this.setState({ selected: i });
          }}
        />
      ));
  }

  getGraph() {
    return this.props.children[this.state.selected];
  }

  render() {
    return (
      <div style={{ width: '100%' }}>
        <h2 style={{ textAlign: 'center' }}>Graphs</h2>
        <Menu tabular>
          {this.getButtons()}
        </Menu>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <Button.Group>
            <Button
              onClick={this.props.showAll}
              positive={this.props.all}
            >
              All
            </Button>
            <Button.Or />
            <Button
              onClick={this.props.showLimited}
              positive={!this.props.all}
            >
              Last 20
            </Button>
          </Button.Group>
        </div>
        {this.getGraph()}
      </div>
    );
  }
}

export default connect(
  ({ readings: { displayAll } }) => ({ all: displayAll }),
  { showAll, showLimited },
)(Graphs);
