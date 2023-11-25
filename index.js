const express = require('express');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser())
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
// middlewars

const verifyToken = async (req, res, next) => {
  console.log(req.headers.authorization, 'from verifytoken');
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'forbidden access' });
  }
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'forbidden access' });
    }
    req.decoded = decoded;  // Change res.decoded to req.decoded
    next();
  });
};



const UsserCollections=client.db('UrbannextDB').collection('users')




// const verifyToken = (req, res, next) => {
//   // console.log('inside verify token', req.headers.authorization);
//   if (!req.headers.authorization) {
//     return res.status(401).send({ message: 'unauthorized access' });
//   }
//   const token = req.headers.authorization.split(' ')[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ message: 'unauthorized access' })
//     }
//     req.decoded = decoded;
//     next();
//   })
// }


const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email };
  const user = await UsserCollections.findOne(query);
  const isAdmin = user?.role === 'admin';
  if (!isAdmin) {
    return res.status(403).send({ message: 'forbidden access' });
  }
  next();
}



const verifyAgent=async(req,res,next)=>{
  const email=req.decoded.email;
  const query={email:email}
  const user=await UsserCollections.findOne(query)
  const isagent=user?.role==='agent';
  if(!isagent){
    return res.status(403).send({message:'forbidden access'})
  }
  next();
}







// User data

// admin  api





app.get('/user',verifyToken,verifyAdmin,async (req, res) => {
  try {
    
    const users = await UsserCollections.find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// jwt related api
app.post('/jwt',async(req,res)=>{
  const user=req.body
  const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
  res.send({token});
})








app.get('/user/admin/:email',verifyToken,async(req,res)=>{
  const email=req.params.email;
  if(email !== req.decoded.email){
      return res.status(403).send({message:'forbidden access'})
  }
  const query={email:email}
  const user=await UsserCollections.findOne(query);
  let admin=false;
  if(user){
      admin=user?.role=== 'admin'
  }
  res.send({admin})

})
app.get('/user/agent/:email',verifyToken,async(req,res)=>{
  const email=req.params.email;
  if(email !== req.decoded.email){
      return res.status(403).send({message:'forbidden access'})
  }
  const query={email:email}
  const user=await UsserCollections.findOne(query);
  let agent=false;
  if(user){
      agent=user?.role=== 'agent'
  }
  res.send({agent})

})

app.patch('/user/admin/:id',async(req,res)=>{
 
  const id=req.params.id;
  const filter={_id:new ObjectId(id)}
  const updatedDoc={
      $set:{
          role:'admin'
      }
  }
  const result=await UsserCollections.updateOne(filter,updatedDoc)
  res.send(result)
})



// agent related api
app.patch('/user/agent/:id',async(req,res)=>{
  const id=req.params.id;
  const filter={_id:new ObjectId(id)}
  const updatedDoc={
      $set:{
          role:'agent'
      }
  }
  const result=await UsserCollections.updateOne(filter,updatedDoc)
  res.send(result)
})



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