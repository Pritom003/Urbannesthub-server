const mongoose=require('mongoose')

require('dotenv').config()
const getconnettionsring=()=>{
  // connectionUrl = process.env.DATABASE_PROD

let  connectionUrl = process.env.DATABASE_PROD;
  connectionUrl = connectionUrl.replace(
    "<username>",
    process.env.DB_USER
  );
  connectionUrl = connectionUrl.replace(
    "<password>",
    process.env.DB_PASSWORD
  );
  return connectionUrl
}
const connetiondb =async()=>{
  console.log('connecting to db');
  const uri=getconnettionsring()
  await mongoose.connect(uri,{dbName:process.env.DATABASE_NAME})
  console.log('connected to db');
}
module.exports=connetiondb;