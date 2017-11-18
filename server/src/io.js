/* @flow */

import type { Server } from 'http';
import SocketServer from 'socket.io';

class Socket {
  io: SocketServer;
  init(server: Server) {
    const io = new SocketServer(server);
    this.io = io.of('reading');
    this.io.on('connect', (socket) => {
      console.log('connected with', socket.id);
    });
  }

  emit(name: string, content: any) { // eslint-disable-line
    this.io.emit(name, content);
  }
}

export default new Socket();
