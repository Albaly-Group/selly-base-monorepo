import { VercelRequest, VercelResponse } from '@vercel/node';

// Import the serverless setup
const { createNestServer, expressServer } = require('../dist/src/serverless');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize NestJS application
  await createNestServer();
  
  // Handle the request using Express
  return expressServer(req, res);
}