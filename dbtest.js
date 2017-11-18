/* @flow */

const db = require('./server/dist/db').default;
const Image = require('./server/dist/db/models/Image').default;
const Reading = require('./server/dist/db/models/Reading').default;
const Mission = require('./server/dist/db/models/Mission').default;

db.sync().then(() => {
  const m = new Mission();

  const r = new Reading({ type: 'gas', value: 10 });
  const i = new Image({ path: '12345.jpg' });

  r.save().then(() => {
    r.setMission(m);
  });

  i.save().then(() => {
    m.addImage(i);
  });

  Mission.findById(3).then((mission) => {
    mission.getImages().then((images) => {
      console.log(images);
    });

    mission.getReadings().then((readings) => {
      console.log(readings);
    });
  });
});

