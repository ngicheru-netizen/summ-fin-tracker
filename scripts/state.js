import { loadTransactions, saveTransactions } from "./storage.js";

let transactions = []; //global variable that will be used in the functions

export function initTransactions() {
  //initiate transactions from app start

  transactions = loadTransactions();
}

export function addTransaction(newTx) {
  //new transaction added to array and saved.
  //array with transaction is then printed/shown.
  transactions.push(newTx);
  saveTransactions(transactions);
  return transactions;
}

export function getTransactions() {
  //loads most recent array
  return transactions;
}

export function deleteTransaction(deleteId) {
  transactions = transactions.filter((item) => item.id !== deleteId);

  saveTransactions(transactions);
}

export function updateTransaction(id, updatedData) {
  transactions = transactions.map((transaction) => {
    if (transaction.id === id) {
      return {
        //keeps original
        ...transaction,
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };
    }
    return transaction;
  });
  saveTransactions(transactions);
}

export function getTotalSpent() {
  let total = 0;
  for (const transaction of transactions) {
    total = total + transaction.amount;
  }
  return total;
}

export function getTotalSpentThisMonth() {
  const today = new Date();
  const thisMonth = today.getMonth() + 1;
  const thisYear = today.getFullYear();

  let total = 0;
  for (const transaction of transactions) {
    const parts = transaction.date.split("-");
    const txYear = Number(parts[0]);
    const txMonth = Number(parts[1]);

    if (txMonth === thisMonth && txYear === thisYear) {
      total = total + transaction.amount;
    }
  }
  return total;
}

export function getSpentbyCategory() {
  const categoryTotals = {};

  for (const transaction of transactions) {
    const cat = transaction.category;

    //if category doesn't exist, create one with 0
    if (!categoryTotals[cat]) {
      categoryTotals[cat] = 0;
    }
    categoryTotals[cat] = categoryTotals[cat] + transaction.amount;
  }
  return categoryTotals;
}
