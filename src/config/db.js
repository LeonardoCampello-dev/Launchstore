const { Pool } = require('pg')

module.exports = new Pool ({
    user: "Leonardo",
    password: "1595763",
    host: "localhost",
    port: 5432,
    database: "launchstore"
})