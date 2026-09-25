import { registerUser, loginUser } from "../services/auth.services.js";

const register = async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
};

const login = async (req, res) => {
  const result = await loginUser(req.body);
  console.log(result);
  res.status(200).json({ message: "Login Successfully" });
};
export { register, login };
