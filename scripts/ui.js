import { getTransactions, addTransaction } from "./state.js";

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
  console.log("All transactions:", allTrans);
  const tbody = document.querySelector("table tbody");
  console.log("tbody element:", tbody);

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
  const getForm = document.getElementById("trans-form-section"); //hidden form that will appear when button is clicked
  const cancelBtn = document.querySelector("#transdetails-cancel");

  //when button clicked, show form

  addToggle.addEventListener("click", (Event) => {
    getForm.classList.remove("hideme");
    getForm.classList.add("showme");
  });

  //when cancel clicked, hide form
  cancelBtn.addEventListener("click", (Event) => {
    getForm.classList.remove("showme");
    getForm.classList.add("hideme");
    setTimeout(() => {
      getForm.classList.remove("hideme");
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

    //clear containers to avoid duplicates
    document.querySelector(".trans-cards").innerHTML = "";
    document.querySelector("table tbody").innerHTML = "";

    //render pages again
    renderRecentTransactions();
    renderRecentTable();

    //Hide for when done
    const getForm = document.getElementById("trans-form-section");
    getForm.classList.remove("showme");
    getForm.classList.add("hideme");
    setTimeout(() => {
      getForm.classList.remove("hideme");
    }, 500);
  });
}
