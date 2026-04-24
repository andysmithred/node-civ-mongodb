import express from 'express';
import joi from 'joi';
import { ObjectId } from 'mongodb';
import db from '../db/conn.mjs';

const router = express.Router();

// status

router.get('/status', (req, res) => {
    res.status(200).json({"status": "ok"});
})


// GET all units
router.get('/', async (req, res) => {
    console.log('Fetching all units from database');

    const unitsCollection = db.collection('units'); 
    const units = await unitsCollection.find({}).toArray();

    res.status(200).json(units);
});

// GET a single unit
router.get("/:id", async (req, res) => {
    console.log(`Fetching unit with ID: ${req.params.id}`);

    let collection = await db.collection("units");
    let query = {_id: new ObjectId(req.params.id)};
    let result = await collection.findOne(query);

    if (!result) res.status(404).send("Not found");
    else res.status(200).send(result);
});

// Add a new unit to the collection
router.post("/", async (req, res) => {
    console.log('Adding new unit to database');

    const { error } = validateUnit(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    let collection = await db.collection("units");
    let newDocument = req.body;
    let result = await collection.insertOne(newDocument);

    res.status(204).send(result);
});

// Update the unit
router.patch("/:id", async (req, res) => {
    console.log(`Updating unit with ID: ${req.params.id}`);

    delete req.body._id;

    const { error } = validateUnit(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }

    let collection = await db.collection("units");
    let query = {_id: new ObjectId(req.params.id)};

    let unit = await collection.findOne(query);
    if (!unit) return res.status(404).send('The unit with the given ID was not found.');

    const updates = {
        $set: req.body 
    };
    let result = await collection.updateOne(query, updates);

    res.status(200).send(result);
});


// Update the unit with a new attribute
router.patch("/:id/addAttribute", async (req, res) => {
    console.log(`Adding attribute to unit with ID: ${req.params.id}`);      
    const newAttribute = req.body.attribute;

    let collection = await db.collection("units");
    let query = {_id: new ObjectId(req.params.id)}; 

    let unit = await collection.findOne(query);
    if (!unit) return res.status(404).send('The unit with the given ID was not found.');

    const updates = {
        $push: { attributes: newAttribute } 
    };
    let result = await collection.updateOne(query, updates);

    res.status(200).send(result);   
});


// update the unit with a new civ bonus
router.patch("/:id/addCivBonus", async (req, res) => {
    console.log(`Adding civ bonus to unit with ID: ${req.params.id}`);      
    const newCivBonus = req.body.civ_bonus;

    let collection = await db.collection("units");
    let query = {_id: new ObjectId(req.params.id)};

    let unit = await collection.findOne(query);
    if (!unit) {
        console.error('Unit not found with ID:', req.params.id);
        return res.status(404).send('The unit with the given ID was not found.');   
    }

    const updates = {
        $push: { civ_bonuses: newCivBonus } 
    };
    let result = await collection.updateOne(query, updates);

    res.status(200).send(result);   
});


// Delete an entry
router.delete("/:id", async (req, res) => {
    console.log(`Deleting unit with ID: ${req.params.id}`);

    const collection = db.collection("units");
    const query = { _id: new ObjectId(req.params.id) };

    let unit = await collection.findOne(query);
    if (!unit) return res.status(404).send('The unit with the given ID was not found.');

    let result = await collection.deleteOne(query);

    res.status(200).send(result);
});

// clear attributes array
router.patch("/:id/clearAttributes", async (req, res) => {
    console.log(`Clearing attributes for unit with ID: ${req.params.id}`);

    const collection = db.collection("units");
    const query = { _id: new ObjectId(req.params.id) };

    let unit = await collection.findOne(query);
    if (!unit) return res.status(404).send('The unit with the given ID was not found.');

    const updates = {
        $set: { attributes: [] } 
    };
    let result = await collection.updateOne(query, updates);

    res.status(200).send(result);   
});

// clear civ bonuses array
router.patch("/:id/clearCivBonuses", async (req, res) => {
    console.log(`Clearing civ bonuses for unit with ID: ${req.params.id}`);

    const collection = db.collection("units");
    const query = { _id: new ObjectId(req.params.id) };

    let unit = await collection.findOne(query);
    if (!unit) return res.status(404).send('The unit with the given ID was not found.');

    const updates = {
        $set: { civ_bonuses: [] } 
    };
    let result = await collection.updateOne(query, updates);

    res.status(200).send(result);   
});

// Validation function
var validateUnit = unit => {
    const schema = joi.object({
        name: joi.string().min(3).required(),
        icon: joi.string().min(3).required(),
        tier: joi.number().integer().min(1).max(3).required(),
        age: joi.string().required(),
        type: joi.string().required(),
        attributes: joi.array().items(joi.string()).optional(),
        abilities: joi.array().items(joi.string()).optional(),
        actions: joi.array().items(joi.string()).optional(),
        unlocked: joi.string().optional().empty('').allow(null),
        obsolete: joi.string().optional().empty('').allow(null),
        cost: joi.object({
            production: joi.number().integer().min(0).required(),
            scalable: joi.boolean().required(),
            gold: joi.number().integer().min(0).required(),
            maintenance: joi.number().integer().min(0).required(),
        }).required(),
        stats: joi.object({ 
            movement: joi.number().integer().min(1).required(),
            strength: joi.number().integer().min(1).required(),
            ranged: joi.number().integer().min(0).optional(),
            range: joi.number().integer().min(0).optional(),
            sight: joi.number().integer().min(1).optional(),
            bombard: joi.number().integer().min(0).optional(),
        }).required(),
        upgrades: joi.string().optional().empty('').allow(null),
        replaces: joi.string().optional().empty('').allow(null),
        unique: joi.object({
            is_unique: joi.boolean().required(),
            civilization: joi.string().optional().empty('').allow(null),
            replaces: joi.string().optional().empty('').allow(null),
            bonuses: joi.array().items(joi.string()).optional(),
        }).optional(),
        notes: joi.array().items(joi.string()).optional(),
    });
    return schema.validate(unit);
};

export default router;
