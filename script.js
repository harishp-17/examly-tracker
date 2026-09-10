const SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

document.addEventListener("DOMContentLoaded", function() {
  const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };
  document.getElementById("currentDate").innerText = new Date().toLocaleDateString('en-US', options);
});

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
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    if (data.result === "success") {
      msg.style.color = "#4ade80";
      msg.innerText = "Progress Updated Successfully!";
      document.getElementById("trackerForm").reset();
    } else if (data.result === "invalid_roll") {
      msg.style.color = "#f87171";
      msg.innerText = "Invalid Register Number! Please enter a valid III CSBS Roll No.";
    } else {
      msg.style.color = "#f87171";
      msg.innerText = "Error updating status. Please try again.";
    }
  })
  .catch(error => {
    msg.style.color = "#f87171";
    msg.innerText = "Connection error. Please try again!";
    console.error("Error:", error);
  })
  .finally(() => {
    submitBtn.innerText = "Submit Progress";
    submitBtn.disabled = false;
  });
});
