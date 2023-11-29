// require('dotenv').config()
// var jwt = require('jsonwebtoken');
// const verifyToken = async (req, res, next) => {
//   console.log(req.headers.authorization, 'from verifytoken');
//   if (!req.headers.authorization) {
//     return res.status(401).send({ message: 'forbidden access' });
//   }
//   const token = req.headers.authorization.split(' ')[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ message: 'forbidden access' });
//     }
//     req.decoded = decoded;  // Change res.decoded to req.decoded
//     next();
//   });
// };
// module.exports=verifyToken
const verifyToken = async (req, res, next) => {
  try {
    console.log(req.headers.authorization, 'from verifyToken');
    if (!req.headers.authorization) {
      return res.status(401).send({ message: 'forbidden access - no token' });
    }
    const token = req.headers.authorization.split(' ')[1];
    console.log('Received token:', token);

    // Your existing token verification logic
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification error:', err);
        return res.status(401).send({ message: 'forbidden access - token verification failed' });
      }
      req.decoded = decoded;
      next();
    });
  } catch (error) {
    console.error('Error in verifyToken:', error);
    return res.status(500).send({ message: 'internal server error' });
  }
};

module.exports = verifyToken;

