import User from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
export const registerUser = async (userData) => {
    //Check for duplicates
    const existingUser = await User.findOne({ email: userData.email});
    if(existingUser) {
        const error = new Error("Email already exists, please Login");
        error.statusCode = 400;
        throw error;
    }

    //Data logic
    //he Model's .pre('save') hook handles the hashing automatically
    const user = await User.create(userData);
    return user;
}

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email }).select("+password");

    if(!user) {
        const error = new Error("Invalid credentials");
        error.statusCode = 400;
        throw error;
    }

    const isMatch = await user.comparePassword(password);
    if(!isMatch) {
        const error = new Error("Invalid credentials");
        error.statusCode = 400;
        throw error;
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    
    //Hash the refresh token before storing
    const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

    //Store the hashed refresh token in the database
    user.refreshToken.push({ token: hashedRefreshToken });
    await user.save();
    
    return { user, accessToken, refreshToken };
}

export const refreshAccessToken = async (refreshTokenFromCookie) => {
    if(!refreshTokenFromCookie) {
        const error = new Error("No refresh token provided");
        error.statusCode = 400;
        throw error;
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshTokenFromCookie, process.env.REFRESH_SECRET);
    } catch (error) {
        throw new Error("Invalid refresh token");
    }

    const user = await User.findById(decoded.id);
    
    //If no user -> reject
    if(!user) {
        const error = new Error("Invalid refresh token");
        error.statusCode = 401;
        throw error;
    }

    const hashedToken = crypto.createHash("sha256").update(refreshTokenFromCookie).digest("hex");

    const tokenExists = user.refreshToken.some(
        (t) => t.token === hashedToken
    );

    if(!tokenExists) {
        //Token reuse detected
        user.refreshToken = [];
        await user.save();

        const error = new Error("Refresh token reuse detected");
        error.statusCode = 403;
        throw error;
    }
    //Rotation
    user.refreshToken = user.refreshToken.filter((t) => t.token !== hashedToken);

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    const newHashedToken = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    user.refreshToken.push({ token: newHashedToken });
    await user.save();

    // return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    return { newAccessToken, newRefreshToken };
}

export const logoutUser = async (refreshTokenFromCookie) => {
    if(!refreshTokenFromCookie) {
        const error = new Error("No refresh token provided");
        error.statusCode = 400;
        throw error;
    }

    const hashedToken = crypto.createHash("sha256").update(refreshTokenFromCookie).digest("hex");

    await User.updateOne(
        { "refreshToken.token": hashedToken },
        { $pull: { refreshToken: { token: hashedToken } } }
    );
};