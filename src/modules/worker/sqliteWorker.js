import { log, error } from "@/modules/Logger"
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

let db;
let sqlite3;

onmessage = function dispatch({ data }) {
  switch (data.type) {
    case "upload":
      try {
        sqlite3.oo1.OpfsDb.importDb('jsboilerplate.sqlite3', data.buffer);
      } catch (e) {
        error(e);
      }
      break;
    case "download":
      const byteArray = sqlite3.capi.sqlite3_js_db_export(db);
      const blob = new Blob([byteArray.buffer], { type: "application/x-sqlite3" });
      postMessage(blob);
      break;
    case "get":
      getAnimals();
      break;
    case "post":
      insertAnimal(data.animal);
      break;
    default:
      log(data)
  }
}

sqlite3InitModule({
  print: log,
  printErr: error,
}).then((sqlite) => {
  sqlite3 = sqlite;
  try {
    log('Running SQLite3 version', sqlite3.version.libVersion);
    if ('opfs' in sqlite3) {
      db = new sqlite3.oo1.OpfsDb('/jsboilerplate.sqlite3');
      log('OPFS is available, created persisted database at', db.filename);
    } else {
      db = new sqlite3.oo1.DB('/jsboilerplate.sqlite3', 'ct');
      log('OPFS is not available, created transient database', db.filename);
    }
    createTables();
  } catch (err) {
    error(err.name, err.message);
  }
});

function createTables() {
  return db.exec([
    "CREATE TABLE IF NOT EXISTS animals (id INTEGER PRIMARY KEY AUTOINCREMENT, animal VARCHAR(255) UNIQUE);"
  ]);
};

function insertAnimal(animal) {
  return executeQuery({
    text: "INSERT INTO animals(animal) VALUES ($1);",
    values: [animal],
  });
}

function getAnimals(id) {
  if (id) {
    executeQuery({
      text: "SELECT * FROM animals WHERE id = $1;",
      values: [id]
    });
  } else {
    executeQuery({
      text: "SELECT * FROM animals;",
    });
  }
}


function executeQuery({ text, values }) {
  var queryString = text;
  if (values) {
    values.forEach(function replacePlaceholder(item, index) {
      queryString = queryString.replace("$" + (index + 1), `'${item}'`);
    });
  }
  log(queryString)
  const resultRows = db.exec({ sql: queryString, returnValue: "resultRows" })
  postMessage(resultRows);
}