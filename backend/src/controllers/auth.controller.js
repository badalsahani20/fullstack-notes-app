import User from "../models/user.model.js";
import * as AuthService from "../services/auth.service.js";
import catchAsync from "../utils/catchAsync.js";
import crypto from "crypto";
import * as MailService from "../services/mail.service.js";
import { redis } from "../../config/redis.js";

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

  const { user, verificationToken } = await AuthService.registerUser({
    name,
    email,
    password,
  });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  await MailService.sendVerificationEmail(email, name, verificationUrl);

  res.status(201).json({
    success: true,
    message: "Registration successful! Please check your email to verify your account.",
    user: { id: user._id, name: user?.name, email: user.email, avatar: user.avatar, isVerified: user.isVerified },
  });
});

export const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;
  console.log("BACKEND: Verification started for token:", token);
  
  const { user, accessToken, refreshToken } = await AuthService.verifyUserEmail(token);
  console.log("BACKEND: Verification successful for user:", user.email);

  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());
  res.status(200).json({
    success: true,
    message: "Email verified successfully.",
    accessToken,
    user: { id: user._id, name: user?.name, email: user.email, avatar: user.avatar, isVerified: user.isVerified },
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
      avatar: user.avatar,
      isVerified: user.isVerified,
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

export const getShowcaseUsers = catchAsync(async (req, res, next) => {
  // Get the 5 most-recently joined users that have a real avatar first,
  // then fall back to any recent users to fill up to 5 total
  const withAvatar = await User.find({ avatar: { $exists: true, $ne: "" } })
    .select("name avatar provider createdAt")
    .sort({ createdAt: -1 })
    .limit(5);

  let users = withAvatar;

  if (users.length < 5) {
    const withAvatarIds = users.map((u) => u._id);
    const rest = await User.find({ _id: { $nin: withAvatarIds } })
      .select("name avatar provider createdAt")
      .sort({ createdAt: -1 })
      .limit(5 - users.length);
    users = [...users, ...rest];
  }

  res.status(200).json({ success: true, users });
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
      avatar: user.avatar,
      isVerified: user.isVerified,
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
  const user = await AuthService.getUserById(req.user._id);

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
    },
  });
});

export const googleCallback = catchAsync(async (req, res) => {
  const user = req.user;
  
  // 1. Generate a secure, short-lived temporary code
  const tempCode = crypto.randomBytes(32).toString("hex");
  
  // 2. Store in Redis (valid for 60 seconds)
  // Mapping code -> userId
  await redis.set(`oauth_code:${tempCode}`, user._id.toString(), { ex: 60 });

  // 3. Redirect with the code
  res.redirect(
    `${process.env.FRONTEND_URL}/oauth-success?code=${tempCode}`
  );
});

export const exchangeCode = catchAsync(async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ message: "No exchange code provided" });
  }

  // 1. Verify code in Redis
  const userId = await redis.get(`oauth_code:${code}`);
  if (!userId) {
    return res.status(400).json({ message: "Invalid or expired exchange code" });
  }

  // 2. Consume the code (delete it so it can't be reused)
  await redis.del(`oauth_code:${code}`);

  // 3. Generate real tokens
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // 4. Store the refresh token in DB (Rotation logic)
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

  // 5. Set cookie and return access token
  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());
  
  res.status(200).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
    }
  });
});

export const forgotPassword = catchAsync(async(req, res) => {
  const { email } = req.body;

  //Let the service handle the logic
  const resetToken = await AuthService.generatePasswordResetToken(email);

  //Construct the URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  //For now, log it (Setting up emil is next step)
  await MailService.sendResetPasswordEmail(email, resetUrl);

  res.status(200).json({
    success: true,
    message: "A reset link has been sent to your email."
  });
});

export const resetPassword = catchAsync(async(req, res) => {
  const{ token } = req.params;
  const { password } = req.body;
  await AuthService.resetUserPassword(token, password);

  res.status(200).json({
    success: true,
    message: "Password reset successfully. You can now login with your new password."
  });
});