import "./loadEnvironment.mjs";
import express from 'express';
import cors from 'cors';
import units from './data/units.mjs';
import leaders from './data/leaders.mjs';
import civilizations from './data/civilizations.mjs';
import civics from './data/civics.mjs';
import technologies from './data/technologies.mjs';
import buildings from './data/buildings.mjs';
import wonders from './data/wonders.mjs';
import policies from './data/policies.mjs';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // middleware to parse JSON bodies

const corsOptions = {
    origin: 'http://localhost:5173', // Allow only this domain
    methods: 'GET,POST,PUT,PATCH,DELETE', // Allow only specific HTTP methods
    allowedHeaders: 'Content-Type,Authorization' // Allow specific headers
};

app.use(cors(corsOptions));

// load the units route 
app.use('/units', units);
app.use('/leaders', leaders);
app.use('/civilizations', civilizations);
app.use('/civics', civics);
app.use('/technologies', technologies);
app.use('/buildings', buildings);
app.use('/wonders', wonders);
app.use('/policies', policies);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
