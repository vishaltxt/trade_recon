import jwt from "jsonwebtoken";
import { User } from "../modals/userModels/user-model.js";
// import { User } from "../models/userModel.js";

// Middleware to protect routes


export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.userId).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });  
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    console.log(req.user.role);
    return res.status(403).json({ msg: "Access denied, admin only" });
  }
  next();
};


// const jwt = require('jsonwebtoken');

// export const authMiddleware = (req, res, next) => {
//   const token = req.header('x-auth-token');
//   if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded.user;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: 'Token is not valid' });
//   }
// };

