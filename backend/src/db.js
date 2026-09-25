import mongoose from 'mongoose'
import { config } from './config.js'
import dns from "dns";

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);


export async function connectDb() {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is not configured')
  }
  mongoose.set('strictQuery', true)
  await mongoose.connect(config.mongodbUri)
}
