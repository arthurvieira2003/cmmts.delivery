const Sequelize = require('sequelize');

const sequelize = new Sequelize('cmmts-delivery', 'commits', 'mccts@24', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: false,
});

module.exports = sequelize;

const Modelo = sequelize.define('tabela', {
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  idade: {
    type: Sequelize.INTEGER,
    defaultValue: 18,
  },
}, {
  timestamps: true,
});

Modelo.sync({ force: true }).then(() => {
  console.log('Tabela criada com sucesso!');
}).catch((error) => {
  console.error('Erro ao criar tabela:', error);
});
