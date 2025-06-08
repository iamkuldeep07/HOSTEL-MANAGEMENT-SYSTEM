import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[\w.-]+@nitm\.ac\.in$/.test(v);
        },
        message: props => `${props.value} is not a valid NITM college email!`,
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Warden", "User"],
      default: "User",
    },
    accountVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    hostel: {
      type: String,
      enum: ["PhD Boys Hostel", "3 Seater Boys Hostel", "Girls Hostel"],
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
    },
    guardianContact: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Please enter a valid 10-digit guardian phone number"],
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateVerificationCode = function () {
    function generateRandomFiveDigitNumber() {
        const firstDigit = Math.floor(Math.random() * 9) + 1;
        const remainingDigits = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, 0);
        return parseInt(firstDigit + remainingDigits);  
    }
    const verificationCode = generateRandomFiveDigitNumber();
    this.verificationCode = verificationCode;
    this.verificationCodeExpire = Date.now() + 15 * 60 * 1000;
    return verificationCode;
};

export const User = mongoose.model("User", userSchema);