import { initTransactions, getTransactions } from "./state.js";
import {
  renderRecentTransactions,
  setupAddTransactionToggle,
  setupFormSubmission,
} from "./ui.js";

// Temporary seed data for testing
const seedData = [
  {
    id: "txn_001",
    description: "Coffee",
    amount: 5.5,
    category: "Food",
    date: "2025-09-25",
    createdAt: "2025-09-25T08:00:00Z",
    updatedAt: "2025-09-25T08:00:00Z",
  },
  {
    id: "txn_002",
    description: "Gas",
    amount: 45.0,
    category: "Transport",
    date: "2025-09-24",
    createdAt: "2025-09-24T10:00:00Z",
    updatedAt: "2025-09-24T10:00:00Z",
  },
  {
    id: "txn_003",
    description: "Groceries",
    amount: 82.75,
    category: "Food",
    date: "2025-09-23",
    createdAt: "2025-09-23T14:30:00Z",
    updatedAt: "2025-09-23T14:30:00Z",
  },
  {
    id: "txn_004",
    description: "Phone Data Bundle",
    amount: 12.0,
    category: "Utilities",
    date: "2025-09-22",
    createdAt: "2025-09-22T09:15:00Z",
    updatedAt: "2025-09-22T09:15:00Z",
  },
  {
    id: "txn_005",
    description: "Uber Ride",
    amount: 18.4,
    category: "Transport",
    date: "2025-09-21",
    createdAt: "2025-09-21T19:45:00Z",
    updatedAt: "2025-09-21T19:45:00Z",
  },
  {
    id: "txn_006",
    description: "Movie Ticket",
    amount: 9.99,
    category: "Entertainment",
    date: "2025-09-20",
    createdAt: "2025-09-20T16:20:00Z",
    updatedAt: "2025-09-20T16:20:00Z",
  },
];

// Save to localStorage
localStorage.setItem("app:transactions", JSON.stringify(seedData));
window.addEventListener("DOMContentLoaded", () => {
  //call initTransactions function
  initTransactions();
  renderRecentTransactions();
  setupAddTransactionToggle();
  setupFormSubmission();
  //call getTransactions function
  const transactions = getTransactions(); //get the array

  console.log(transactions); //test
});
