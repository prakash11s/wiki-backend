require('dotenv').config()

module.exports = {
  development: {
    databases :{
      main_database : {
        username: process.env.MAIN_DB_CONNECTION,
        password: process.env.MAIN_DB_PASSWORD,
        database: process.env.MAIN_DB_NAME,
        host: process.env.MAIN_HOST_NAME,
        dialect: process.env.MAIN_DB_CONNECTION
      },
      library_database : {
        username: process.env.LIBRARY_DB_CONNECTION,
        password: process.env.LIBRARY_DB_PASSWORD,
        database: process.env.LIBRARY_DB_NAME,
        host: process.env.LIBRARY_HOST_NAME,
        dialect: process.env.LIBRARY_DB_CONNECTION
      }
    }
  },
  staging: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.HOST_NAME,
    dialect: process.env.DB_CONNECTION,
    logging: false
  },
  pre_prod: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.HOST_NAME,
    dialect: process.env.DB_CONNECTION,
    logging: false
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.HOST_NAME,
    dialect: process.env.DB_CONNECTION,
    logging: false
  },
  SERVER_STATUS: 'up'
}
