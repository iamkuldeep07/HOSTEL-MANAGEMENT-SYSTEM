import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendToken } from "../utils/sendToken.js";
import { generateResetPasswordEmailTemplate } from "../utils/emailTemplate.js";
import { sendEmail } from "../utils/sendEmail.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      contactNumber,
      guardianContact,
      hostel,
      roomNumber,
      department,
      semester,
      gender,
    } = req.body;

    // Check required fields
    if (
      !name ||
      !email ||
      !password ||
      !contactNumber ||
      !hostel ||
      !roomNumber
    ) {
      return next(new ErrorHandler("Please fill in all required fields.", 400));
    }

    if (!/^([a-zA-Z0-9._%+-]+)@nitm\.ac\.in$/.test(email)) {
      return next(new ErrorHandler("Only @nitm.ac.in email is allowed.", 400));
    }

    const existingVerified = await User.findOne({
      email,
      accountVerified: true,
    });
    if (existingVerified) {
      return next(new ErrorHandler("User already exists.", 400));
    }

    const unverifiedUsers = await User.find({ email, accountVerified: false });
    if (unverifiedUsers.length >= 5) {
      return next(new ErrorHandler("Too many attempts. Contact support.", 400));
    }

    if (password.length < 8 || password.length > 16) {
      return next(
        new ErrorHandler("Password must be 8–16 characters long.", 400)
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      contactNumber,
      guardianContact,
      hostel,
      roomNumber,
      department,
      semester,
      gender,
    });

    const verificationCode = user.generateVerificationCode();
    await user.save();

    sendVerificationCode(verificationCode, email, res);
  } catch (error) {
    next(error);
  }
});

export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorHandler("Email or OTP is missing.", 400));
  }

  try {
    // Find all unverified user entries for the email, most recent first
    const userAllEntries = await User.find({
      email,
      accountVerified: false,
    }).sort({ createdAt: -1 });

    if (!userAllEntries || userAllEntries.length === 0) {
      return next(new ErrorHandler("User not found or already verified.", 404));
    }

    let user = userAllEntries[0];

    // Remove older unverified duplicates
    if (userAllEntries.length > 1) {
      await User.deleteMany({
        _id: { $ne: user._id },
        email,
        accountVerified: false,
      });
    }

    // Validate OTP
    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP.", 400));
    }

    // Check if OTP expired
    if (Date.now() > new Date(user.verificationCodeExpire).getTime()) {
      return next(new ErrorHandler("OTP expired.", 400));
    }

    // Mark user as verified
    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;

    await user.save({ validateModifiedOnly: true });

    // Send token after successful verification
    sendToken(user, 200, "Account Verified.", res);
    
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Internal Server Error.", 500));
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter all Fields.", 400));
  }

  const user = await User.findOne({ email, accountVerified: true }).select("+password");
  
  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password.", 400));
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password.", 400));
  }

  sendToken(user, 200, "User login successfully.", res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully.",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.email){
    return next(new ErrorHandler("Email is required.", 400));
  }
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });
  if (!user) {
    return next(new ErrorHandler("Invalid email.", 400));
  }
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = generateResetPasswordEmailTemplate(resetPasswordUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "NITM Hostel Management System Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  } 
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if(!user){
      return next(new ErrorHandler("Reset Password token is invalid or has been expired.", 400));
    }
    if(req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password and Confirm Password do not match.", 400));
    }
    if (
      req.body.password.length < 8 || req.body.password.length > 16 || req.body.confirmPassword.length < 8 || req.body.confirmPassword.length > 16) {
        return next(new ErrorHandler("Password must be between 8 and 16 characters.", 400));
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      sendToken(user, 200, "Password reset successfully.", res);
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please enter all fields.", 400));
  }
  const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);
  if(!isPasswordMatched){
    return next(new ErrorHandler("Current password is incorrect.", 400));
  }
  if(newPassword.length < 8 || newPassword.length > 16 || confirmNewPassword.length < 8 || confirmNewPassword.length > 16) {
    return next(new ErrorHandler("Password must be between 8 and 16 characters.", 400));
  }
  if(newPassword !== confirmNewPassword){
    return next(new ErrorHandler("New password and confirm new password do not match.", 400));
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password updated"
  });
});