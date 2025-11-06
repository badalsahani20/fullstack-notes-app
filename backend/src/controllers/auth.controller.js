import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const registerUser = async (req, res, next) => {
    try {
        const {name, email, password} = req.body;
        
        //Check if user exists
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({message: "Email already exists, please login"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({name, email, password: hashedPassword});
        res.status(200).json({message: "User registered successfully", user});
    } catch (error) {
        next(error);
    }
}

export const loginUser = async(req, res, next) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message: "User does not exist"});

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({message: "Invalid credentials"});

        const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.json({ message : "Login successful", user, token});
    } catch (error) {
        next(error);
    }
}

export const getAllUsers = async(req, res, next) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        next(error);
    }
}
