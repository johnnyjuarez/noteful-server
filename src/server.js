const knex = require('knex');
const app = require('./app');
// assign port based on env variable or default 8000
const { PORT, DB_URL } = require('./config');

const db = knex({
  client: 'pg',
  connection: DB_URL
});

app.set('db', db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});