/* @flow */

import Sequelize from 'sequelize';
import chalk from 'chalk';
import Image from './models/Image';
import Mission from './models/Mission';
import Reading from './models/Reading';

const sequelize = new Sequelize('postgres://uav:uav@db/uav');

let booted = false;

export function boot() {
  if (booted) { return Promise.resolve(); }
  return sequelize
    .authenticate()
    .then(() => {
      console.log(
        chalk.green('Success!'),
        'Authenticated with database.',
        'Database has been synced',
      );

      Reading.initialize(sequelize);
      Mission.initialize(sequelize);
      Image.initialize(sequelize);

      console.log(chalk.green('Models initialized'));

      const models = {
        Image,
        Mission,
        Reading,
      };

      Reading.associate(models);
      Mission.associate(models);
      Image.associate(models);

      console.log(chalk.green('Models associated.'));
    })
    .then(() => sequelize.sync())
    .then(() => {
      console.log(
        chalk.green('Database Synced'),
      );
      booted = true;
      return sequelize;
    })
    .catch((err: Error) => {
      const errorStack = err.stack.split('\n');
      const message =
        chalk.bgYellow.red('Fatal: Could not connect to database.\n\n') +
        chalk.red(`${errorStack[0]}\n`) + chalk.gray(errorStack.slice(1).join('\n'));

      console.log(message);
      process.exit(1);
    });
}

export default sequelize;
