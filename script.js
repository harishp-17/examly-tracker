const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxwW3coAMZZLNWnkZ9-jwSCCNej2NgK0lT7ZrKRIZNj0CW1-ho8E7KCDWbk9jn6COUj/exec";

document.getElementById("trackerForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById("submitBtn");
  const msg = document.getElementById("msg");
  
  submitBtn.innerText = "Submitting...";
  submitBtn.disabled = true;
  msg.innerText = "";
  
  const payload = {
    rollNo: document.getElementById("rollNo").value.trim(),
    dbmsStatus: document.getElementById("dbms").value,
    javaStatus: document.getElementById("java").value,
    dsaStatus: document.getElementById("dsa").value,
    aptiStatus: document.getElementById("aptitude").value
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(() => {
    msg.style.color = "#4ade80";
    msg.innerText = "Progress Updated Successfully in Google Sheet!";
    document.getElementById("trackerForm").reset();
  })
  .catch(error => {
    msg.style.color = "#f87171";
    msg.innerText = "Error updating status. Please try again.";
    console.error("Error:", error);
  })
  .finally(() => {
    submitBtn.innerText = "Submit Progress";
    submitBtn.disabled = false;
  });
});