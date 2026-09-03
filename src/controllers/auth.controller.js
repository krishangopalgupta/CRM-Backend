import { registerUser } from "../services/auth.services.js";

const register = async (req, res) => {
  const result = await registerUser(req.body);
  console.log(result);
  res.status(201).json(result);
};
export { register }