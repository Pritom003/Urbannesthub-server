const express = require('express');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
// const cookieParser = require('cookie-parser');
// var jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(
  cors({
      origin: ['http://localhost:5173'],
      credentials: true,
  }),
)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ucoarqa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const logger = async (req, res, next) => {
  console.log('called:', req.host, req.originalUrl)
  next();
}
const dbConnect = async () => {
  try {
      client.connect()
      console.log('DB Connected Successfully✅')
  } catch (error) {
      console.log(error.name, error.message)
  }
}
dbConnect()




const UsserCollections=client.db('UrbannextDB').collection('users')


// User data
app.get('/user', async (req, res) => {
  try {
    const users = await UsserCollections.find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



app.delete('/user/:id', async (req, res) => {
  const id = req.params.id;
  console.log('id from delete', id);
  const query = { _id: new ObjectId(id) };
  const result = await UsserCollections.deleteOne(query);
  res.send(result);
});






app.post('/user', async (req, res) => {
  try {
    const user = req.body;
    const query = { email: user.email }; // Use the correct variable name here
    const existingUser = await UsserCollections.findOne(query); // Use findOne instead of insertOne for checking existence

    if (existingUser) {
      return res.send({ message: 'User already exists', insertedId: null });
    }

    const result = await UsserCollections.insertOne(user);
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});





  app.get('/', (req, res) =>{
      res.send('UNH is is workign')
    })

 app.listen(port, () =>{
  console.log(`UNH server is running on port: ${port}`);
})   