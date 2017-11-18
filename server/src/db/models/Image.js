/* @flow */

import { Model, DataTypes, type Sequelize } from 'sequelize';
import type { ModelsType } from '../../type.js.flow';

export default class Image extends Model {
  static attributes = {
    path: DataTypes.STRING,
    detected: DataTypes.STRING,
  };

  static initialize(sequelize: Sequelize) {
    Image.init(Image.attributes, {
      sequelize,
      modelName: 'image',
      timestamps: true,
      paranoid: true,
      underscored: true,
    });
  }

  static associate(models: ModelsType) {
    Image.belongsTo(models.Mission);
  }

  toPublic() {
    return {
      id: this.id,
      path: this.path,
      detected: this.detected,
    };
  }
}
