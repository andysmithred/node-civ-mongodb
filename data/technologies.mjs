import express from 'express';
import joi from 'joi';
import { ObjectId } from 'mongodb';
import db from '../db/conn.mjs';

const router = express.Router();

// status
router.get('/status', (req, res) => {
    res.status(200).json({ "status": "ok" });
});

// GET all technologies
router.get('/', async (req, res) => {
    console.log('Fetching all technologies from database');

    const collection = db.collection('technologies');
    const results = await collection.find({}).toArray();

    res.status(200).json(results);
});

// GET a single technology
router.get('/:id', async (req, res) => {
    console.log(`Fetching technology with ID: ${req.params.id}`);

    const collection = db.collection('technologies');
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.findOne(query);

    if (!result) return res.status(404).send('Not found');

    res.status(200).send(result);
});

// Add a new technology to the collection
router.post('/', async (req, res) => {
    console.log('Adding new technology to database');

    const { error } = validateTechnology(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    const collection = db.collection('technologies');
    const newDocument = req.body;
    const result = await collection.insertOne(newDocument);

    res.status(201).send(result);
});

// Update the technology
router.patch('/:id', async (req, res) => {
    console.log(`Updating technology with ID: ${req.params.id}`);

    delete req.body._id;

    const { error } = validateTechnology(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    const collection = db.collection('technologies');
    const query = { _id: new ObjectId(req.params.id) };
    const update = { $set: req.body };

    const result = await collection.updateOne(query, update);

    if (result.matchedCount === 0) return res.status(404).send('The technology with the given ID was not found.');

    res.status(200).send(result);
});

// Delete an entry
router.delete('/:id', async (req, res) => {
    console.log(`Deleting technology with ID: ${req.params.id}`);

    const collection = db.collection('technologies');
    const query = { _id: new ObjectId(req.params.id) };

    const technology = await collection.findOne(query);
    if (!technology) return res.status(404).send('The technology with the given ID was not found.');

    const result = await collection.deleteOne(query);

    res.status(200).send(result);
});

// Validation function
const validateTechnology = technology => {
    const schema = joi.object({
        name: joi.string().min(1).required(),
        icon: joi.string().min(1).required(),
        cost: joi.number().min(0).required(),
        level: joi.number().min(1).required(),
        age: joi.string().min(1).required(),
        quote: joi.object({
            text: joi.string().min(1).optional(),
            author: joi.string().min(1).optional()
        }).optional(),
        requires: joi.array().items(joi.string()).required(),
        leads: joi.array().items(joi.string()).required(),
        unlocks: joi.object({
            units: joi.array().items(joi.string()).optional(),
            wonders: joi.array().items(joi.string()).optional(),
            buildings: joi.array().items(joi.string()).optional(),
            effects: joi.array().items(joi.string()).optional(),
            projects: joi.array().items(joi.string()).optional(),
            actions: joi.array().items(joi.string()).optional()
        }).optional(),
        mastery: joi.object({
            effects: joi.array().items(joi.string()).optional(),
            buildings: joi.array().items(joi.string()).optional(),
            wonders: joi.array().items(joi.string()).optional(),
            actions: joi.array().items(joi.string()).optional()
        }).optional(),
        tags: joi.array().items(joi.string()).optional()
    });

    return schema.validate(technology);
};

export default router;
