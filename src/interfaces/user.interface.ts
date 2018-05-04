import { Document } from 'mongoose';

export interface User extends Document {
  facebook_id: string;
  first_name: string;
  last_name: string;
  timezone: number;
  gender: string;
}
