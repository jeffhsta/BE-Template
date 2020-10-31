const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const { getProfile } = require('./middleware/getProfile');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (request, response) => {
    const { Contract } = request.app.get('models');
    const { id } = request.params;
    const contract = await Contract.findOne({ where: { id, contractorId: request.profile.id } });
    if (!contract) return response.status(404).end();
    response.json(contract);
});

module.exports = app;
