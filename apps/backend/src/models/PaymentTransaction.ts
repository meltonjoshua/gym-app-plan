import mongoose, { Document, Schema } from 'mongoose';

// Payment transaction types
export enum TransactionType {
  SUBSCRIPTION = 'subscription',
  ONE_TIME = 'one_time',
  REFUND = 'refund',
  CREDIT = 'credit'
}

// Payment transaction status
export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded'
}

// Payment methods
export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  OTHER = 'other'
}

export interface IPaymentTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeInvoiceId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number; // Amount in cents
  currency: string;
  description: string;
  paymentMethod: PaymentMethod;
  paymentMethodDetails: Record<string, any>;
  metadata: Record<string, any>;
  failureReason?: string;
  refundedAmount: number; // Amount refunded in cents
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  
  // Virtual fields
  amountFormatted: string;
  refundedAmountFormatted: string;
  isSuccessful: boolean;
  canRefund: boolean;
  
  // Methods
  formatAmount(amount?: number): string;
  canBeRefunded(): boolean;
  getReceiptData(): any;
}

const paymentTransactionSchema = new Schema<IPaymentTransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    sparse: true,
    index: true
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true,
    index: true
  },
  stripeChargeId: {
    type: String,
    sparse: true,
    index: true
  },
  stripeInvoiceId: {
    type: String,
    sparse: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(TransactionStatus),
    required: true,
    default: TransactionStatus.PENDING
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'usd',
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true
  },
  paymentMethodDetails: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  failureReason: {
    type: String,
    trim: true
  },
  refundedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: Formatted amount in dollars
paymentTransactionSchema.virtual('amountFormatted').get(function(this: IPaymentTransaction) {
  return this.formatAmount(this.amount);
});

// Virtual: Formatted refunded amount in dollars
paymentTransactionSchema.virtual('refundedAmountFormatted').get(function(this: IPaymentTransaction) {
  return this.formatAmount(this.refundedAmount);
});

// Virtual: Check if transaction is successful
paymentTransactionSchema.virtual('isSuccessful').get(function(this: IPaymentTransaction) {
  return this.status === TransactionStatus.SUCCEEDED;
});

// Virtual: Check if transaction can be refunded
paymentTransactionSchema.virtual('canRefund').get(function(this: IPaymentTransaction) {
  return this.canBeRefunded();
});

// Method: Format amount to currency string
paymentTransactionSchema.methods.formatAmount = function(this: IPaymentTransaction, amount?: number): string {
  const amountToFormat = amount !== undefined ? amount : this.amount;
  const dollars = amountToFormat / 100;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency.toUpperCase(),
    minimumFractionDigits: 2
  }).format(dollars);
};

// Method: Check if transaction can be refunded
paymentTransactionSchema.methods.canBeRefunded = function(this: IPaymentTransaction): boolean {
  // Can only refund successful transactions
  if (this.status !== TransactionStatus.SUCCEEDED) return false;
  
  // Can't refund if already fully refunded
  if (this.refundedAmount >= this.amount) return false;
  
  // Can't refund transactions older than 120 days (Stripe limit)
  const maxRefundAge = 120 * 24 * 60 * 60 * 1000; // 120 days in milliseconds
  const transactionAge = Date.now() - this.createdAt.getTime();
  if (transactionAge > maxRefundAge) return false;
  
  // Can't refund certain transaction types
  if (this.type === TransactionType.REFUND || this.type === TransactionType.CREDIT) return false;
  
  return true;
};

// Method: Get receipt data for user
paymentTransactionSchema.methods.getReceiptData = function(this: IPaymentTransaction) {
  return {
    transactionId: this._id,
    stripePaymentIntentId: this.stripePaymentIntentId,
    amount: this.amountFormatted,
    currency: this.currency.toUpperCase(),
    description: this.description,
    status: this.status,
    paymentMethod: this.paymentMethod,
    processedAt: this.processedAt,
    createdAt: this.createdAt,
    refundedAmount: this.refundedAmountFormatted,
    metadata: this.metadata
  };
};

// Indexes for performance and queries
paymentTransactionSchema.index({ userId: 1, createdAt: -1 });
paymentTransactionSchema.index({ subscriptionId: 1, createdAt: -1 });
paymentTransactionSchema.index({ status: 1, createdAt: -1 });
paymentTransactionSchema.index({ stripePaymentIntentId: 1 });
paymentTransactionSchema.index({ stripeChargeId: 1 });
paymentTransactionSchema.index({ stripeInvoiceId: 1 });
paymentTransactionSchema.index({ type: 1, status: 1 });
paymentTransactionSchema.index({ createdAt: -1 });

// Pre-save middleware to set processedAt when status becomes succeeded
paymentTransactionSchema.pre('save', function(this: IPaymentTransaction, next) {
  if (this.isModified('status') && this.status === TransactionStatus.SUCCEEDED && !this.processedAt) {
    this.processedAt = new Date();
  }
  next();
});

export const PaymentTransaction = mongoose.model<IPaymentTransaction>('PaymentTransaction', paymentTransactionSchema);
export default PaymentTransaction;
