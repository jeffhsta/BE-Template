const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const { getProfile } = require('./middleware/getProfile');
const { Op } = require("sequelize");

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

app.get('/contracts', getProfile, async (request, response) => {
    const { Contract } = request.app.get('models');
    const contracts = await Contract.findAll({ where: { contractorId: request.profile.id } });
    response.json(contracts);
});

app.get('/jobs/unpaid', getProfile, async (request, response) => {
    const { Job, Contract } = request.app.get('models');
    const jobs = await Job.findAll({
        where: { paid: false },
        include: {
            model: Contract,
            where: {
                [Op.or]: [
                    { contractorId: request.profile.id },
                    { clientId:  request.profile.id }
                ]
            }
        }
    });

    response.json(jobs);
});

module.exports = app;
