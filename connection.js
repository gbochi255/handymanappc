

import dotenv from "dotenv";
dotenv.config({ path: `./.env.${process.env.NODE_ENV || "development"}` });
//import "dotenv/config";

import pkg from"pg";
const { Pool, types } = pkg;


const config = process.env.DATABASE_URL
? { connectionString: process.env.DATABASE_URL, 
  max: 2 }
: {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT), //cast to Number
  database: process.env.PGDATABASE,
};


// Override DATE type parser (OID 1082)
types.setTypeParser(1082, (value) => value); // Return raw string (YYYY-MM-DD)
types.setTypeParser(1114, (value) => value); // TIMESTAMP
types.setTypeParser(1184, (value) => value); //TIMESTAMPTZ


console.log("Connecting to DB with config:", config)
 

const db = new Pool(config);
export default db;
