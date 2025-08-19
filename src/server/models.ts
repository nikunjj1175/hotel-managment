import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'KITCHEN' | 'DELIVERY';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['SUPER_ADMIN','ADMIN','KITCHEN','DELIVERY'], required: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  // @ts-ignore
  if (!this.isModified('password')) return next();
  // @ts-ignore
  const salt = await bcrypt.genSalt(10);
  // @ts-ignore
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);

const tableSchema = new Schema({
  tableNumber: { type: Number, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Table = mongoose.models.Table || mongoose.model('Table', tableSchema);

const menuItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
  cloudinaryPublicId: { type: String },
  category: { type: String, index: true },
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);

const orderItemSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  nameSnapshot: { type: String },
  priceSnapshot: { type: Number },
  quantity: { type: Number, default: 1 },
  notes: { type: String }
}, { _id: false });

const orderSchema = new Schema({
  table: { type: Schema.Types.ObjectId, ref: 'Table', required: true },
  status: { type: String, enum: ['NEW','ACCEPTED','IN_PROGRESS','COMPLETED','DELIVERED','PAID','CANCELLED'], default: 'NEW', index: true },
  items: [orderItemSchema],
  subtotalAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  payments: [{ method: { type: String, enum: ['CASH','CARD','UPI'] }, amount: Number, reference: String, paidAt: { type: Date, default: Date.now } }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  acceptedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deliveredBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

orderSchema.methods.recalculateTotals = function() {
  // @ts-ignore
  const subtotal = this.items.reduce((sum: number, it: any) => sum + (it.priceSnapshot || 0) * (it.quantity || 1), 0);
  // @ts-ignore
  this.subtotalAmount = subtotal;
  // @ts-ignore
  this.taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
  // @ts-ignore
  this.totalAmount = this.subtotalAmount + this.taxAmount;
};

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);


