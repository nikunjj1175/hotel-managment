import mongoose from 'mongoose';

// Subscription Plans
export interface ISubscriptionPlan {
  name: string;
  type: 'MONTHLY' | 'YEARLY' | 'TRIAL';
  price: number;
  features: string[];
  maxTables: number;
  maxStaff: number;
}

// Cafe Configuration
export interface ICafeConfig {
  kitchenEnabled: boolean;
  waiterEnabled: boolean;
  managerEnabled: boolean;
  customDomain?: string;
  paymentGateway?: {
    provider: string;
    keys: Record<string, string>;
  };
}

// Cafe Model
export interface ICafe {
  _id: string;
  name: string;
  logo?: string;
  address: string;
  contactNumber: string;
  contactEmail: string;
  subscriptionPlan: ISubscriptionPlan;
  config: ICafeConfig;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  paymentStatus: 'ACTIVE' | 'EXPIRED' | 'OVERDUE';
  createdAt: Date;
  updatedAt: Date;
}

// User Model (Updated)
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'CAFE_ADMIN' | 'KITCHEN' | 'WAITER' | 'MANAGER' | 'CUSTOMER' | 'DELIVERY';
  cafeId?: string; // For cafe-specific users
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

// Menu Category
export interface IMenuCategory {
  _id: string;
  cafeId: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

// Menu Item
export interface IMenuItem {
  _id: string;
  cafeId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  allergens?: string[];
  preparationTime: number; // in minutes
  sortOrder: number;
}

// Table Model
export interface ITable {
  _id: string;
  cafeId: string;
  tableNumber: number;
  slug: string;
  qrCode: string;
  isActive: boolean;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

// Order Model
export interface IOrder {
  _id: string;
  cafeId: string;
  tableId: string;
  customerId?: string;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
  }[];
  totalAmount: number;
  paymentMethod: 'ONLINE' | 'CASH';
  paymentStatus: 'PENDING' | 'PAID' | 'CASH_PENDING' | 'FAILED';
  orderStatus: 'PENDING' | 'ACCEPTED' | 'COOKING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: string; // Staff ID
  estimatedTime?: number; // in minutes
  customerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer Model
export interface ICustomer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  preferences?: {
    dietaryRestrictions: string[];
    favoriteItems: string[];
  };
  createdAt: Date;
}

// Staff Performance Model
export interface IStaffPerformance {
  _id: string;
  cafeId: string;
  staffId: string;
  date: Date;
  ordersHandled: number;
  averageOrderTime: number;
  customerRating?: number;
  notes?: string;
}

// Analytics Model
export interface IAnalytics {
  _id: string;
  cafeId: string;
  date: Date;
  totalOrders: number;
  totalRevenue: number;
  onlinePayments: number;
  cashPayments: number;
  averageOrderValue: number;
  topSellingItems: Array<{
    itemId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

// Mongoose Schemas
const subscriptionPlanSchema = new mongoose.Schema<ISubscriptionPlan>({
  name: { type: String, required: true },
  type: { type: String, enum: ['MONTHLY', 'YEARLY', 'TRIAL'], required: true },
  price: { type: Number, required: true },
  features: [{ type: String }],
  maxTables: { type: Number, required: true },
  maxStaff: { type: Number, required: true }
});

const cafeConfigSchema = new mongoose.Schema<ICafeConfig>({
  kitchenEnabled: { type: Boolean, default: true },
  waiterEnabled: { type: Boolean, default: true },
  managerEnabled: { type: Boolean, default: true },
  customDomain: String,
  paymentGateway: {
    provider: String,
    keys: mongoose.Schema.Types.Mixed
  }
});

const cafeSchema = new mongoose.Schema<ICafe>({
  name: { type: String, required: true },
  logo: String,
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  contactEmail: { type: String, required: true },
  subscriptionPlan: { type: subscriptionPlanSchema, required: true },
  config: { type: cafeConfigSchema, default: () => ({}) },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'DELETED'], default: 'ACTIVE' },
  paymentStatus: { type: String, enum: ['ACTIVE', 'EXPIRED', 'OVERDUE'], default: 'ACTIVE' }
}, { timestamps: true });

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['SUPER_ADMIN', 'CAFE_ADMIN', 'KITCHEN', 'WAITER', 'MANAGER', 'CUSTOMER', 'DELIVERY'], required: true },
  cafeId: String,
  permissions: [{ type: String }],
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' }
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    const bcrypt = await import('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

const menuCategorySchema = new mongoose.Schema<IMenuCategory>({
  cafeId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  image: String,
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
});

const menuItemSchema = new mongoose.Schema<IMenuItem>({
  cafeId: { type: String, required: true },
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: String,
  isAvailable: { type: Boolean, default: true },
  isVegetarian: { type: Boolean, default: false },
  allergens: [{ type: String }],
  preparationTime: { type: Number, default: 15 },
  sortOrder: { type: Number, default: 0 }
});

const tableSchema = new mongoose.Schema<ITable>({
  cafeId: { type: String, required: true },
  tableNumber: { type: Number, required: true },
  slug: { type: String, required: true },
  qrCode: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  capacity: { type: Number, default: 4 },
  status: { type: String, enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'], default: 'AVAILABLE' }
});

const orderSchema = new mongoose.Schema<IOrder>({
  cafeId: { type: String, required: true },
  tableId: { type: String, required: true },
  customerId: String,
  items: [{
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    specialInstructions: String
  }],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['ONLINE', 'CASH'], required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'CASH_PENDING', 'FAILED'], default: 'PENDING' },
  orderStatus: { type: String, enum: ['PENDING', 'ACCEPTED', 'COOKING', 'READY', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  assignedTo: String,
  estimatedTime: Number,
  customerNotes: String
}, { timestamps: true });

const customerSchema = new mongoose.Schema<ICustomer>({
  name: { type: String, required: true },
  email: String,
  phone: String,
  preferences: {
    dietaryRestrictions: [{ type: String }],
    favoriteItems: [{ type: String }]
  }
}, { timestamps: true });

const staffPerformanceSchema = new mongoose.Schema<IStaffPerformance>({
  cafeId: { type: String, required: true },
  staffId: { type: String, required: true },
  date: { type: Date, required: true },
  ordersHandled: { type: Number, default: 0 },
  averageOrderTime: { type: Number, default: 0 },
  customerRating: Number,
  notes: String
});

const analyticsSchema = new mongoose.Schema<IAnalytics>({
  cafeId: { type: String, required: true },
  date: { type: Date, required: true },
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  onlinePayments: { type: Number, default: 0 },
  cashPayments: { type: Number, default: 0 },
  averageOrderValue: { type: Number, default: 0 },
  topSellingItems: [{
    itemId: String,
    name: String,
    quantity: Number,
    revenue: Number
  }]
});

// Export models
export const Cafe = mongoose.models.Cafe || mongoose.model<ICafe>('Cafe', cafeSchema);
export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export const MenuCategory = mongoose.models.MenuCategory || mongoose.model<IMenuCategory>('MenuCategory', menuCategorySchema);
export const MenuItem = mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
export const Table = mongoose.models.Table || mongoose.model<ITable>('Table', tableSchema);
export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);
export const StaffPerformance = mongoose.models.StaffPerformance || mongoose.model<IStaffPerformance>('StaffPerformance', staffPerformanceSchema);
export const Analytics = mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', analyticsSchema);




