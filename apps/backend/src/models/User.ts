import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser extends Document {
  email: string;
  password: string;
  passwordConfirm?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: 'user' | 'trainer' | 'admin';
  active: boolean;
  verified: boolean;
  
  // Profile information
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  medicalConditions?: string[];
  phone?: string;
  
  // Security fields
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  
  // Two-Factor Authentication
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  
  // Payment and billing
  stripeCustomerId?: string;
  
  // GDPR Compliance
  gdprConsents?: Array<{
    consentId: string;
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    version: string;
  }>;
  dataRetentionUntil?: Date;
  deletedAt?: Date;
  deletionReason?: string;
  deletionRequestId?: string;
  lastModified?: Date;
  
  // Subscription and preferences
  subscription?: {
    plan: 'free' | 'premium' | 'pro';
    startDate: Date;
    endDate?: Date;
    autoRenew: boolean;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      workout: boolean;
      social: boolean;
      marketing: boolean;
    };
    privacy: {
      profileVisible: boolean;
      workoutVisible: boolean;
      progressVisible: boolean;
    };
    units: {
      weight: 'kg' | 'lbs';
      distance: 'km' | 'miles';
      temperature: 'celsius' | 'fahrenheit';
    };
  };

  // Instance methods
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
  createEmailVerificationToken(): string;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  isLocked(): boolean;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    validate: {
      validator: function(password: string) {
        // Password must contain at least one uppercase letter, one lowercase letter, one number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
      },
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    },
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(this: IUser, passwordConfirm: string) {
        return passwordConfirm === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [50, 'Name must be less than 50 characters']
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name must be less than 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name must be less than 50 characters']
  },
  phone: {
    type: String,
    validate: {
      validator: function(phone: string) {
        return !phone || /^\+?[1-9]\d{1,14}$/.test(phone);
      },
      message: 'Please provide a valid phone number'
    }
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'trainer', 'admin'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  
  // Profile information
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  height: {
    type: Number,
    min: [50, 'Height must be at least 50cm'],
    max: [300, 'Height must be less than 300cm']
  },
  weight: {
    type: Number,
    min: [20, 'Weight must be at least 20kg'],
    max: [500, 'Weight must be less than 500kg']
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  goals: [{
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness']
  }],
  medicalConditions: [String],
  
  // Security fields
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastLogin: Date,
  
  // Two-Factor Authentication
  twoFactorSecret: {
    type: String,
    select: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  // Payment and billing
  stripeCustomerId: {
    type: String,
    sparse: true,
    index: true
  },
  
  // GDPR Compliance
  gdprConsents: [{
    consentId: {
      type: String,
      required: true
    },
    essential: {
      type: Boolean,
      required: true,
      default: true
    },
    analytics: {
      type: Boolean,
      default: false
    },
    marketing: {
      type: Boolean,
      default: false
    },
    preferences: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    version: {
      type: String,
      default: '1.0'
    }
  }],
  dataRetentionUntil: Date,
  deletedAt: Date,
  deletionReason: String,
  deletionRequestId: String,
  lastModified: {
    type: Date,
    default: Date.now
  },
  
  // Subscription
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: false
    }
  },
  
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      workout: { type: Boolean, default: true },
      social: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    privacy: {
      profileVisible: { type: Boolean, default: true },
      workoutVisible: { type: Boolean, default: true },
      progressVisible: { type: Boolean, default: false }
    },
    units: {
      weight: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
      distance: { type: String, enum: ['km', 'miles'], default: 'km' },
      temperature: { type: String, enum: ['celsius', 'fahrenheit'], default: 'celsius' }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user age
userSchema.virtual('age').get(function(this: IUser) {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual for BMI
userSchema.virtual('bmi').get(function(this: IUser) {
  if (!this.height || !this.weight) return null;
  const heightInMeters = this.height / 100;
  return Math.round((this.weight / (heightInMeters * heightInMeters)) * 10) / 10;
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ active: 1 });
userSchema.index({ verified: 1 });
userSchema.index({ 'subscription.plan': 1 });

// Middleware
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Instance methods
userSchema.methods.correctPassword = async function(candidatePassword: string, userPassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp: number): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt((this.passwordChangedAt.getTime() / 1000).toString(), 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function(): string {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  return verificationToken;
};

userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    (updates as any).$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

userSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

export const User = mongoose.model<IUser>('User', userSchema);