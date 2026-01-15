import "./loadEnvironment.mjs";
import express from 'express';

import units from './data/units.mjs';

const app = express();
const port = process.env.PORT || 3000;  

app.use(express.json()); // middleware to parse JSON bodies

// load the units route 
app.use('/units', units);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
