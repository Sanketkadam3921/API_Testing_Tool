import dotenv from 'dotenv';

dotenv.config();

//basic validation plus sane defaults 
const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 4000,

    // we will add database + secrets in step two and three 
    databaseUrl: process.env.DATABASE_URL || "",
    jwtSecret: process.env.JWT_SECRET || 'change-me'
}

export default config;
