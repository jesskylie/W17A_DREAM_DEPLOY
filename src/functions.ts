// a file in which to store functions which
// are called regularly throughout the application

// import libraries
import fs from 'fs';

// constants used throughout this file

const DATASTORE_FILENAME = 'database.json';

// import types from src/dataStore

import { DataStore } from './dataStore';

interface getDataReturnObject {
  result: boolean;
  data: DataStore | {};
}

/**
 * get data with type DataStore from src/database.json
 *
 * @param {array} dataStore - type DataStore
 *
 * @returns {{nothing: array}} - an empty object
 */
export const saveDataInFile = (dataStore: DataStore): Record<string, never> => {
  fs.writeFileSync(DATASTORE_FILENAME, JSON.stringify(dataStore));

  return {};
};

/**
 * get data with type DataStore from src/database.json
 * first checks if the file DATASTORE_FILENAME exists
 *
 * @param {}
 *
 * @returns {{returnObj: array}} - type getDataReturnObject
 * an object consisting of the result of the function
 * {
 *   result: boolean:
 *     true if the file DATASTORE_FILENAME exists,
 *     false if not
 *   data:
 *     if the file exists: the data from the file DATASTORE_FILENAME
 *     if the file does not exist: an empty object
 * }
 */
const getDataFromFile = (): getDataReturnObject => {
  // inspiration for checking if file exists taken from
  // https://byby.dev/node-check-if-file-exists
  if (fs.existsSync(DATASTORE_FILENAME)) {
    const jsonString = fs.readFileSync(DATASTORE_FILENAME);
    const data: DataStore = JSON.parse(String(jsonString));

    const returnObj = {
      result: true,
      data: data,
    };

    return returnObj;
  }

  const returnObj = {
    result: false,
    data: {},
  };

  return returnObj;
};

/**
 * Iteration 2 - new data retrieval system
 * Retrives data from local file
 * Uses getDataFromFile() imported from './functions.ts'
 * @param - nil
 * @returns {array} type DataStore
 */
export function retrieveDataFromFile(): DataStore {
  const dataStoreObj = getDataFromFile();

  let data: DataStore;

  if (!dataStoreObj.result) {
    data = { users: [], quizzes: [] };
  } else {
    data = dataStoreObj.data as DataStore;
  }

  return data;
}
