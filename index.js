const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

//middleware 

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h6rs5.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        await client.connect();
        const partsCollection = client.db('bicycle_parts').collection('parts')
        const orderCollection = client.db('bicycle_parts').collection('orders')
        const userCollection = client.db('bicycle_parts').collection('user')

        app.get('/partses', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });

         // get single parts API
         app.get('/partses/:id', async(req, res) =>{
            const id = req.params.id;
            const query={_id: ObjectId(id)};
            const partses = await partsCollection.findOne(query);
            res.send(partses);
        });

          // POST single order API 
          app.post('/order', async(req, res) =>{
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        app.get('/order', async (req, res) => {
            const userEmail = req.query.userEmail;
            const query = {userEmail: userEmail};
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });

        app.put('/user/:email', async(req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = {email : email};
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
              };

              const result = await userCollection.updateOne(filter, updateDoc, options);
              const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
              res.send({result, token});
        })
    }
    finally{

    }
}
run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send('Hellow ');
});


app.listen(port, () => {
    console.log('biycle parts listening', port);
})