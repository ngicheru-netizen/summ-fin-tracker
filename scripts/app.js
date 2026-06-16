import { initTransactions, getTransactions } from "./state.js";
import {
  renderRecentTransactions,
  setupAddTransactionToggle,
  setupFormSubmission,
  setupCardClickListener,
} from "./ui.js";

function loadSeedData() {
  //if localStorage has data, don't load again. if not fetch from seed.json
  if (localStorage.getItem("app:transactions")) return Promise.resolve();

  return fetch("./seed.json")
    .then((response) => {
      console.log("fetch successful, response:", response);
      return response.json();
    })
    .then((data) => {
      // Save to localStorage
      console.log("Data loaded from seed.json", data);
      localStorage.setItem("app:transactions", JSON.stringify(data));
    })

    .catch((error) => {
      console.error("FETCH FAILED - Error loading seed.json:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    });
}

window.addEventListener("DOMContentLoaded", () => {
  //call initTransactions function
  loadSeedData().then(() => {
    initTransactions();
    renderRecentTransactions();
    setupAddTransactionToggle();
    setupFormSubmission();
    setupCardClickListener();
  });
  //call getTransactions function
  const transactions = getTransactions(); //get the array

  console.log(transactions); //test
});
