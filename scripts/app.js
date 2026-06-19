import { initTransactions } from "./state.js";
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
    .then((response) => response.json())
    .then((data) => {
      //save seed transactions (unwrap the { transactions: [...] } shape)
      localStorage.setItem(
        "app:transactions",
        JSON.stringify(data.transactions),
      );
    })
    .catch((error) => {
      console.error("Error loading seed.json:", error);
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
});
