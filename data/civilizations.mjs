import express from 'express';
import joi from 'joi';
import { ObjectId } from 'mongodb';
import db from '../db/conn.mjs';

const router = express.Router();

// status
router.get('/status', (req, res) => {
    res.json({ "status": "ok" }).status(200);
})


// GET all civilizations
router.get('/', async (req, res) => {
    console.log('Fetching all civilizations from database');

    const collection = db.collection('civilizations');
    const results = await collection.find({}).toArray();

    res.json(results).status(200);
});

// GET a single civilization
router.get("/:id", async (req, res) => {
    console.log(`Fetching civilization with ID: ${req.params.id}`);

    let collection = await db.collection("civilizations");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
});

// Add a new civilization to the collection
router.post("/", async (req, res) => {
    console.log('Adding new civilization to database');

    const { error } = validateCivilization(req.body);

    console.log(error);

    if (error) return res.status(400).send(error.details[0].message);

    let collection = await db.collection("civilizations");
    let newDocument = req.body;
    let result = await collection.insertOne(newDocument);

    res.send(result).status(204);
});

// Update the civilization
router.patch("/:id", async (req, res) => {
    console.log(`Updating civilization with ID: ${req.params.id}`);

    delete req.body._id;

    const { error } = validateCivilization(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let collection = await db.collection("civilizations");
    let query = { _id: new ObjectId(req.params.id) };

    let civilization = await collection.findOne(query);
    if (!civilization) return res.status(404).send('The civilization with the given ID was not found.');

    const updates = {
        $set: req.body
    };
    let result = await collection.updateOne(query, updates);

    res.send(result).status(200);
});

// Delete an entry
router.delete("/:id", async (req, res) => {
    console.log(`Deleting civilization with ID: ${req.params.id}`);

    const collection = db.collection("civilizations");
    const query = { _id: new ObjectId(req.params.id) };

    let civilization = await collection.findOne(query);
    if (!civilization) return res.status(404).send('The civilization with the given ID was not found.');

    let result = await collection.deleteOne(query);

    res.send(result).status(200);
});

// Validation function
var validateCivilization = civilization => {
    const schema = joi.object({
        name: joi.string().min(3).required(),
        empire: joi.string().min(3).optional(),
        demonym: joi.string().min(3).optional(),
        icon: joi.string().min(3).required(),
        age: joi.string().min(3).required(),
        intro: joi.string().min(3).required(),
        attributes: joi.array().items(joi.string()).required(),
        ability: joi.object({
            name: joi.string().min(3).required(),
            attributes: joi.array().items(joi.string()).optional()
        }).optional(),
        unique: joi.object({
            military: joi.string().min(3).required(),
            civilian: joi.string().min(3).required(),
            infrastructure: joi.array().items(joi.string()).optional(),
            civics: joi.array().items(joi.string()).optional(),
            traditions: joi.array().items(joi.string()).optional()
        }).optional(),
        unlocks: joi.object({
            requirements: joi.array().items(joi.string()).optional(),
            unlocked_by: joi.array().items(joi.string()).optional(),
            unlocks: joi.array().items(joi.string()).optional()
        }).optional(),    
        leaders: joi.object({
            historic: joi.array().items(joi.string()).optional(),
            geographic: joi.array().items(joi.string()).optional(),
            strategic: joi.array().items(joi.string()).optional(),
        }).optional(),
        start_biases: joi.array().items(joi.string()).optional(),
        wonder: joi.string().min(3).optional(),
    });
    return schema.validate(civilization);
};

export default router;
