// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const protect = async (req, res, next) => {
//     let token;

//     if (
//         req.headers.authorization &&
//         req.headers.authorization.startsWith('Bearer')
//     ) {
//         try {
//             // Get token from header
//             token = req.headers.authorization.split(' ')[1];

//             // Verify token
//             const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

//             // Get user from the token
//             req.user = await User.findById(decoded.id).select('-password');

//             next();
//         } catch (error) {
//             console.error(error);
//             res.status(401).json({ message: 'Not authorized, token failed' });
//         }
//     }

//     if (!token) {
//         res.status(401).json({ message: 'Not authorized, no token' });
//     }
// };

// module.exports = { protect };


const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = null;

  // Check for Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      );

      // Attach user to request
      req.user = await User.findById(decoded.id).select('-password');

      return next();  // <-- IMPORTANT
    } catch (error) {
      console.error('JWT error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // No token found
  return res.status(401).json({ message: 'Not authorized, no token' });
};

module.exports = { protect };
