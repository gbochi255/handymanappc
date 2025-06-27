
//const ENV = process.env.NODE_ENV || "test";
//const ENV = process.env.NODE_ENV || "development";
//require('dotenv').config({ path: `${__dirname}/../.env.${ENV}` });
require("dotenv").config({ path: `env.${process.env.NODE_ENV || "development"}` });
const { Pool, types } = require("pg");


//import pkg from "pg";
const ENV = process.env.NODE_ENV || "DEVELOPMENT";

const config = {};
if(ENV === "production"){
    config.connectionstring = process.env.DATABASE_URL;
    config.max = 2
}else {
    config.user = process.env.PGUSER;
    config.password = process.env.PGPASSWORD;
    config.host = process.env.PGHOST;
    config.port = process.env.PGPORT;
    config.database = process.env.PGDATABASE;
}

// Override DATE type parser (OID 1082)
types.setTypeParser(1082, (value) => value); // Return raw string (YYYY-MM-DD)
types.setTypeParser(1114, (value) => value); // TIMESTAMP
types.setTypeParser(1184, (value) => value); //TIMESTAMPTZ

//const PORT = process.env.PORT || 3000;

//if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  //throw new Error("No PGDATABASE or DATABASE_URL configured");
//} else {
  //console.log("connected to", process.env.PGDATABASE);
//}

//if (ENV === "production") {
  //config.connectionString = process.env.DATABASE_URL;
  //config.max = 2;
//}
console.log("Connecting with config:", {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
});

const db = new Pool(config);
module.exports = db
