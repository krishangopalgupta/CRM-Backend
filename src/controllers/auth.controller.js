import {
  registerUser,
  loginUser,
  refreshAccessToken,
} from "../services/auth.services.js";

const register = async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
};

const login = async (req, res) => {
  const { accessToken, refreshToken } = await loginUser(req.body);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    accessToken,
  });
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const accessToken = await refreshAccessToken(refreshToken);

  return res.status(200).json({ success: true, accessToken });
};

export { register, login, refresh };
