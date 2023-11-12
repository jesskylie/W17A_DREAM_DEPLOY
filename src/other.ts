import { getData, setData, DataStore } from './dataStore';
import { saveDataInFile } from './library/functions';

/**
 * Clears the data store upon call
 *
 * @param - no parameters
 *
 * @returns {{}} - empty object
 */

export function clear(): Record<string, never> {
  const data = getData();

  data.users = [];
  data.quizzes = [];

  setData(data);

  return {};
}

export function newClear(): Record<string, never> {
  const data: DataStore = {
    users: [],
    quizzes: [],
    trash: [],
    quizzesCopy: [],
  };

  saveDataInFile(data);

  return {};
}
