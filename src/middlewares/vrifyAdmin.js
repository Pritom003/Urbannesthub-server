// const verifyAdmin = async (req, res, next) => {
//   const email = req.decoded.email;
//   const query = { email: email };
//   const user = await UsserCollections.findOne(query);
//   const isAdmin = user?.role === 'admin';
//   if (!isAdmin) {
//     return res.status(403).send({ message: 'forbidden access' });
//   }
//   next();
// }
const jwt = require('jsonwebtoken');
const UsserCollections = require(/* Assuming you have the correct path to UsserCollections */);

const verifyAdmin = async (req, res, next) => {
  try {
    const email = req.decoded.email;
    const query = { email: email };
    const user = await UsserCollections.findOne(query);

    if (!user || user.role !== 'admin') {
      return res.status(403).send({ message: 'forbidden access' });
    }

    next();
  } catch (error) {
    console.error('Error in verifyAdmin middleware:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports = verifyAdmin;
