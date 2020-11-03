// ? node module dependencies
const path = require('path');
const express = require('express');
const xss = require('xss');
const logger = require('../../logger');
// ? service object
const notesService = require('./notes-service');
// ? route dependencies
const notesRouter = express.Router();
const jsonParser = express.json();
// ? serialized object
const serializeNote = note => ({
  id: note.id,
  notes_name: xss(note.notes_name),
  date_modified: note.date_modified,
  description: xss(note.description),
  folder_id: note.folder_id
});

notesRouter
  .route('/')
  .get((req, res, next) => {
    notesService.getAllNotes(req.app.get('db'))
      .then(notes => {
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { notes_name, date_modified, folder_id, description } = req.body;
    const newNote = {notes_name, date_modified, folder_id, description};

    for(const [key, value] of Object.entries(newNote))
      if(value === null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body`}
        });
    notesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res.status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    notesService.getById(
      req.app.get('db'),
      req.params.note_id
    )
      .then(note => {
        if(!note) {
          return res.status(404).json({
            error: { message: 'Note doesn\'t exist' }
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    const { note_id } = req.params;
    notesService.deleteNotes(
      req.app.get('db'),
      note_id
    )
      .then(rowsAffected => {
        logger.info(`Note with id ${note_id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;