/* @flow */

import { Model, DataTypes, type Sequelize } from 'sequelize';
import type { ModelsType } from '../../type.js.flow';

export default class Mission extends Model {
  static attributes = {
    started_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    completed_at: DataTypes.DATE,
  };

  static initialize(sequelize: Sequelize) {
    Mission.init(Mission.attributes, {
      sequelize,
      modelName: 'mission',
      timestamps: true,
      paranoid: true,
      underscored: true,
    });
  }

  static associate(models: ModelsType) {
    Mission.hasMany(models.Reading);
    Mission.hasMany(models.Image);
  }

  static getPublic(p: Promise<Model>) {
    return p.then(x => x.map(y => y.toPublic()));
  }

  toCamelCase() {
    return {
      id: this.id,
      startedAt: Date.parse(this.started_at),
      completedAt: Date.parse(this.completed_at),
    };
  }

  async forList() {
    // get the most recent image for this mission
    const image = await this.getImages({ limit: 1, order: [['created_at', 'DESC']] });
    return {
      ...this.toCamelCase(),
      coverImage: image.length === 0 ? null : image[0],
    };
  }

  async toPublic() {
    const [readings, images] = await Promise.all([
      Mission.getPublic(this.getReadings()),
      Mission.getPublic(this.getImages()),
    ]);

    return {
      images,
      readings,
      ...this.toCamelCase(),
    };
  }

  static async currentMission() {
    const m = await Mission.find({ where: { completed_at: { $eq: null } } });
    if (!m) {
      return null;
    }
    return m.forList();
  }
}
