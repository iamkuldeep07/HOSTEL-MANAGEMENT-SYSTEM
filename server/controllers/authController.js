import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";

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
    if (!name || !email || !password || !contactNumber || !hostel || !roomNumber) {
      return next(new ErrorHandler("Please fill in all required fields.", 400));
    }

    if (!/^([a-zA-Z0-9._%+-]+)@nitm\.ac\.in$/.test(email)) {
      return next(new ErrorHandler("Only @nitm.ac.in email is allowed.", 400));
    }

    const existingVerified = await User.findOne({ email, accountVerified: true });
    if (existingVerified) {
      return next(new ErrorHandler("User already exists.", 400));
    }

    const unverifiedUsers = await User.find({ email, accountVerified: false });
    if (unverifiedUsers.length >= 5) {
      return next(new ErrorHandler("Too many attempts. Contact support.", 400));
    }

    if (password.length < 8 || password.length > 16) {
      return next(new ErrorHandler("Password must be 8–16 characters long.", 400));
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