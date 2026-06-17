import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
} from "./state.js";

//show last 5 transactions on cards on home page
export function renderRecentTransactions() {
  const allTrans = getTransactions();
  const lastFive = allTrans.slice(-5);

  const container = document.querySelector(".trans-cards");
  if (!container) return;
  for (const eachTrans of lastFive) {
    container.innerHTML += `<article class="card" data-id="${eachTrans.id}">
      <h3>${eachTrans.description}</h3>
  <dl>
    <dd>${eachTrans.amount}</dd>
    <dd>${eachTrans.date}</dd>
    <dd>${eachTrans.category}</dd>



  </dl>
</article>`;
  }
}
//show transactions on table
export function renderRecentTable(transactionArray) {
  //use passed array if exists, otherwise get from state.js
  const allTrans = transactionArray || getTransactions();
  //   console.log("All transactions:", allTrans);
  const tbody = document.querySelector("table tbody");
  //   console.log("tbody element:", tbody);

  if (!tbody) return; //leave if table doesn't exist

  for (const eachTrans of allTrans) {
    const row = `<tr data-id="${eachTrans.id}">
       <td>${eachTrans.id}</td> 
    <td>${eachTrans.description}</td>
       <td>${eachTrans.amount}</td> 
    <td>${eachTrans.category}</td>
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

  //listen to form "submit" event
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const summary = form.elements["trans-summary"].value;
    const cost = form.elements["trans-cost"].value;
    const location = form.elements["trans-location-city"].value;
    const timedate = form.elements["trans-date"].value;
    const category = form.elements["trans-category"].value;

    //detect if it's an edit situation or an add Transaction situation.

    const transId = form.elements["trans-id"].value;
    if (transId) {
      //edit

      const updatedData = {
        description: summary,
        amount: parseFloat(cost),
        location: location,
        category: category,
        date: timedate,
        updatedAt: new Date().toISOString(),
      };
      updateTransaction(transId, updatedData);
    } else {
      const newTransaction = {
        id: "txn_" + Date.now(),
        description: summary,
        amount: parseFloat(cost),
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

  //for html
  const detailsHtml = `
    <h3>${transaction.description}</h3>
    <dl>
    <dt>Transaction ID</dt>
    <dd>${transaction.id}</dd>
      <dt>Amount</dt>
      <dd>${transaction.amount}</dd>
      <dt>Category</dt>
      <dd>${transaction.category}</dd>
      <dt>Date</dt>
      <dd>${transaction.date}</dd>
      <dt>Location</dt>
      <dd>${transaction.location}</dd>
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
      });
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

//filter through transactions using search box
export function setupSearch() {
  const searchInput = document.getElementById("trans-search");

  searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value;
    const allTrans = getTransactions();
    //filter transactions

    const filtered = allTrans.filter((trans) => {
      return (
        //if search matches category ||(or) description || amount || transaction ID
        //category isn't case sensitive
        //ID isn't case sensitive
        //description isn't case sensitive
        //amount has to be exact match
        trans.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trans.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trans.amount === parseFloat(searchTerm) ||
        trans.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    const tbody = document.querySelector("table tbody");
    tbody.innerHTML = "";
    renderRecentTable(filtered);
  });
}

//Refactored and now using setupTableActions(); instead
// export function setupTableEditBtn() {
//   const table = document.querySelector("table");
//   if (!table) return;

// table.addEventListener("click", (event) => {
//   const editBtn = event.target.closest(".trans-edit-btn");
//   if (!editBtn) return; // a click somewhere else in the table

//   console.log("edit button clicked!");
//   const row = editBtn.closest("tr");
//   const allTrans = getTransactions();
//   const transId = row.getAttribute("data-id");
//   const transaction = allTrans.find((item) => item.id === transId);
//   console.log("Transaction found:", transaction);

//   showTransactionDetails(transaction);
//   console.log("details functions called");
// });
// }
//   const tr = document.querySelectorAll(".trans-edit-btn");

//   for (const editbutton of tr) {
//     editbutton.addEventListener("click", (event) => {
//       console.log("edit button clicked clicked!");
//       const row = event.target.closest("tr");
//       const allTrans = getTransactions();
//       const transId = row.getAttribute("data-id");
//       const transaction = allTrans.find((item) => item.id === transId);

//       showTransactionDetails(transaction);
//     });
//   }
// }

export function setupTableActions() {
  //consolidate edit and delete functionalities on all pages
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
  form.elements["trans-location-city"].value = transaction.location;
  form.elements["trans-date"].value = transaction.date;
  form.elements["trans-category"].value = transaction.category;

  //when editing, legend and submit button will change text

  legend.textContent = "Edit Transaction";
  submitBtn.textContent = "Update Transaction";
} //one form for both pages
