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

app.post('/jobs/:jobId/pay', getProfile, async (request, response) => {
    const { Job, Profile } = request.app.get('models');
    const { jobId } = request.params;

    const profile = await Profile.findOne({ where: { id: request.profile.id }});
    const job = await Job.findOne({ where: { id: jobId, paid: false } });

    if (!profile || !job) {
        return response.status(404).json({ message: "Profile or unpaid job not found!" });
    }

    if (profile.balance < job.price) {
        response.status(403).json({ message: "There is not enough balance to pay job!" });
    }

    profile.balance -= job.price;
    job.paid = true;

    profile.save();
    job.save();

    response.json({ profile, job });
});

app.post('/balances/deposit/:userId', async (request, response) => {
    const { Profile, Job, Contract } = request.app.get('models');
    const { userId } = request.params;
    const { amount } = request.body;

    const profile = await Profile.findOne({ where: { id: userId }});

    if (!profile) {
        return response.status(404).json({ message: "Profile not found!" });
    }

    const [{ price }] = await Job.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('price')), 'price'],
        ],
        where: { paid: false },
        include: {
            model: Contract,
            where: {
                [Op.or]: [
                    { clientId:  userId }
                ]
            }
        }
      });
    
    const totalPrinceToPay = price || 0;
    if (totalPrinceToPay * 1.25 < amount) {
        return response.status(403).json({ message: "The deposit is higher than 25% of total jobs to pay!" });
    }

    profile.balance += amount;
    profile.save();

    response.json({ profile });
});

module.exports = app;
