import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: false,
    },
    email:{
        type:String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password:{
        type: String,
        // required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    googleId: {
        type: String,
        index: true
    },
    avatar: String,
    provider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    refreshToken: [
        {
            token: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
                expires: 7 * 24 * 60 * 60, // 7 days
            }
        },
    ],
} , {timestamps: true});

userSchema.pre("save", async function(next) {
    if(!this.isModified("password") || !this.password) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
})

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {id: this._id},
        process.env.ACCESS_SECRET,
        { expiresIn: process.env.ACCESS_EXPIRE || "1h" }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_EXPIRE || "7d" }
    )
}
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
}


const User = mongoose.model("User", userSchema);
export default User;