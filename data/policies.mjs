import express from 'express';
import joi from 'joi';
import { ObjectId } from 'mongodb';
import db from '../db/conn.mjs';

const router = express.Router();

// status
router.get('/status', (req, res) => {
    res.status(200).json({ "status": "ok" });
});

// GET all policies
router.get('/', async (req, res) => {
    console.log('Fetching all policies from database');

    const collection = db.collection('policies');
    const results = await collection.find({}).toArray();

    res.status(200).json(results);
});

// GET a single policy
router.get('/:id', async (req, res) => {
    console.log(`Fetching policy with ID: ${req.params.id}`);

    const collection = db.collection('policies');
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.findOne(query);

    if (!result) return res.status(404).send('Not found');

    res.status(200).send(result);
});

// Add a new policy to the collection
router.post('/', async (req, res) => {
    console.log('Adding new policy to database');

    const { error } = validatePolicy(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const collection = db.collection('policies');
    const newDocument = req.body;
    const result = await collection.insertOne(newDocument);

    res.status(201).send(result);
});

// Update the policy
router.put('/:id', async (req, res) => {
    console.log(`Updating policy with ID: ${req.params.id}`);

    const { error } = validatePolicy(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const collection = db.collection('policies');
    const query = { _id: new ObjectId(req.params.id) };
    const update = { $set: req.body };

    const result = await collection.updateOne(query, update);

    if (result.matchedCount === 0) return res.status(404).send('The policy with the given ID was not found.');

    res.status(200).send(result);
});

// Delete an entry
router.delete('/:id', async (req, res) => {
    console.log(`Deleting policy with ID: ${req.params.id}`);

    const collection = db.collection('policies');
    const query = { _id: new ObjectId(req.params.id) };

    const policy = await collection.findOne(query);
    if (!policy) return res.status(404).send('The policy with the given ID was not found.');

    const result = await collection.deleteOne(query);

    res.status(200).send(result);
});

// Validation function
const validatePolicy = policy => {
    const schema = joi.object({
        name: joi.string().min(1).required(),
        age: joi.string().min(1).required(),
        requires: joi.string().min(1).optional(),
        effects: joi.array().items(joi.string()).required(),
        tradition: joi.boolean().required(),
        civilization: joi.string().min(1).optional()
    });

    return schema.validate(policy);
};

export default router;
