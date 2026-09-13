
exports.up = function(knex) {
    return knex.schema.alterTable('ongs', function (table) {
        table.string('password_hash');
    });
};

exports.down = function(knex) {
    // O dropColumn do knex recria a tabela no SQLite, o que quebra a foreign key de incidents.
    return knex.raw('ALTER TABLE ongs DROP COLUMN password_hash');
};
