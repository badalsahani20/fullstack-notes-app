import User from "../models/user.model.js";
import * as AuthService from "../services/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import crypto from "crypto";

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const getRefreshCookieClearOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
});

export const registerUser = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide name, email and password" });
  }

  const { user, accessToken, refreshToken } = await AuthService.registerUser({
    name,
    email,
    password,
  });

  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    accessToken,
    user: { id: user._id, name: user?.name, email: user.email },
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

  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());
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
  const users = await AuthService.fetchAllUsers();
  res.status(200).json({ success: true, users});
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;

  const { accessToken, refreshToken, user } = await AuthService.refreshAccessToken(refreshTokenFromCookie);

  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

  res.status(200).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    }
  })
})

export const logoutUser = catchAsync(async (req, res, next) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;
  
  await AuthService.logoutUser(refreshTokenFromCookie);
  res.clearCookie("refreshToken", getRefreshCookieClearOptions());

  res.json({ message: "Logged out successfully" });
});

export const getMe = catchAsync(async (req, res, next) => {
  const user = await AuthService.getUserById(req.user.id);

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

export const googleCallback = catchAsync(async (req, res) => {
  const user = req.user;
  const refreshToken = user.generateRefreshToken();

  const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await User.updateOne(
    { _id: user._id },
    {
      $push: {
        refreshToken: {
          $each: [{ token: hashedRefreshToken }],
          $slice: -5,
        },
      },
    }
  );

  res.cookie("refreshToken", refreshToken, {
    ...getRefreshCookieOptions(),
  });

  res.redirect(
    `${process.env.FRONTEND_URL}/oauth-success`
  );
})
