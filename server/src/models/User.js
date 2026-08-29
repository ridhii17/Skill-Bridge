import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CANDIDATE,
    },
    avatar: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Hash password before saving ──────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance: compare passwords ──────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance: generate access token ──────────────────
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiry }
  );
};

// ─── Instance: generate refresh token ─────────────────
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry }
  );
};

// ─── Instance: store refresh token ────────────────────
userSchema.methods.addRefreshToken = async function (token) {
  // Keep only the last 5 refresh tokens
  this.refreshTokens.push(token);
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  await this.save({ validateBeforeSave: false });
};

// ─── Instance: remove refresh token ───────────────────
userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter((t) => t !== token);
  await this.save({ validateBeforeSave: false });
};

// ─── Indexes ──────────────────────────────────────────
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

export default User;
