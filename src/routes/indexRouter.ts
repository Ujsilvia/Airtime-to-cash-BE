import express, { Request, Response, NextFunction }  from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.status(200).json({ message: 'Welcome to Live POD-A Project', route: '/'})
});

export default router
