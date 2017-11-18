/* @flow */

import Router from 'koa-router';
import { stat, createReadStream, readFile } from 'fs-extra';
import { resolve, join, extname } from 'path';
import Mission from './db/models/Mission';

function imagePath(name) {
  const p = join(__dirname, '..', 'images', name);
  return resolve(p);
}

function staticPath(name) {
  const p = join(process.cwd(), 'client', 'dist', name);
  return resolve(p);
}

async function retrieveFile(name, ctx) {
  try {
    const fileStat = await stat(name);
    const type = extname(name);
    ctx.set('Content-Length', fileStat.size);
    ctx.type = type;
    ctx.body = createReadStream(name);
  } catch (e) {
    console.error('Could not load file!', name);
    throw e;
  }
}

const router = new Router();

router
  .get('/', async (ctx) => {
    const missions = await Mission.findAll({ order: [['started_at', 'DESC']] });
    const current = await Mission.currentMission();
    const forList = await Promise.all(missions.map(m => m.forList()));
    const initialState = JSON.stringify({
      missions: {
        current,
        missions: forList,
        started: current !== null,
      },
    });

    ctx.type = 'html';
    const file = await readFile(join(__dirname, '..', '..', 'client', 'dist', 'index.html'), 'utf8');
    const index = file.replace('</div>', `
    </div>
    <script>window.__INITIAL_STATE__ = ${initialState};</script>
    `);

    ctx.set('Content-Length', index.length);
    ctx.body = index;
  })
  .get('/image/:name', async ctx => retrieveFile(imagePath(ctx.params.name), ctx))
  .get('/static/:name', async ctx => retrieveFile(staticPath(ctx.params.name), ctx));

export default router;
