import { getTransactions, addTransaction, deleteTransaction } from "./state.js";

//show last 5 transactions on cards on home page
export function renderRecentTransactions() {
  const allTrans = getTransactions();
  const lastFive = allTrans.slice(-5);

  const container = document.querySelector(".trans-cards");
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
export function renderRecentTable() {
  const allTrans = getTransactions();
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
  const addToggle = document.querySelector("#addtranscation-btn"); //targeting button
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

    form.reset();

    const tbody = document.querySelector("table tbody");
    const transCards = document.querySelector(".trans-cards");
    if (transCards) transCards.innerHTML = "";
    if (tbody) tbody.innerHTML = "";

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
}
