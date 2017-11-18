/* @flow */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type PropsType = {
  all: boolean,
  data: $ReadOnlyArray<{ timestamp: number, value: number }>,
};

export class Graph extends PureComponent {
  props: PropsType;

  render() {
    const data = [...this.props.data]
      .sort((a, b) => {
        if (a.timestamp < b.timestamp) {
          return -1; // further down the list
        }
        return 1;
      })
      .slice(this.props.all ? 0 : this.props.data.length - 20)
      .map(item => ({
        ...item,
        timestamp: new Date(item.timestamp).toLocaleTimeString(),
      }));

    return (
      <ResponsiveContainer width="100%" height="70%">
        <LineChart width={400} height={400} data={data}>
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
          <XAxis dataKey="timestamp" />
          <YAxis width={40} />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}

export default connect(({ readings: { displayAll } }) => ({ all: displayAll }))(Graph);
