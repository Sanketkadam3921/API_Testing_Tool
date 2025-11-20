import pkg from 'pg';
import config from './env.js';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: config.databaseUrl
})

pool.on('connect', () => {
    console.log("Connected to postgresql database")
})
pool.on('error', (err) => {
    console.error("Unexpected error on idle client", err)
    process.exit(-1)
})
export default pool;