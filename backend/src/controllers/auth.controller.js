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
  const { user, token } = await AuthService.loginUser(email, password);

  res.status(200).json({
    success: true,
    token,
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
