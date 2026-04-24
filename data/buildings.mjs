import express from 'express';
import joi from 'joi';
import { ObjectId } from 'mongodb';
import db from '../db/conn.mjs';

const router = express.Router();

// status
router.get('/status', (req, res) => {
    res.status(200).json({ "status": "ok" });
});

// GET all buildings
router.get('/', async (req, res) => {
    console.log('Fetching all buildings from database');

    const collection = db.collection('buildings');
    const results = await collection.find({}).toArray();

    res.status(200).json(results);
});

// GET a single building
router.get('/:id', async (req, res) => {
    console.log(`Fetching building with ID: ${req.params.id}`);

    const collection = db.collection('buildings');
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.findOne(query);

    if (!result) return res.status(404).send('Not found');

    res.status(200).send(result);
});

// Add a new building to the collection
router.post('/', async (req, res) => {
    console.log('Adding new building to database');

    const { error } = validateBuilding(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    const collection = db.collection('buildings');
    const newDocument = req.body;
    const result = await collection.insertOne(newDocument);

    res.status(201).send(result);
});

// Update the building
router.patch('/:id', async (req, res) => {
    console.log(`Updating building with ID: ${req.params.id}`);

    delete req.body._id;

    const { error } = validateBuilding(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    const collection = db.collection('buildings');
    const query = { _id: new ObjectId(req.params.id) };
    const update = { $set: req.body };

    const result = await collection.updateOne(query, update);

    if (result.matchedCount === 0) return res.status(404).send('The building with the given ID was not found.');

    res.status(200).send(result);
});

// Delete an entry
router.delete('/:id', async (req, res) => {
    console.log(`Deleting building with ID: ${req.params.id}`);

    const collection = db.collection('buildings');
    const query = { _id: new ObjectId(req.params.id) };

    const building = await collection.findOne(query);
    if (!building) return res.status(404).send('The building with the given ID was not found.');

    const result = await collection.deleteOne(query);

    res.status(200).send(result);
});

// Validation function
const validateBuilding = building => {
    const schema = joi.object({
        name: joi.string().min(1).required(),
        icon: joi.string().min(1).required(),
        unlocked: joi.string().min(1).optional(),
        cost: joi.object({
            production: joi.number().min(0).required(),
            gold: joi.number().min(0).required()
        }).required(),
        maintenance: joi.object({
            gold: joi.number().min(0).required(),
            happiness: joi.number().min(0).required()
        }).required(),
        age: joi.string().min(1).required(),
        yields: joi.object({
            base: joi.array().items(joi.string()).required(),
            adjacency: joi.array().items(joi.string()).optional(),
            effects: joi.array().items(joi.string()).required()
        }).optional(),
        type: joi.string().min(1).optional(),
        pillage: joi.string().min(1).optional(),
        placement: joi.array().items(joi.string()).optional(),
        ageless: joi.boolean().required(),
        unique: joi.boolean().required(),
        unique_to: joi.string().empty('').optional()
    });

    return schema.validate(building);
};

export default router;
