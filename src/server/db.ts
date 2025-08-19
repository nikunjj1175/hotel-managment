import mongoose from 'mongoose';

let isConnected = false;

export async function connectDb() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI || '';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: true });
  isConnected = true;
}


