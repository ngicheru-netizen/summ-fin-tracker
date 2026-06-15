import { initTransactions, getTransactions } from "./state.js";

window.addEventListener("DOMContentLoaded", () => {
  //call initTransactions function
  initTransactions();
  //call getTransactions function
  const transactions = getTransactions(); //get the array

  console.log(transactions); //test
});
