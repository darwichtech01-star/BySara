import 'server-only';
import { Pool } from 'pg';
import {assertDatabaseTarget,parseTarget} from '@/lib/runtime-target';
let pool:Pool|undefined;
export function getPool():Pool{
 const connectionString=process.env.DATABASE_URL;
 if(!connectionString)throw new Error('DATABASE_URL is not configured');
 // Bind the URL to an actual greenfield branch, not just a database with the same name.
 assertDatabaseTarget(connectionString,parseTarget(process.env.BY_SARA_TARGET));
 return pool ??= new Pool({connectionString,ssl:{rejectUnauthorized:true},max:5,connectionTimeoutMillis:7000,
   idleTimeoutMillis:15000,statement_timeout:8000});
}
