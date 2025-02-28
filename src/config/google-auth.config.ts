import { OAuth2Client } from 'google-auth-library';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env.development.local',
});

export const oauth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI,
);
