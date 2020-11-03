const notesService = {
  getAllNotes(knex) {
    return knex.select('*').from('notes');
  },
  getById(knex, id) {
    return knex.from('notes').select('*').where('id', id).first();
  },
  insertNote(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into('notes')
      .returning('*')
      .then(rows => rows[0]);
  },
  deleteNotes(knex, id) {
    return knex('notes')
      .where({id})
      .delete();
  }
};

module.exports = notesService;