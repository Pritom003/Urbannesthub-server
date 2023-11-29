
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { LOCSL_CLIENT, CLIENT_APP } = require('../config/default');

const applyMiddleware=(app)=>{
  
app.use(
  cors({
      origin: [LOCSL_CLIENT,
        CLIENT_APP,
       'https://urbannesthubs-d6f4b.firebaseapp.com'],
      credentials: true,
  }),
)
app.use(express.json());
app.use(cookieParser())

}
module.exports=applyMiddleware