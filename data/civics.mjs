import express from 'express';
import joi from 'joi';
import { ObjectId } from 'mongodb';
import db from '../db/conn.mjs';

const router = express.Router();

// status
router.get('/status', (req, res) => {
    res.json({ "status": "ok" }).status(200);
})


// GET all civics
router.get('/', async (req, res) => {
    console.log('Fetching all civics from database');

    const collection = db.collection('civics');
    const results = await collection.find({}).toArray();

    res.json(results).status(200);
});

// GET a single civic
router.get("/:id", async (req, res) => {
    console.log(`Fetching civic with ID: ${req.params.id}`);

    let collection = await db.collection("civics");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
});

// Add a new civic to the collection
router.post("/", async (req, res) => {
    console.log('Adding new civic to database');

    console.log(req.body);

    const { error } = validateCivic(req.body);
    if (error) {
        console.log(error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    let collection = await db.collection("civics");
    let newDocument = req.body;
    let result = await collection.insertOne(newDocument);

    res.send(result).status(204);
});

// Update the civic
router.patch("/:id", async (req, res) => {
    console.log(`Updating civic with ID: ${req.params.id}`);

    delete req.body._id;

    const { error } = validateCivic(req.body);
    if (error) {
        console.log(error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    let collection = await db.collection("civics");
    let query = { _id: new ObjectId(req.params.id) };

    let civic = await collection.findOne(query);
    if (!civic) return res.status(404).send('The civic with the given ID was not found.');

    const updates = {
        $set: req.body
    };
    let result = await collection.updateOne(query, updates);

    res.send(result).status(200);
});

// Delete an entry
router.delete("/:id", async (req, res) => {
    console.log(`Deleting civic with ID: ${req.params.id}`);

    const collection = db.collection("civics");
    const query = { _id: new ObjectId(req.params.id) };

    let civic = await collection.findOne(query);
    if (!civic) return res.status(404).send('The civic with the given ID was not found.');

    let result = await collection.deleteOne(query);

    res.send(result).status(200);
});

// Validation function
var validateCivic = civic => {
    const schema = joi.object({
        name: joi.string().min(3).required(),
        icon: joi.string().min(3).required(),
        age: joi.string().min(3).required(),
        level: joi.number().min(0).required(),
        unique: joi.boolean().valid(true, false).optional(),
        unique_to: joi.string().empty('').optional(),
        quote: joi.object({
            text: joi.string().empty('').optional(),
            author: joi.string().empty('').optional()
        }).optional(),
        cost: joi.number().min(0).required(),
        requires: joi.array().items(joi.string()).optional(),
        leads: joi.array().items(joi.string()).optional(),
        unlocks: joi.object({
            wonders: joi.array().items(joi.string()).optional(),
            units: joi.array().items(joi.string()).optional(),
            buildings: joi.array().items(joi.string()).optional(),
            projects: joi.array().items(joi.string()).optional(),
            policies: joi.array().items(joi.string()).optional(),
            endeavors: joi.array().items(joi.string()).optional(),
            effects: joi.array().items(joi.string()).optional(),
        }).optional(),
        mastery: joi.object({
            wonders: joi.array().items(joi.string()).optional(),
            units: joi.array().items(joi.string()).optional(),
            buildings: joi.array().items(joi.string()).optional(),
            projects: joi.array().items(joi.string()).optional(),
            policies: joi.array().items(joi.string()).optional(),
            endeavors: joi.array().items(joi.string()).optional(),
            effects: joi.array().items(joi.string()).optional(),
        }).optional()
    });
    return schema.validate(civic);
};

export default router;
