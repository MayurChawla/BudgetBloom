const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();


app.use(cors());
app.use(express.json());


app.listen(4000, () => console.log('Server running on port 4000'));
