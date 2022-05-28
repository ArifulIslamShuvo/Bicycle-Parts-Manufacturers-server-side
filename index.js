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


//-----veridy JWT Token--------------
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    });
}
//-------------------------------------

async function run() {
    try {
        await client.connect();
        const partsCollection = client.db('bicycle_parts').collection('parts')
        const orderCollection = client.db('bicycle_parts').collection('orders')
        const userCollection = client.db('bicycle_parts').collection('user')
        const reviewCollection = client.db('bicycle_parts').collection('reviews')

        app.get('/partses', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });

        // post partes
        app.post('/partses', async (req, res) => {
            const parts = req.body;
            const result = await partsCollection.insertOne(parts);
            res.send(result);
        });

        // delet single products api 
        app.delete('/partses/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await partsCollection.deleteOne(query);
            res.send(result);
        });

        // get single parts API
        app.get('/partses/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const partses = await partsCollection.findOne(query);
            res.send(partses);
        });

        // POST single order API 
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        // get all orders
        app.get("/allorders", async (req, res) => {
            const query = {};
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
          });

        
          // get user orders
        app.get('/order', verifyJWT, async (req, res) => {
            const userEmail = req.query.userEmail;
            const decodedEmail = req.decoded.email;
            if (userEmail === decodedEmail) {
                const query = { userEmail: userEmail };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                return res.send(orders);
            }
            else {
                return res.status(403).send({ message: 'Forbidden access' });
            }
        });


        // get all user
        app.get('/user', verifyJWT, async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query)
            const user = await cursor.toArray();
            res.send(user);
        });


        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };

            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ result, token });
        })

         // admin
         app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester })
            if (requesterAccount.role === 'admin') {

                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
            else{
                return res.status(403).send({ message: 'Forbidden' });
            }
        });

         //-----get-admin- user ------
         app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({email: email});
            const isAdmin = user.role === 'admin';
            res.send({admin: isAdmin});
        })

         // POST a signal api
         app.post('/review', async(req, res) =>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });
         // get api
         app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        });


    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hellow ');
});


app.listen(port, () => {
    console.log('biycle parts listening', port);
})


