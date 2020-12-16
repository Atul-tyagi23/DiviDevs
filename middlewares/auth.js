const jwt = require('jsonwebtoken');
require('dotenv').config()

module.exports = (req, res, next) => {
    
    const token = req.header('x-auth-token');
    if(!token){
        return res.status(401).json({message: "No token! Authorization denied"});
    }
    try {
        const decoded = jwt.verify(token, process.env.jwtSecret);
        req.user = decoded.user;
       // console.log(req.user)
        next();
    }catch(err){
       return res.status(401).json({message: "token not valid!"})
    }
}
