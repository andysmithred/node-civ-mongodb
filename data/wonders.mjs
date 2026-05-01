import express from 'express';
import joi from 'joi';
import { ObjectId } from 'mongodb';
import db from '../db/conn.mjs';

const router = express.Router();

// status
router.get('/status', (req, res) => {
    res.status(200).json({ "status": "ok" });
});

// GET all wonders
router.get('/', async (req, res) => {
    console.log('Fetching all wonders from database');

    const collection = db.collection('wonders');
    const results = await collection.find({}).toArray();

    res.status(200).json(results);
});

// GET a single wonder
router.get('/:id', async (req, res) => {
    console.log(`Fetching wonder with ID: ${req.params.id}`);

    const collection = db.collection('wonders');
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.findOne(query);

    if (!result) return res.status(404).send('Not found');

    res.status(200).send(result);
});

// Add a new wonder to the collection
router.post('/', async (req, res) => {
    console.log('Adding new wonder to database');

    const { error } = validateWonder(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    const collection = db.collection('wonders');
    const newDocument = req.body;
    const result = await collection.insertOne(newDocument);

        res.status(201).send(result);
    });

// Update the wonder
router.patch('/:id', async (req, res) => {
    console.log(`Updating wonder with ID: ${req.params.id}`);

    delete req.body._id;

    const { error } = validateWonder(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    const collection = db.collection('wonders');
    const query = { _id: new ObjectId(req.params.id) };
    const update = { $set: req.body };

    const result = await collection.updateOne(query, update);

    if (result.matchedCount === 0) return res.status(404).send('The wonder with the given ID was not found.');

    res.status(200).send(result);
});

// Delete an entry
router.delete('/:id', async (req, res) => {
    console.log(`Deleting wonder with ID: ${req.params.id}`);

    const collection = db.collection('wonders');
    const query = { _id: new ObjectId(req.params.id) };

    const wonder = await collection.findOne(query);
    if (!wonder) return res.status(404).send('The wonder with the given ID was not found.');

    const result = await collection.deleteOne(query);

    res.status(200).send(result);
});

// Validation function
const validateWonder = wonder => {
    const schema = joi.object({
        name: joi.string().min(1).required(),
        icon: joi.string().min(1).required(),
        cost: joi.number().min(0).required(),
        age: joi.string().min(1).required(),
        associated: joi.string().empty('').optional(),
        requires: joi.array().items(joi.string()).optional(),
        effects: joi.array().items(joi.string()).required(),
        placement: joi.string().empty('').optional(),
        quote: joi.object({
            text: joi.string().min(1).required(),
            author: joi.string().min(1).required()
        }).optional(),
        tags: joi.array().items(joi.string()).optional()
    });

    return schema.validate(wonder);
};

export default router;
