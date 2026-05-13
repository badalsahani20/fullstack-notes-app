import Notes from "../models/notes.model.js";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import getEffectiveDailyLimit from "../utils/getEffectiveDailyLimit.js";
    
export const getStats = catchAsync(async (req, res) => {
  const { user } = req;

  const notesCount = await Notes.countDocuments({ user: user._id });
  const today = new Date();
  today.setHours(0,0,0,0);

  const isNewDay = user?.aiUsage?.lastResetAt < today;

  const aiCount = isNewDay ? 0 : (user?.aiUsage?.dailyCount || 0);
  const limit = getEffectiveDailyLimit(user);
  
  res.status(200).json({
    success: true,
    stats:{
      notesCount,
      aiCount,
      limit,
      // User meta — already on req.user, no extra DB call needed
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      provider: user.provider,
      isVerified: user.isVerified,
      memberSince: user.createdAt,
    }
  })
})

export const updateProfile = catchAsync(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }

  const trimmedName = name.trim().slice(0, 50);

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { name: trimmedName },
    { new: true }
  ).select("name email avatar provider isVerified");

  res.status(200).json({
    success: true,
    message: "Profile updated",
    user: {
      id: updated._id,
      name: updated.name,
      email: updated.email,
      avatar: updated.avatar,
      isVerified: updated.isVerified,
      provider: updated.provider,
    }
  });
});