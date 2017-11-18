/* @flow */

import { Model, DataTypes, type Sequelize } from 'sequelize';
import type { ModelsType } from '../../type.js.flow';


export default class Reading extends Model {
  static attributes = {
    type: {
      type: DataTypes.STRING,
      validate: { isIn: [['temperature', 'gas', 'humidity']] },
      allowNull: false,
    },
    value: DataTypes.STRING,
  };

  static initialize(sequelize: Sequelize) {
    Reading.init(Reading.attributes, {
      sequelize,
      modelName: 'reading',
      timestamps: true,
      paranoid: true,
      underscored: true,
    });
  }

  static associate(models: ModelsType) {
    Reading.belongsTo(models.Mission);
  }

  toPublic() {
    return {
      id: this.id,
      type: this.type,
      value: +this.value,
      timestamp: +this.created_at,
    };
  }
}
