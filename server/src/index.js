/* @flow */

import { createServer } from 'http';
import Koa from 'koa';
import logger from 'koa-logger';
import webpack from 'koa-webpack';
import { boot } from './db';
import api from './api';
import staticRouter from './static';
import ros from './ros';
import socket from './io';

const app = new Koa();

app.use(logger());

if (process.env.NODE_ENV === 'development') {
  app.use(webpack());
}

app.use(async (ctx, next) => {
  await ros.init();
  return next();
});

app.use(async (ctx, next) => {
  const db = await boot();
  ctx.db = db;
  ctx.io = socket;
  return next();
});

/* Load routers */
app.use(staticRouter.routes());
app.use(staticRouter.allowedMethods());
app.use(api.routes());
app.use(api.allowedMethods());

const server = createServer(app.callback());
socket.init(server);
ros.initSocket(socket);

server.listen({ port: 3000, host: '0.0.0.0' }, () => {
  console.log('Listening on port 3000');
});
