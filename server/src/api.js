/* @flow */

import Router from 'koa-router';
import Mission from './db/models/Mission';
import ros from './ros';

const router = new Router();

async function body(m) {
  return {
    mission: await m.toPublic(),
  };
}

router
  // this goes at the top, because the validator underneath will push us back
  // here if there is a mission in progress
  .get('/missions/:id', async (ctx) => {
    // view the current mission, or look back over past missions
    const id = ctx.params.id;
    const mission = await Mission.findById(id);
    if (!mission) {
      ctx.status = 404;
      return;
    }
    ctx.status = 200;
    ctx.body = await body(mission);
  })
  .get('/missions/:id/images', async (ctx) => {
    const id = ctx.params.id;
    const mission = await Mission.findById(id);
    if (!mission) {
      ctx.status = 404;
      return;
    }
    const images = await mission.getImages();
    ctx.status = 200;
    ctx.body = {
      images: images.map(i => i.toPublic()),
    };
  })
  .get('/missions/:id/readings', async (ctx) => {
    const id = ctx.params.id;
    const mission = await Mission.findById(id);
    if (!mission) {
      ctx.status = 404;
      return;
    }
    const readings = await mission.getReadings();
    ctx.status = 200;
    ctx.body = {
      readings: readings.map(i => i.toPublic()),
    };
  })
  .put('/missions/:id/complete', async (ctx) => {
    const m = await Mission.find({ where: { id: ctx.params.id } });
    if (!m) {
      ctx.status = 404;
      return;
    }
    await m.update({ completed_at: Date.now() });
    ros.stop(); // stop storing data/pushing it over the socket
    const forList = { mission: await m.forList() };
    ctx.io.emit('completed', forList);
    ctx.body = forList;
  })
  .use(async (ctx, next) => {
    const current = await Mission.currentMission();
    if (current) {
      ctx.status = 302;
      ctx.body = body(current);
      return null;
    }
    return next();
  })
  .get('/missions', async (ctx) => {
    try {
      const missions: Array<Mission> = await Mission.findAll();
      ctx.status = 200;
      ctx.body = {
        missions: await Promise.all(missions.map(m => m.forList())),
      };
    } catch (e) {
      console.error('error getting missions', e);
      console.error(e.stack);
      ctx.status = 500;
    }
  })
  .post('/missions/new', async (ctx) => {
    // start a new mission
    const m = new Mission();
    await m.save();
    console.log('saved mission with ID', m.id);
    ros.initMission(m.id);
    ros.start();
    ctx.status = 201;
    const mission = await body(m);
    ctx.io.emit('new', mission);
    ctx.body = mission;
  });

export default router;
