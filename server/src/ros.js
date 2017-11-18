/* @flow */

import ros, { type Subscriber } from 'rosnodejs';
import { join } from 'path';
import { writeFile } from 'fs-extra';
import type { Socket, Namespace } from 'socket.io';
import type { DataType, RosType } from './type.js.flow';
import Reading from './db/models/Reading';
import Image from './db/models/Image';

const msgs = ros.require('std_msgs').msg;
const sensorMsgs = ros.require('sensor_msgs').msg;

function generateTarget(name: RosType, type, endpoint: string) {
  return ({ name, type, endpoint });
}

const IMAGE_PATH = join(__dirname, '..', 'images');
let currentlyDetected = '';

export class RosHandler {
  initialised: boolean;
  io: Namespace;
  missionId: number;
  subscriptions: Array<Subscriber>;

  static targets = [
    /* production targets */
    // generateTarget('air_quality', msgs.Float64MultiArray, '/air_quality_topic'),
    // generateTarget('image', sensorMsgs.CompressedImage, '/processed_image/compressed'),
    // generateTarget('detected', msgs.String, '/detected_target'),
    /* development targets */
    generateTarget('air_quality', msgs.Float64MultiArray, '/emulator/air_quality'),
    generateTarget('image', sensorMsgs.CompressedImage, '/camera/image_raw/compressed_throttle'),
    generateTarget('detected', msgs.String, '/emulator/detected_target'),
  ];

  constructor() {
    this.subscriptions = [];
    this.initialised = false;
  }

  async init() {
    if (this.initialised) { return; }
    await ros.initNode('/nothing');
    this.initialised = true;
  }

  initSocket(io: Socket) {
    this.io = io;
  }

  initMission(id: number) {
    this.missionId = id;
  }

  async notify(name: RosType, msg: { data: DataType }) {
    if (name === 'image') {
      // store the image in the file system
      const fileName = `${Date.now()}.jpg`;
      await writeFile(join(IMAGE_PATH, fileName), msg.data);
      // save the path in the database
      const image = new Image({ path: fileName, detected: currentlyDetected });
      await image.save();
      image.setMission(this.missionId);
      // notify the socket
      this.io.emit('image', image.toPublic());
    } else if (name === 'air_quality') {
      const [humidity, temperature, gas] = msg.data;
      const hReading = new Reading({ type: 'humidity', value: humidity });
      const tReading = new Reading({ type: 'temperature', value: temperature });
      const gReading = new Reading({ type: 'gas', value: gas });
      await Promise.all([hReading.save(), tReading.save(), gReading.save()]);
      hReading.setMission(this.missionId);
      tReading.setMission(this.missionId);
      gReading.setMission(this.missionId);
      this.io.emit('humidity', hReading.toPublic());
      this.io.emit('gas', gReading.toPublic());
      this.io.emit('temperature', tReading.toPublic());
    } else if (name === 'detected') {
      currentlyDetected = msg.data;
      this.io.emit('detected', msg.data);
    }
  }

  start() {
    console.log('Starting ROS');
    this.subscriptions = RosHandler.targets.map(({ name, type, endpoint }) =>
      ros.nh.subscribe(endpoint, type, (msg) => {
        this.notify(name, msg);
      }));
  }

  async stop() {
    await Promise.all(this.subscriptions.map(sub => sub.shutdown()));
    this.subscriptions = [];
  }
}

export default new RosHandler();
