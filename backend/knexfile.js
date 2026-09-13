require('dotenv').config({ quiet: true });

const migrations = {
    directory: './src/database/migrations'
};

module.exports = {

    development: {
        client: 'better-sqlite3',
        connection: {
            filename: process.env.DB_FILENAME || './src/database/db.sqlite'
        },
        migrations,
        useNullAsDefault: true,
    },

    test: {
        client: 'better-sqlite3',
        connection: {
            filename: ':memory:'
        },
        migrations,
        useNullAsDefault: true,
    },

};
