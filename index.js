const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();



app.use(cors());
app.use(express.json());

app.get('/', (req, res) =>{
    res.send('Hellow ');
});


app.listen(port, () => {
    console.log('biycle parts listening', port);
})