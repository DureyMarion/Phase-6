// Module
const jwt = require('jsonwebtoken');

// Middleware Auth
module.exports = (req, res, next) => { // Check si le token est bon
   try { // Check si le token est bon grâce à notre phrase secrète
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId; 
       req.auth = { // Check si l'userId est le même que dans la requête (si présent)
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};