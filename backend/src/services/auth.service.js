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

    if (!user.password && user.provider === "google") {
        const error = new Error("This account was created using Google. Please log in with Google.");
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
        const err = new Error("Invalid refresh token");
        err.statusCode = 401;
        throw err;
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
    user.refreshToken = user.refreshToken.filter(t => t.token !== hashedToken);

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    const newHashedToken = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    user.refreshToken.push({ token: newHashedToken });
    if(user.refreshToken.length > 5) {
        user.refreshToken.shift();
    }
    await user.save();

    // return {user: user accessToken: newAccessToken, refreshToken: newRefreshToken };
    return { user, accessToken:newAccessToken, refreshToken:newRefreshToken };
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

export const getUserById = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
    return user;
}

export const fetchAllUsers = async () => {
    return User.find().select("-password");
}

export const findOrCreateGoogleUser = async (profile) => {
    const email = profile?.emails[0]?.value;

    if (!email) {
        throw new Error("Google account did not provide an email");
    }

    let user = await User.findOne({
        $or: [
            { googleId: profile.id },
            { email }
        ]
    });

    if ( !user ) {
        user = await User.create({
            googleId: profile.id,
            email,
            name: profile.displayName || email.split("@")[0],
            avatar: profile.photos?.[0]?.value || "",
            provider: "google"
        });
    } else if (!user.googleId) {
        //existing email user linking google account
        user.googleId = profile.id;
        user.provider = "google";
        if (!user.name) {
            user.name = profile.displayName || email.split("@")[0];
        }
        await user.save();
    }

    // if an existing user log in but their name is still empty
    if (user && !user.name) {
        user.name = profile.displayName || email.split("@")[0];
        await user.save();
    }

    return user;
}