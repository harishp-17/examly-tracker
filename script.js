const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxwW3coAMZZLNWnkZ9-jwSCCNej2NgK0lT7ZrKRIZNj0CW1-ho8E7KCDWbk9jn6COUj/exec";
document.addEventListener("DOMContentLoaded", function() {
  const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };
  document.getElementById("currentDate").innerText = new Date().toLocaleDateString('en-US', options);
});

// Show/Hide Topic Box & Auto Set Required
function toggleTopicBox(selectId, boxId) {
  const status = document.getElementById(selectId).value;
  const topicBox = document.getElementById(boxId);
  const topicInput = topicBox.querySelector("input");
  
  if (status === "Completed" || status === "In Progress") {
    topicBox.style.display = "block";
    topicInput.required = true;
  } else {
    topicBox.style.display = "none";
    topicInput.required = false;
    topicInput.value = "";
  }
}

document.getElementById("trackerForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById("submitBtn");
  const msg = document.getElementById("msg");
  msg.innerText = "";

  // Mandatory Topic Check
  const courseList = [
    { statusId: "dbms", topicId: "dbmsTopic", name: "DBMS" },
    { statusId: "java", topicId: "javaTopic", name: "Java" },
    { statusId: "dsa", topicId: "dsaTopic", name: "DSA" },
    { statusId: "aptitude", topicId: "aptiTopic", name: "Aptitude" }
  ];

  for (let c of courseList) {
    const status = document.getElementById(c.statusId).value;
    const topic = document.getElementById(c.topicId).value.trim();
    
    if ((status === "Completed" || status === "In Progress") && topic === "") {
      msg.style.color = "#f87171";
      msg.innerText = `Please enter the topic covered for ${c.name}!`;
      document.getElementById(c.topicId).focus();
      return; // Stop Submission
    }
  }

  submitBtn.innerText = "Submitting...";
  submitBtn.disabled = true;
  
  const payload = {
    rollNo: document.getElementById("rollNo").value.trim(),
    dbmsStatus: document.getElementById("dbms").value,
    dbmsTopic: document.getElementById("dbmsTopic").value.trim(),
    javaStatus: document.getElementById("java").value,
    javaTopic: document.getElementById("javaTopic").value.trim(),
    dsaStatus: document.getElementById("dsa").value,
    dsaTopic: document.getElementById("dsaTopic").value.trim(),
    aptiStatus: document.getElementById("aptitude").value,
    aptiTopic: document.getElementById("aptiTopic").value.trim()
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
      document.querySelectorAll(".topic-box").forEach(el => el.style.display = "none");
    } else if (data.result === "invalid_roll") {
      msg.style.color = "#f87171";
      msg.innerText = "Invalid Register Number! Enter a valid III CSBS Roll No.";
    } else {
      msg.style.color = "#f87171";
      msg.innerText = "Error updating status. Try again!";
    }
  })
  .catch(error => {
    msg.style.color = "#f87171";
    msg.innerText = "Connection error. Please try again!";
  })
  .finally(() => {
    submitBtn.innerText = "Submit Progress";
    submitBtn.disabled = false;
  });
});
document.addEventListener("DOMContentLoaded", function() {
  const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };
  document.getElementById("currentDate").innerText = new Date().toLocaleDateString('en-US', options);
});

// Show/Hide Topic Description Box
function toggleTopicBox(selectId, boxId) {
  const status = document.getElementById(selectId).value;
  const topicBox = document.getElementById(boxId);
  if (status === "Completed" || status === "In Progress") {
    topicBox.style.display = "block";
  } else {
    topicBox.style.display = "none";
    document.getElementById(boxId).querySelector("input").value = "";
  }
}

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
    dbmsTopic: document.getElementById("dbmsTopic").value.trim(),
    javaStatus: document.getElementById("java").value,
    javaTopic: document.getElementById("javaTopic").value.trim(),
    dsaStatus: document.getElementById("dsa").value,
    dsaTopic: document.getElementById("dsaTopic").value.trim(),
    aptiStatus: document.getElementById("aptitude").value,
    aptiTopic: document.getElementById("aptiTopic").value.trim()
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
      
      // Hide all topic boxes after reset
      document.querySelectorAll(".topic-box").forEach(el => el.style.display = "none");
    } else if (data.result === "invalid_roll") {
      msg.style.color = "#f87171";
      msg.innerText = "Invalid Register Number! Enter a valid III CSBS Roll No.";
    } else {
      msg.style.color = "#f87171";
      msg.innerText = "Error updating status. Try again!";
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

function scheduleNightRefresh() {
  const now = new Date();
  const night11PM = new Date();
  
  night11PM.setHours(23, 0, 0, 0); // 11:00:00 PM
  
  let timeToRefresh = night11PM.getTime() - now.getTime();
  
  if (timeToRefresh < 0) {
    // If it's already past 11 PM today, schedule for 11 PM tomorrow
    timeToRefresh += 24 * 60 * 60 * 1000;
  }
  
  setTimeout(() => {
    location.reload();
  }, timeToRefresh);
}

scheduleNightRefresh();
