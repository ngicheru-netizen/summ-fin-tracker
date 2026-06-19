import { loadTransactions, saveTransactions } from "./storage.js";

let transactions = []; //global variable that will be used in the functions

export function initTransactions() {
  //initiate transactions from app start

  transactions = loadTransactions();
}

export function addTransaction(newTx) {
  //new transaction added to array and saved.
  //Every amount is stored in USD - saves me the headache.
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

export function importTransactions(jsonString) {
  try {
    const importedData = JSON.parse(jsonString);

    if (!importedData || !Array.isArray(importedData.transactions)) {
      alert("Invalid!");
      return;
    }
    saveTransactions(importedData.transactions);
  } catch (error) {
    alert("Invalid JSON");
    console.log("Invalid JSON!");
    return;
  }
}
export function exportTransactions(transactionsArray) {
  const exported = { transactions: transactionsArray };
  const exportedJSON = JSON.stringify(exported);
  return exportedJSON;
}

export function getBudgetCap() {
  const number = localStorage.getItem("app:budgetCap");

  if (number !== null) {
    return Number(number);
  } else {
    return 0;
  }
}

export function setBudgetCap(amount) {
  localStorage.setItem("app:budgetCap", amount);
  console.log("Success");
}

export function getPercentageSpent() {
  const spent = getTotalSpentThisMonth();
  const cap = getBudgetCap();

  if (cap === 0) {
    return null;
  }
  const percentage = (spent / cap) * 100;

  return percentage;
}

export function isOverBudget() {
  const pcspent = getPercentageSpent();

  if (pcspent === null) {
    return false; //no budget cap set
  }
  if (pcspent >= 80) {
    return true;
  } else {
    return false;
  }
}

export function getBaseCurrency() {
  const currency = localStorage.getItem("app:baseCurrency");
  if (currency !== "undefined" || !currency) {
    return currency;
  } else return "USD";
}

export function setBaseCurrency(currency) {
  localStorage.setItem("app:baseCurrency", currency);
}

export function getConversionRates() {
  const defaults = {
    USD: 1,
    KES: 129.44,
    RwF: 1473,
  };
  const savedCurrency = localStorage.getItem("app:ConversionRates");
  if (!savedCurrency === "undefined" || !savedCurrency) {
    return defaults;
  }
  try {
    return JSON.parse(savedCurrency);
  } catch (error) {
    return defaults;
  }
}

export function setConversionRates(rates) {
  localStorage.setItem("app:ConversionRates", JSON.stringify(rates));
}

export function convertCurrencyRates(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  const rates = getConversionRates();
  const amountUSD = amount / rates[fromCurrency];
  const converted = amountUSD * rates[toCurrency];

  return converted;
}
