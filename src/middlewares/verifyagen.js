const jwt = require('jsonwebtoken');
const UsserCollections = require(/* Assuming you have the correct path to UsserCollections */);

const verifyAgent = async (req, res, next) => {
  try {
    const email = req.decoded.email;
    const query = { email: email };
    const user = await UsserCollections.findOne(query);

    if (!user || user.role !== 'agent') {
      return res.status(403).send({ message: 'forbidden access' });
    }

    next();
  } catch (error) {
    console.error('Error in verifyAgent middleware:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports = verifyAgent;





// const verifyAgent=async(req,res,next)=>{
//   const email=req.decoded.email;
//   const query={email:email}
//   const user=await UsserCollections.findOne(query)
//   const isagent=user?.role==='agent';
//   if(!isagent){
//     return res.status(403).send({message:'forbidden access'})
//   }
//   next();
// }