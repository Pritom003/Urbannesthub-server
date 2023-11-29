const express = require('express');
const Property = require('../../Model/peoperties');
const router = express.Router();

router.get('/properties', async (req, res) => {
  try {
    const properties = await Property.find();
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
