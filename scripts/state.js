import { loadTransactions, saveTransactions } from "./storage.js";

let transactions = []; //global variable that will be used in the three functions

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
      return { ...updatedData, updatedAt: new Date().toISOString() };
    }
    return transaction;
  });
  saveTransactions(transactions);
}
