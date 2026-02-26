import User from "../models/user.model.js";

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
        const error = new Error("User does not exist");
        error.statusCode = 400;
        throw error;
    }

    const token = user.getSignedJwtToken();
    return { user, token }; 
}