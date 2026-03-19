import User from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const hashRefreshToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

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
    const hashedRefreshToken = hashRefreshToken(refreshToken);

    //Store the hashed refresh token in the database without saving the whole document
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

    const hashedToken = hashRefreshToken(refreshTokenFromCookie);

    const tokenExists = user.refreshToken.some(
        (t) => t.token === hashedToken
    );

    if(!tokenExists) {
        //Likely a stale/replayed token. Clear server-side sessions defensively.
        await User.updateOne({ _id: user._id }, { $set: { refreshToken: [] } });

        const error = new Error("Refresh token reuse detected");
        error.statusCode = 403;
        throw error;
    }
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    const newHashedToken = hashRefreshToken(newRefreshToken);
    const rotatedTokens = [...user.refreshToken.filter((t) => t.token !== hashedToken), { token: newHashedToken }].slice(-5);

    const rotationResult = await User.updateOne(
        { _id: user._id, "refreshToken.token": hashedToken },
        { $set: { refreshToken: rotatedTokens } }
    );

    if (rotationResult.modifiedCount === 0) {
        const error = new Error("Refresh token already rotated");
        error.statusCode = 401;
        throw error;
    }

    // return {user: user accessToken: newAccessToken, refreshToken: newRefreshToken };
    return { user, accessToken:newAccessToken, refreshToken:newRefreshToken };
}

export const logoutUser = async (refreshTokenFromCookie) => {
    if(!refreshTokenFromCookie) {
        const error = new Error("No refresh token provided");
        error.statusCode = 400;
        throw error;
    }

    const hashedToken = hashRefreshToken(refreshTokenFromCookie);

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
