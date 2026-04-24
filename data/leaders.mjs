import express from 'express';
import joi from 'joi';
import { ObjectId } from 'mongodb';
import db from '../db/conn.mjs';

const router = express.Router();

// status
router.get('/status', (req, res) => {
    res.json({ "status": "ok" }).status(200);
})


// GET all leaders
router.get('/', async (req, res) => {
    console.log('Fetching all leaders from database');

    const collection = db.collection('leaders');
    const results = await collection.find({}).toArray();

    res.json(results).status(200);
});

// GET a single leader
router.get("/:id", async (req, res) => {
    console.log(`Fetching leader with ID: ${req.params.id}`);

    let collection = await db.collection("leaders");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
});

// Add a new leader to the collection
router.post("/", async (req, res) => {
    console.log('Adding new leader to database');

    const { error } = validateLeader(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let collection = await db.collection("leaders");
    let newDocument = req.body;
    let result = await collection.insertOne(newDocument);

    res.send(result).status(204);
});

// Update the leader
router.patch("/:id", async (req, res) => {
    console.log(`Updating leader with ID: ${req.params.id}`);

    delete req.body._id;

    const { error } = validateLeader(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let collection = await db.collection("leaders");
    let query = { _id: new ObjectId(req.params.id) };

    let leader = await collection.findOne(query);
    if (!leader) return res.status(404).send('The leader with the given ID was not found.');

    const updates = {
        $set: req.body
    };
    let result = await collection.updateOne(query, updates);

    console.log("RESULT: ", result);

    res.send(result).status(200);
});

// Delete an entry
router.delete("/:id", async (req, res) => {
    console.log(`Deleting leader with ID: ${req.params.id}`);

    const collection = db.collection("leaders");
    const query = { _id: new ObjectId(req.params.id) };

    let leader = await collection.findOne(query);
    if (!leader) return res.status(404).send('The leader with the given ID was not found.');

    let result = await collection.deleteOne(query);

    res.send(result).status(200);
});

// Validation function
var validateLeader = leader => {
    const schema = joi.object({
        name: joi.string().min(3).required(),
        icon: joi.string().min(3).required(),
        intro: joi.string().min(3).required(),
        attributes: joi.array().items(joi.string()).required(),
        ability: joi.object({
            name: joi.string().min(3).required(),
            attributes: joi.array().items(joi.string()).optional()
        }).required(),
        agenda: joi.object({
            name: joi.string().min(3).required(),
            attributes: joi.array().items(joi.string()).optional()
        }).required(),
        civilizations: joi.object({
            historic: joi.array().items(joi.string()).optional(),
            geographic: joi.array().items(joi.string()).optional(),    
            strategic: joi.array().items(joi.string()).optional()
        }).optional(),
        start_bias: joi.array().items(joi.string()).optional(),
        momentos: joi.array().items(joi.string()).optional(),
    });
    return schema.validate(leader);
};

export default router;
