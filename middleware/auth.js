const jwt = require('jsonwebtoken');
const Buyer = require('../models/Buyer');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const buyer = await Buyer.findOne({ _id: decoded._id, 'tokens.token': token });

    if (!buyer) {
      throw new Error();
    }

    req.token = token;
    req.user = buyer;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth;