import User from "../models/user.model.js";
import * as AuthService from "../services/auth.service.js";
import catchAsync from "../utils/catchAsync.js";

export const registerUser = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide name, email and password" });
  }

  //Call the service to handle registration logic
  const user = await AuthService.registerUser({ name, email, password });
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: { id: user._id, name: user.name, email: user.email },
  });
});

export const loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  //Call the service to handle login logic
  const { user, accessToken, refreshToken } = await AuthService.loginUser(email, password);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
  res.status(200).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
  // const user = await User.findOne({email});
  // if(!user) return res.status(400).json({message: "User does not exist"});

  // const isMatch = await bcrypt.compare(password, user.password);
  // if(!isMatch) return res.status(400).json({message: "Invalid credentials"});

  // const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, {
  //     expiresIn: "1d",
  // });

  // res.json({ message : "Login successful", user, token});
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select("-password");
  res.json(users);
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;

  const { newAccessToken, newRefreshToken } = await AuthService.refreshAccessToken(refreshTokenFromCookie);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({ accessToken: newAccessToken });
})

export const logoutUser = catchAsync(async (req, res, next) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;
  
  await AuthService.logoutUser(refreshTokenFromCookie);
  res.clearCookie("refreshToken");

  res.json({ message: "Logged out successfully" });
});