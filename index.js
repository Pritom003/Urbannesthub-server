const express = require('express');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser())
app.use(
  cors({
      origin: ['http://localhost:5173','https://urbannesthubs-d6f4b.web.app', 'https://urbannesthubs-d6f4b.firebaseapp.com'],
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
      // client.connect()
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
const Propertiescollectios=client.db('UrbannextDB').collection('properties')
const Reviewcollection=client.db('UrbannextDB').collection('reviews')
const WishCollection=client.db('UrbannextDB').collection('wished')
const OfferedCollection=client.db('UrbannextDB').collection('useroffer')
const AdvertiseCollection=client.db('UrbannextDB').collection('advertised')



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







// paymayment api
app.post("/create-payment-intent", async (req, res) => {
  const { price } = req.body;
  const amount=parseInt(price*100);
  console.log(amount,'amount inside');
  const paymentIntent = await stripe.paymentIntents.create({

    amount:amount,
    currency:"usd",
    payment_method_types:['card']
  })
  res.send({
    clientSecret: paymentIntent.client_secret,
  });

})


app.post('/payments', async (req, res) => {
  const payment = req.body;
  const paymentResult = await paymaymentCollection.insertOne(payment);


  res.send(paymentResult)});










  app.patch('/offers/payed/:id', async (req, res) => {
    const offerId = req.params.id;
    const status = req.body.request;
  
    const result = await OfferedCollection.updateOne(
      { _id: new ObjectId(offerId) },
      { $set: { request: status } }
    )});
  







// advertised api

 

app.get('/advertised',async (req,res)=>{

  const cursor =AdvertiseCollection.find()
  const result= await cursor.toArray()
  res.send(result);
  
  
  })

  app.get('/latest-reviews', async (req, res) => {
   
     
      const latestReviews = await Reviewcollection.find()
        .sort({ Reviewstime: -1 }) 
        .limit(3) 
        .toArray();
  
      res.send(latestReviews);
    
  });

// admin  api





app.get('/user',async (req, res) => {
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








app.get('/user/admin/:email',verifyToken,verifyAdmin,async(req,res)=>{
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
app.get('/user/agent/:email',verifyToken,verifyAgent,async(req,res)=>{
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



// handlefraud

app.patch('/user/fraud/:id', async (req, res) => {
  const userId = req.params.id;
  const userFilter = { _id: new ObjectId(userId) };
  const userUpdate = {
    $set: {
      role: 'fraud'
    }
  };
  await UsserCollections.updateOne(userFilter, userUpdate);
  const propertiesFilter = { agentEmail: req.body.agentEmail };
  await Propertiescollectios.deleteMany(propertiesFilter);

  res.send({ message: 'User marked as fraud, and properties deleted successfully.' });
});










// review api

app.post('/reviews',async(req,res)=>{
  const allreviews=req.body
  const result=await Reviewcollection.insertOne(allreviews)
  res.send(result)
})


app.get('/reviews',async (req,res)=>{

  const cursor =Reviewcollection.find()
  const result= await cursor.toArray()
  res.send(result);
  
  
  })
  app.delete('/reviews/:id', async (req, res) => {
    const id = req.params.id;
    console.log('id from deleterev', id);
    const query = { _id: new ObjectId(id) };
    const result = await Reviewcollection.deleteOne(query);
    res.send(result);
  });
  // wishlist api
  app.post('/wished',async(req,res)=>{
    const allwished=req.body
    const result=await WishCollection.insertOne(allwished)
    res.send(result)
  })
  
  app.get('/wished', async (req,res)=>{

    const cursor =WishCollection.find()
    const result= await cursor.toArray()
    res.send(result);
    
    
    })



    app.get('/wished/:wisheremail', async (req, res) => {
      const wisheremail = req.params.wisheremail; 
      const query = { wisheremail };
      const result = await WishCollection.find(query).toArray();
      res.send(result);
    });



    app.get('/wished/makeoffer/:_id', async (req, res) => {
      const _id = req.params._id; 
      const query = { _id: new ObjectId(_id) }; 
      const result = await WishCollection.findOne(query);
      res.send(result);
    });
    

// offer api
app.post('/offers',async(req,res)=>{
  const alloffers=req.body
  const result=await OfferedCollection.insertOne(alloffers)
  res.send(result)
})
app.get('/offers',async (req,res)=>{

  const cursor =OfferedCollection.find()
  const result= await cursor.toArray()
  res.send(result);
  
  
  })
  app.get('/offers/payment/:_id',async (req,res)=>{

    const _id = req.params._id; 
    const query = { _id: new ObjectId(_id) }; 
    const result = await OfferedCollection.findOne(query);
    res.send(result)
    
    
    })

 

app.put('/offers/reject/:propertyId', async (req, res) => {
  const offerId = req.body.offerId;
  const propertyId = req.params.propertyId;

  // Reject other offers for the same property
  const result = await OfferedCollection.updateMany(
    { propertyId: propertyId, _id: { $ne:new ObjectId(offerId) } },
    { $set: { request: 'rejected' } }
  );

  res.send(result);
});






app.patch('/offers/:id', async (req, res) => {
  const offerId = req.params.id;
  const status = req.body.request;

  const result = await OfferedCollection.updateOne(
    { _id: new ObjectId(offerId) },
    { $set: { request: status } }
  );

  if (status === 'accepted') {
    const { propertyTitle, propertyLocation, agentName } = req.body;

    // Update offers with matching properties
    await OfferedCollection.updateMany(
      {
        propertyTitle: propertyTitle,
        propertyLocation: propertyLocation,
        agentName: agentName,
        _id: { $ne: new ObjectId(offerId) }
      },
      { $set: { request: 'rejected' } }
    );
  }

  res.send(result);
});






// property api
app.post('/properties',async(req,res)=>{
  const allproperties=req.body
  const result=await Propertiescollectios.insertOne(allproperties)
  res.send(result)
})

app.get('/prospertie',async (req,res)=>{

  const cursor =Propertiescollectios.find()
  const result= await cursor.toArray()
  res.send(result);
  
  
  })


  app.get('/properties/:_id', async (req, res) => {
    const _id = req.params._id; 
    const query = { _id: new ObjectId(_id) }; 
    const result = await Propertiescollectios.findOne(query);
    res.send(result);
  });










  app.patch('/properties/:id',async(req,res)=>{
    const id=req.params.id;
    const filter={_id:new ObjectId(id)}
    const updatedDoc={
        $set:{
            status:'verified'
        }
    }
    const result=await Propertiescollectios.updateOne(filter,updatedDoc)
    res.send(result)
  })


  app.patch('/properties/rejected/:id',async(req,res)=>{
    const id=req.params.id;
    const filter={_id:new ObjectId(id)}
    const updatedDoc={
        $set:{
            status:'rejected'
        }
    }
    const result=await Propertiescollectios.updateOne(filter,updatedDoc)
    res.send(result)
  })




  app.get('/properties/agent/:agentEmail',verifyToken,verifyAgent, async (req,res)=>{

    const agentEmail = req.params.agentEmail;
    const query = { agentEmail };
    const result = await Propertiescollectios.find(query).toArray();
    res.send(result);
    
    
    })
    app.delete('/properties/agent/:agentEmail/:_id', async (req, res) => {
      const _id = req.params._id; // Use correct parameter name here
      console.log('id from delete', _id);
      const query = { _id: new ObjectId(_id) };
      const result = await Propertiescollectios.deleteOne(query);
      res.send(result);
    });
    

    






// -------------------------------------------


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