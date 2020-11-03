// ? node module dependencies
const path = require('path');
const express = require('express');
const xss = require('xss');
// ? service object
const foldersService = require('./folders-service');
// ? route dependencies
const foldersRouter = express.Router();
const jsonParser = express.json();
// ? serialized object
const serializeFolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name)
});

// ! '/api/folder/' routes
foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    foldersService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { folder_name } = req.body;
    const newFolder = {folder_name};

    // verify that data is being passed
    for(const [key, value] of Object.entries(newFolder))
      if(value === null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body`}
        });
        // insert folder object to database(table: folders)
    foldersService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

// ! '/api/folder/:folder_id' routes
foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    foldersService.getById(
      req.app.get('db'),
      req.params.folder_id
    )
      .then(folder => {
        // - folder id validation with response message
        if(!folder) {
          return res.status(404).json({
            error: { message: 'Folder doesn\'t exist' }
          });
        }
        // - respond with folder object
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeFolder(res.folder));
  });

module.exports = foldersRouter;