export function loadTransactions() {
  // input: nothing
  // output: array of transactions (If no transactions, empty array)
  // code logic: get data from localStorage, parse JSON and return an array
  const getarray = localStorage.getItem("app:transactions");
  if (getarray) {
    const parsed = JSON.parse(getarray);
    return parsed;
  } else {
    return []; //return array
  }
}

export function saveTransactions(transactionArray) {
  // input: array of transactions (when addTransaction is clicked)
  // Ouput: nothing returns or true, if function is successful
  //code logic: save added transactions to localStorage
  //ONLY SAVE IF ARRAY IS VALID
  localStorage.setItem(
    "app:transactions",
    JSON.stringify(transactionArray ?? []), //if undefined, save empty array
  );
}

export function loadSettings() {
  //input: nothing
  //ouptut: Object with settings from localStorage
  // code logic: load settings from localStorage (object). Empty Object if none
  const getsettings = localStorage.getItem("app:settings");
  if (getsettings) {
    const parsed = JSON.parse(getsettings);
    return parsed;
  } else {
    return {}; //return object, not array([])
  }
}
export function saveSettings(settingsObject) {
  //input: addition to object
  //output: nothing
  //code logic: Save added settings to localStorage
  localStorage.setItem("app:settings", JSON.stringify(settingsObject));
}
export function loadCategories() {
  //input: nothing
  //output: array of categories (if none, empty array)
  //logic: load object with categories from localStorage.
  const getCategories = localStorage.getItem("app:categories");
  if (getCategories) {
    const parsed = JSON.parse(getCategories);
    return parsed;
  } else {
    return [];
  }
}

export function saveCategories(categoriesObject) {
  //input: add full array of categories
  //output: nothing
  //logic: save added categories
  localStorage.setItem("app:categories", JSON.stringify(categoriesObject));
}
//for testing...
