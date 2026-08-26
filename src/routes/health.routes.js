import express from 'express'

const router = express.Router();

router.get("/health", (req, res, next) => {
  res.status(200).json({ message: "Health update data   " });
});

export default router;
