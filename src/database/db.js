const path = require('path');
const fs = require('fs');
const config = require('../config');

let dbInstance = null;

class NodeSqliteWrapper {
  constructor(dbPath) {
    const { DatabaseSync } = require('node:sqlite');
    this.rawDb = new DatabaseSync(dbPath);
    this.pragma('foreign_keys = ON');
    this.pragma('journal_mode = WAL');
  }

  prepare(sql) {
    const rawStmt = this.rawDb.prepare(sql);
    return {
      run: (...args) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        const result = rawStmt.run(...params);
        return {
          changes: result.changes,
          lastInsertRowid: Number(result.lastInsertRowid)
        };
      },
      get: (...args) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        const row = rawStmt.get(...params);
        return row || undefined;
      },
      all: (...args) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return rawStmt.all(...params);
      }
    };
  }

  exec(sql) {
    return this.rawDb.exec(sql);
  }

  pragma(pragmaStr) {
    return this.rawDb.exec(`PRAGMA ${pragmaStr}`);
  }

  transaction(fn) {
    return (...args) => {
      this.exec('BEGIN IMMEDIATE');
      try {
        const result = fn(...args);
        this.exec('COMMIT');
        return result;
      } catch (err) {
        try {
          this.exec('ROLLBACK');
        } catch (_) {}
        throw err;
      }
    };
  }

  close() {
    return this.rawDb.close();
  }
}

function getDatabase(customPath) {
  if (customPath) {
    return createDatabaseConnection(customPath);
  }
  if (!dbInstance) {
    dbInstance = createDatabaseConnection(config.databasePath);
  }
  return dbInstance;
}

function createDatabaseConnection(dbPath) {
  // Ensure the directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    const BetterSqlite3 = require('better-sqlite3');
    const db = new BetterSqlite3(dbPath, { verbose: false });
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
    return db;
  } catch (err) {
    // If better-sqlite3 is not available (e.g. Node 24 native build fallback), use Node's built-in SQLite
    return new NodeSqliteWrapper(dbPath);
  }
}

module.exports = {
  getDatabase,
  createDatabaseConnection
};
