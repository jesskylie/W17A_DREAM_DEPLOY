import { getData, setData } from "./dataStore.js";

/**
  * Clears the data store upon call
  * 
  * @param - no parameters
  *
  * @returns {{}} - empty object
*/

export function clear() {
  let data = getData();

  data.users = [];
  data.quizzes = [];

  setData(data);

  return {};
}
