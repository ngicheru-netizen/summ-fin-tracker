import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
  getSpentbyCategory,
  getTotalSpent,
  getTotalSpentThisMonth,
  importTransactions,
  exportTransactions,
  getBudgetCap,
  setBudgetCap,
  getPercentageSpent,
  isOverBudget,
  setBaseCurrency,
  setConversionRates,
  convertCurrencyRates,
  getBaseCurrency,
  getCategories,
  addCategory,
  getLast7DaysSpending,
} from "./state.js";
import { compileRegex, highlight } from "./search.js";
import {
  isValidDescription,
  isValidAmount,
  isValidCategory,
  isValidDate,
} from "./validators.js";

let currentDisplayedTransactions = [];

//show last 5 transactions on cards on home page
export function renderRecentTransactions() {
  const allTrans = getTransactions();
  const lastFive = allTrans.slice(-5);

  // show stored USD in the user's chosen currency
  const base = getBaseCurrency();

  const container = document.querySelector(".trans-cards");
  if (!container) return;
  for (const eachTrans of lastFive) {
    const shown = convertCurrencyRates(eachTrans.amount, "USD", base);
    container.innerHTML += `<article class="card" data-id="${eachTrans.id}">
      <h3>${eachTrans.description}</h3>
  <dl>
    <dd>${shown.toFixed(2)} ${base}</dd>
    <dd>${eachTrans.date}</dd>
    <dd>${eachTrans.category}</dd>



  </dl>
</article>`;
  }
}
//show transactions on table
export function renderRecentTable(transactionArray, searchRegex) {
  //use passed array if exists, otherwise get from state.js
  const allTrans = transactionArray || getTransactions();

  //keep the export list in sync with whatever is currently rendered
  currentDisplayedTransactions = allTrans;

  //   console.log("All transactions:", allTrans);
  const tbody = document.querySelector("table tbody");
  //   console.log("tbody element:", tbody);

  if (!tbody) return; //leave if table doesn't exist

  //normalize that all amounts stored are in one currency
  const base = getBaseCurrency();
  for (const eachTrans of allTrans) {
    const shown = convertCurrencyRates(eachTrans.amount, "USD", base);
    const row = `<tr data-id="${eachTrans.id}">
       <td>${highlight(eachTrans.id, searchRegex)}</td> 
    <td>${highlight(eachTrans.description, searchRegex)}</td>
       <td>${shown.toFixed(2)} ${base}</td>
    <td>${highlight(eachTrans.category, searchRegex)}</td>
       <td>${eachTrans.date}</td> 
    <td>${eachTrans.createdAt}</td>
       <td>${eachTrans.updatedAt}</td>
       <td>
            <button class="btn btn-primary trans-edit-btn">Edit</button> 
            <button class="btn btn-danger trans-del-btn">Delete</button> 
        </td> 
    </tr>`;
    tbody.innerHTML += row;
  }
}

//button automation
//click on "Add Transaction" button, form  slides to visibility

export function setupAddTransactionToggle() {
  const addToggle = document.querySelector("#addtransaction-btn"); //targeting button
  const detailsSummary = document.getElementById("trans-form-section"); //hidden form that will appear when button is clicked
  const cancelBtn = document.querySelector("#transdetails-cancel");

  //when button clicked, show form

  addToggle.addEventListener("click", (Event) => {
    detailsSummary.classList.remove("hideme");
    detailsSummary.classList.add("showme");
  });

  //when cancel clicked, hide form
  cancelBtn.addEventListener("click", (Event) => {
    detailsSummary.classList.remove("showme");
    detailsSummary.classList.add("hideme");
    setTimeout(() => {
      detailsSummary.classList.remove("hideme");
    }, 500);
  });
}

//form submission

export function setupFormSubmission() {
  const form = document.getElementById("transactionform");

  // cap date picker to today (no future dates)
  const dateInput = form.elements["trans-date"];
  if (dateInput) {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset()); // local time
    dateInput.max = today.toISOString().slice(0, 10); // "yyyy-MM-dd"
  }

  //listen to form "submit" event
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const summary = form.elements["trans-summary"].value;
    const cost = form.elements["trans-cost"].value;
    const location = form.elements["trans-location-city"].value;
    const timedate = form.elements["trans-date"].value;
    const category = form.elements["trans-category"].value;
    const enteredCurrency = form.elements["trans-currency"].value;

    //regex validation:

    if (!isValidDescription(summary)) {
      alert(
        "Description can't be empty, have spaces around text or have duplicate words. Try again!",
      );
    }
    if (!isValidAmount(cost)) {
      alert("Please enter a valid amount i.e. 67 or 17.38. Try again!");
    }

    if (!isValidCategory(category)) {
      alert("Category MUST be letters only. Try again!");
    }

    if (!isValidDate(timedate)) {
      alert("Please enter a valid date (YYYY-MM-DD). Try again!");
    }
    //detect if it's an edit situation or an add Transaction situation.
    const cleanedSummary = summary.trim().replace(/\s+/g, " ");
    const transId = form.elements["trans-id"].value;
    if (transId) {
      //edit

      const updatedData = {
        description: cleanedSummary,
        amount: convertCurrencyRates(parseFloat(cost), enteredCurrency, "USD"),
        location: location,
        category: category,
        date: timedate,
        updatedAt: new Date().toISOString(),
      };
      updateTransaction(transId, updatedData);
    } else {
      const newTransaction = {
        id: "txn_" + Date.now(),
        description: cleanedSummary,
        amount: convertCurrencyRates(parseFloat(cost), enteredCurrency, "USD"),
        location: location,
        category: category,
        date: timedate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addTransaction(newTransaction);
    }
    form.reset();
    //reset to add Mode
    const legend = form.querySelector("legend");
    const submitBtn = form.querySelector("button[type='submit']");
    const tbody = document.querySelector("table tbody");
    const transCards = document.querySelector(".trans-cards");
    if (transCards) transCards.innerHTML = "";
    if (tbody) tbody.innerHTML = "";
    legend.textContent = "Add/Edit Transaction";
    submitBtn.textContent = "Submit Transaction";
    form.elements["trans-id"].value = "";

    //render pages again
    renderRecentTable();
    renderRecentTransactions();

    //Hide for when done
    const detailsSummary = document.getElementById("trans-form-section");
    detailsSummary.classList.remove("showme");
    detailsSummary.classList.add("hideme");
    setTimeout(() => {
      detailsSummary.classList.remove("hideme");
    }, 500);
  });
}

//make card clickable - after clicking full transaction page loads.
export function setupCardClickListener() {
  console.log("listener called");
  const container = document.querySelector(".trans-cards");

  container.addEventListener("click", (event) => {
    const clickCard = event.target.closest(".card");

    const transId = clickCard.getAttribute("data-id");

    const trans = getTransactions().find((item) => item.id === transId);

    showTransactionDetails(trans);
  });
}

export function showTransactionDetails(transaction) {
  const details = document.getElementById("trans-details");
  const contentDiv = details.querySelector(".details-content");

  //normalize that all amounts stored are in one currency

  const base = getBaseCurrency();
  const shown = convertCurrencyRates(transaction.amount, "USD", base);

  //for html
  const detailsHtml = `
    <h3>${transaction.description}</h3>
    <dl>
    <dt>Transaction ID</dt>
    <dd>${transaction.id}</dd>
      <dt>Amount</dt>
      <dd>${shown.toFixed(2)} ${base}</dd>
      <dt>Category</dt>
      <dd>${transaction.category}</dd>
      <dt>Date</dt>
      <dd>${transaction.date}</dd>
      <dt>Location</dt>
      <dd>${transaction.location}</dd>
      <dt>Last Updated</dt>
      <dd>${new Date(transaction.updatedAt).toLocaleString()}</dd>
    </dl>
    <button class="btn btn-primary trans-edit-btn">Edit</button>
    <button class="btn btn-danger trans-del-btn">Delete</button>
     <button
              id="transdetails-cancel"
              class="btn btn-secondary"
            >
              Cancel
            </button>`;

  contentDiv.innerHTML = detailsHtml;
  details.classList.add("showme");
  //cancel button to get out of transaction details card
  const detailsSummary = document.getElementById("trans-details");
  const cancelBtn = details.querySelector("#transdetails-cancel");

  //when cancel clicked, hide form
  cancelBtn.addEventListener("click", (event) => {
    detailsSummary.classList.remove("showme");
    detailsSummary.classList.add("hideme");
    setTimeout(() => {
      detailsSummary.classList.remove("hideme");
    }, 500);
  });

  //delete button
  const deleteBtn = detailsSummary.querySelector(".trans-del-btn");
  deleteBtn.addEventListener("click", (event) => {
    if (
      window.confirm("Are you sure you'd like to continue with this action?")
    ) {
      console.log("User confirmed");
      deleteTransaction(transaction.id);

      //if exists clear containers to avoid duplicates
      const tbody = document.querySelector("table tbody");
      const transCards = document.querySelector(".trans-cards");
      if (transCards) transCards.innerHTML = "";
      if (tbody) tbody.innerHTML = "";

      //render pages again
      renderRecentTable();
      renderRecentTransactions();

      // close panel
      detailsSummary.classList.remove("showme");
      detailsSummary.classList.add("hideme");

      setTimeout(() => {
        detailsSummary.classList.remove("hideme");
      }, 500);
    } else {
      console.log("User canceled");
    }
  });

  //edit buttion
  const editBtn = detailsSummary.querySelector(".trans-edit-btn");
  //when editBtn is clicked

  editBtn.addEventListener("click", (event) => {
    //call helper function

    populateFormforEdit(transaction);
    const formSection = document.getElementById("trans-form-section");
    formSection.classList.remove("hideme");
    formSection.classList.add("showme");

    // close the details panel
    detailsSummary.classList.remove("showme");
    detailsSummary.classList.add("hideme");
    setTimeout(() => {
      detailsSummary.classList.remove("hideme");
    }, 500);
  });
}

//Sort through transactions in ascending or descending order

export function setupSortHeaders() {
  const th = document.querySelectorAll("th[data-sort]");
  console.log("headers found", th.length);

  for (const headers of th) {
    headers.addEventListener("click", (event) => {
      console.log("Header clicked!");
      const sortType = event.target.getAttribute("data-sort");
      const table = document.querySelector("table");

      const currentColumn = table.getAttribute("data-sort-column");
      const currentColDirection = table.getAttribute("data-sort-direction");

      let newDirection;
      if (currentColumn === sortType) {
        if (currentColDirection === "asc") {
          newDirection = "desc";
        } else {
          newDirection = "asc";
        }
      } else {
        newDirection = "asc";
      }
      table.setAttribute("data-sort-column", sortType);
      table.setAttribute("data-sort-direction", newDirection);

      //clear & show
      const allTrans = getTransactions();
      console.log("All transactions", allTrans);
      const sortedTransactions = allTrans.sort((a, b) => {
        const comparison = String(a[sortType]).localeCompare(
          String(b[sortType]),
        );
        if (newDirection === "asc") {
          return comparison;
        } else {
          return -comparison;
        }
        headers.addEventListener("keydown", (event) => {
          if (event === "Enter" || event.key === " ") {
            event.preventDefault();
          }
        });
      });

      currentDisplayedTransactions = sortedTransactions;
      const tbody = document.querySelector("table tbody");
      tbody.innerHTML = "";
      renderRecentTable(sortedTransactions);

      document.querySelectorAll("th[data-sort]").forEach((header) => {
        header.textContent = header.textContent.replace(/\s*[↑↓]/g, "");

        if (header.getAttribute("data-sort") === currentColumn) {
          let direction;
          if (table.getAttribute("data-sort-direction") === "asc") {
            direction = "↑";
          } else {
            direction = "↓";
          }
        }
        //Ascending / Descending symbol
        if (header.getAttribute("data-sort") === sortType) {
          let direction =
            table.getAttribute("data-sort-direction") === "asc" ? "↑" : "↓";
          header.textContent += " " + direction; // Actually append it
        }
      });
    });
  }
}

//filter through transactions using regex pattern
export function setupSearch() {
  const searchInput = document.getElementById("trans-search");
  const caseToggle = document.getElementById("search-case-insensitive");
  const status = document.getElementById("search-status");

  searchInput.addEventListener("input", (event) => {
    const pattern = searchInput.value;
    const allTrans = getTransactions();
    const tbody = document.querySelector("table tbody");

    //filter transactions
    //condition ? condition true : condition false
    // flags: g for highlighting, i ignore case
    const flags = caseToggle.checked ? "gi" : "g";

    const re = compileRegex(pattern, flags);

    if (pattern === "") {
      currentDisplayedTransactions = allTrans;
      if (tbody) tbody.innerHTML = "";
      renderRecentTable(allTrans);
      status.textContent = "";
      return;
    }

    if (!re) {
      status.textContent = "Invalid search pattern";
      return;
    }
    // show records of text that matches pattern
    const filtered = allTrans.filter((trans) => {
      return (
        trans.description.match(re) ||
        trans.category.match(re) ||
        trans.id.match(re)
      );
    });

    currentDisplayedTransactions = filtered;
    if (tbody) tbody.innerHTML = "";
    renderRecentTable(filtered, re);

    status.textContent = `${filtered.length} match${filtered.length === 1 ? "" : "es"}`;
  });
}

//Refactored and now using setupTableActions(); instead
// export function setupTableEditBtn() {

export function setupTableActions() {
  //consolidate edit and delete functionalities for transactions forms
  const table = document.querySelector("table");
  if (!table) return;

  table.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".trans-edit-btn");
    const deleteBtn = event.target.closest(".trans-del-btn");

    if (editBtn) {
      const row = editBtn.closest("tr");
      const transId = row.getAttribute("data-id");
      const transaction = getTransactions().find((item) => item.id === transId);
      // console.log("Transaction found:", transaction);

      // showTransactionDetails(transaction); redundant display of transaction details
      // console.log("details functions called");

      populateFormforEdit(transaction);
      const formSection = document.getElementById("trans-form-section");
      formSection.classList.remove("hideme");
      formSection.classList.add("showme");
    } else if (deleteBtn) {
      //delete button
      const row = deleteBtn.closest("tr");
      const transID = row.getAttribute("data-id");

      if (
        window.confirm("Are you sure you'd like to continue with this action?")
      ) {
        console.log("User confirmed");
        deleteTransaction(transID);

        //if exists clear containers to avoid duplicates
        const tbody = document.querySelector("table tbody");
        const transCards = document.querySelector(".trans-cards");
        if (transCards) transCards.innerHTML = "";
        if (tbody) tbody.innerHTML = "";

        //render pages again
        renderRecentTable();
        renderRecentTransactions();
      }
    }
  });
}

function populateFormforEdit(transaction) {
  const form = document.getElementById("transactionform");
  const legend = form.querySelector("legend");
  const submitBtn = form.querySelector("button[type='submit']");

  form.elements["trans-id"].value = transaction.id;
  form.elements["trans-summary"].value = transaction.description;
  form.elements["trans-cost"].value = transaction.amount;
  form.elements["trans-currency"].value = "USD"; //avoids double convert
  form.elements["trans-location-city"].value = transaction.location;
  form.elements["trans-date"].value = transaction.date;
  form.elements["trans-category"].value = transaction.category;

  //when editing, legend and submit button will change text

  legend.textContent = "Edit Transaction";
  submitBtn.textContent = "Update Transaction";
} //one form for both pages

// export function showCategoryTotals() {
//   //total expenditure per category
//   const categories = [
//     "Food",
//     "Utilities",
//     "Books",
//     "Transport",
//     "Entertainment",
//     "Health",
//   ];
//   const container = document.querySelector(".category-totals");
//   if (!container) return;
// }
// container.innerHTML = "";
// for (const cat of categories) {
//   const total = getSpentByCategory(cat);
//   container.innerHTML += `<p>${cat}: ${total}</p>`;
// }

export function showDashboardStats() {
  const byCategory = getSpentbyCategory();
  const thisMonth = getTotalSpentThisMonth();
  const total = getTotalSpent();

  console.log("byCategory:", byCategory);
  console.log("thisMonth:", thisMonth);
  console.log("total:", total);

  //reflect the budget numbers onto the page
  const cap = getBudgetCap();
  const remaining = cap - thisMonth;

  //normalize that all amounts stored are in one currency

  const base = getBaseCurrency();
  const shownCap = convertCurrencyRates(cap, "USD", base);
  const shownSpent = convertCurrencyRates(thisMonth, "USD", base);
  const shownRemaining = convertCurrencyRates(remaining, "USD", base);

  document.getElementById("budget-cap").textContent =
    `${shownCap.toFixed(2)} ${base}`;
  document.getElementById("spent-this-month").textContent =
    `${shownSpent.toFixed(2)} ${base}`;
  document.getElementById("amount-remaining").textContent =
    `${shownRemaining.toFixed(2)} ${base}`;

  const tbody = document.querySelector("table tbody");
  if (!tbody) return;
  tbody.innerHTML = ""; //clears whatever is there to avoid duplicates
  for (const category of Object.keys(byCategory)) {
    //for loops cant iterate through objects directly, so I have to use Object.keys(byCategory)
    const amount = byCategory[category]; //look up by key
    document.getElementById("spent-this-month").textContent =
      "$" + thisMonth.toFixed(2);
    document.getElementById("total-usd").textContent =
      "$" + thisMonth.toFixed(2);
    tbody.innerHTML += `<tr><td>${category}</td><td>$${amount.toFixed(2)}</td></tr>`;
  }
}

export function setupImportBtn() {
  const importBtn = document.getElementById("import-btn");
  const fileInput = document.getElementById("import-file");
  if (!importBtn || !fileInput) return;

  importBtn.addEventListener("click", (event) => {
    //opens file explorer to choose file
    fileInput.click();
  });

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const read = new FileReader();
    read.onload = (event) => {
      const content = event.target.result;
      console.log("File content", content);
      console.log("File type:", typeof content);
      importTransactions(content);
    };
    read.readAsText(file);
    event.target.value = ""; //if you pick the same file, the event listener still works
  });
}

export function setupExportBtn() {
  const exportBtn = document.getElementById("export-btn");
  if (!exportBtn) return; //if button doesn't exist, exit!
  exportBtn.addEventListener("click", (event) => {
    //Bug - button works, but array in json file is empty
    // Cause - currentDisplayedTransactions starts as [] on load, so any export would show empty
    // Fix - load JSON file with whatever actually renders, search or otherwise
    let file;
    if (currentDisplayedTransactions.length) {
      file = currentDisplayedTransactions;
    } else {
      file = getTransactions();
    }

    const jsonString = exportTransactions(file);

    function downloadFile(content, filename) {
      //Download JSON file after exported
      const blob = new Blob([content], { type: "application/json" });

      const url = URL.createObjectURL(blob);
      //create temporary anchor element

      //" an element must be part of the DOM (Document Object Model)
      // to be clicked programmatically."
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      //trigger download
      document.body.appendChild(a);
      a.click();

      URL.revokeObjectURL(url); //free up URL
    }
    downloadFile(jsonString, "transactions.json");
  });
}

export function setupBudgetSettings() {
  //Budget Cap
  const saveChangesBtn = document.getElementById("save-change-currency");
  if (!saveChangesBtn) return; //if button doesn't exist, exit!
  saveChangesBtn.addEventListener("click", (event) => {
    event.preventDefault();
    const amount = document.getElementById("budget-cap").value;
    //check to see if amount is a number, if not exit
    if (amount === "") {
      return;
    }
    if (isNaN(amount || Number(amount) < 0)) {
      alert("Insert valid number");
      return;
    }
    setBudgetCap(amount);
    return alert("Budget Cap Set!");
  });
}
//
//
//

//Currency Settings
export function setupCurrencySettings() {
  const saveChangesBtn = document.getElementById("save-change-currency");
  if (!saveChangesBtn) return;
  saveChangesBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const radio = document.querySelector('input[name="base-currency"]:checked');
    if (!radio) {
      alert("Please pick a base currency");
      return;
    }
    const kesValue = document.getElementById("rate-kes").value;
    const rwfValue = document.getElementById("rate-rwf").value;

    const kesRate = Number(kesValue);
    const rwfRate = Number(rwfValue);

    if (
      //if values are null/empty, or not numbers, or unreasonably high: error alert
      kesValue === "" ||
      rwfValue === "" ||
      isNaN(kesRate) ||
      isNaN(rwfRate) ||
      kesRate <= 0 ||
      rwfRate <= 0 ||
      kesRate > 100000 ||
      rwfRate > 100000
    ) {
      alert("Please enter valid conversion rates.");
      return;
    }
    setConversionRates({ USD: 1, KES: kesRate, RwF: rwfRate });
    setBaseCurrency(radio.value);
    return alert("Rates updated!");
  });
}

//
//
//
//

export function showBudgetStats() {
  const cap = getBudgetCap();
  const capSpan = document.getElementById("budget-cap");
  const spent = getTotalSpentThisMonth();
  const spentSpan = document.getElementById("spent-this-month");
  const remaining = cap - spent;
  const remainingSpan = document.getElementById("amount-remaining");
  const overBudget = isOverBudget();
  const progressBar = document.querySelector(".progress-bar-container");
  const warning = document.getElementById("budget-warning");
  const liveElement = document.getElementById("amount-remaining");

  //normalize that all amounts stored are in one currency

  const base = getBaseCurrency();
  const shownCap = convertCurrencyRates(cap, "USD", base);
  const shownSpent = convertCurrencyRates(spent, "USD", base);
  const shownRemaining = convertCurrencyRates(remaining, "USD", base);

  if (cap === 0) {
    const msg = document.getElementById("no-budget-message");
    if (msg) msg.style.display = "block";
    return;

    return;
  } else if (cap > 0) {
    const progressBarFill = document.querySelector(".progress-bar-fill");
    if (!capSpan || !spentSpan || !remainingSpan || !progressBarFill) return;

    capSpan.textContent = `${shownCap.toFixed(2)} ${base}`;
    spentSpan.textContent = `${shownSpent.toFixed(2)} ${base}`;
    remainingSpan.textContent = `${shownRemaining.toFixed(2)} ${base}`;

    const pcspent = getPercentageSpent();
    23;
    const displayPercent = Math.min(pcspent, 100);

    // null check for sanity

    progressBarFill.style.width = `${displayPercent}%`;

    const caption = document.querySelector("#bgt-progress-bar p");
    caption.textContent = `${Math.round(displayPercent)}% Spent`;

    if (overBudget) {
      progressBarFill.classList.add("over-budget");
      warning.style.display = "block";
    } else {
      progressBarFill.classList.remove("over-budget");
      warning.style.display = "none";
    }
  }
  if (isOverBudget()) {
    liveElement.setAttribute("aria-live", "assertive");
  } else {
    liveElement.setAttribute("aria-live", "polite");
  }
}

export function renderCategories() {
  const cats = getCategories();

  const list = document.querySelector(".category-list");

  if (!list) {
    return;
  }
  list.innerHTML = "";

  for (const cat of cats) {
    list.innerHTML += `
    <li data-name="${cat}">
           <span>${cat}</span>

            <button type="button" class="btn btn-secondary edit-category-button">Edit</button>

            <button type="button" class="btn btn-danger delete-category-button">Delete</button>
          </li>
          <br>
    `;
  }
}

export function setupCategoryActions() {
  const list = document.querySelector(".category-list");
  if (!list) return;

  list.addEventListener("click", (event) => {
    const deleteBtn = event.target.closest(".delete-category-button");
    const editBtn = event.target.closest(".edit-category-button");

    if (deleteBtn) {
      const li = deleteBtn.closest("li");
      const name = li.dataset.name;

      deleteCategory(name);
      renderCategories();
      return;
    }

    if (editBtn) {
      const li = editBtn.closest("li");
      const name = li.dataset.name;

      document.getElementById("cat-name").value = name; //form shows existing name when edit button is clicked
      document.getElementById("cat-id").value = name; //picks which category we're editing
      document.getElementById("category-form").hidden = false; // shows form
      return;
    }
  });
}

export function setupAddCategoryToggle() {
  const addBtn = document.getElementById("add-category-btn");
  const formSection = document.getElementById("category-form");
  const cancelBtn = document.getElementById("cat-cancel");

  addBtn.addEventListener("click", (event) => {
    formSection.hidden = false; //similar to showme
  });

  cancelBtn.addEventListener("click", (event) => {
    formSection.hidden = true; // similar to hideme
  });
}

export function setupCategoryForm() {
  const saveBtn = document.getElementById("save-category");
  const nameInput = document.getElementById("cat-name");
  const formSection = document.getElementById("cat-form");

  saveBtn.addEventListener("click", (event) => {
    const name = nameInput.value.trim(); //get rid of empty space

    if (!saveBtn === "") {
      alert("Please input category name!");
      return;
    }

    addCategory(name);
    renderCategories();
    nameInput.value = "";
    formSection.hidden = true; //hide when form is submitted
  });
}

//display trends

export function renderTrendChart() {
  const data = getLast7DaysSpending();
  const container = document.querySelector(".trend-chart");
  if (!container) return;

  container.innerHTML = "";

  const max = Math.max(...data.map((d) => d.total)) || 1;

  for (const day of data) {
    const heightPct = (day.total / max) * 100;

    const col = document.createElement("div");
    col.className = "trend-col";

    const total = document.createElement("span");
    total.className = "trend-total";
    total.textContent = `$${day.total.toFixed(2)}`;

    //create bar

    const bar = document.createElement("div");
    bar.className = "trend-bar";
    bar.style.height = `${heightPct}%`;
    bar.title = `${day.date}: $${day.total.toFixed(2)}`;
    bar.setAttribute(
      "aria-label",
      `$day.date: ${day.total.toFixed(2)} dollars`,
    );

    const label = document.createElement("span");
    label.className = "trend-day";

    col.appendChild(total);
    col.appendChild(bar);
    col.appendChild(label);
    container.appendChild(col);
  }
}
