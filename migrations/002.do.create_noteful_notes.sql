CREATE TABLE notes (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  notes_name TEXT NOT NULL,
  date_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  description TEXT NOT NULL,
  folder_id INTEGER REFERENCES folders(id) ON DELETE CASCADE NOT NULL
);