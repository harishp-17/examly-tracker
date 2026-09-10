const SCRIPT_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

document.addEventListener("DOMContentLoaded", function() {
  const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };
  document.getElementById("currentDate").innerText = new Date().toLocaleDateString('en-US', options);
});

// III CSBS Roll Number Range Validator
function isValidCSBSRollNo(roll) {
  const rollStr = roll.trim();
  
  // Lateral Entry Check
  if (rollStr === "922524244501") return true;
  
  // Regular Batch Check (922524244002 to 922524244063)
  if (rollStr.length === 12 && rollStr.startsWith("922524244")) {
    const lastThree = parseInt(rollStr.slice(9), 10);
    if (lastThree >= 2 && lastThree <= 63) {
      return true;
    }
  }
  
  return false;
}

// Show/Hide Topic Box & Toggle Required Status
function toggleTopicBox(selectId, boxId, inputId) {
  const status = document.getElementById(selectId).value;
  const topicBox = document.getElementById(boxId);
  const topicInput = document.getElementById(inputId);
  
  if (status === "Completed" || status === "In Progress") {
    topicBox.style.display = "block";
    topicInput.setAttribute("required", "true");
  } else {
    topicBox.style.display = "none";
    topicInput.removeAttribute("required");
    topicInput.value = "";
  }
}

document.getElementById("trackerForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById("submitBtn");
  const msg = document.getElementById("msg");
  msg.innerText = "";

  const rollNo = document.getElementById("rollNo").value.trim();

  // 1. Roll Number Range Validation
  if (!isValidCSBSRollNo(rollNo)) {
    msg.style.color = "#f87171";
    msg.innerText = "Not a valid roll number from CSBS";
    return false;
  }

  // 2. Mandatory Topic Check
  const courses = [
    { statusId: "dbms", topicId: "dbmsTopic", name: "DBMS" },
    { statusId: "java", topicId: "javaTopic", name: "Java" },
    { statusId: "dsa", topicId: "dsaTopic", name: "DSA" },
    { statusId: "aptitude", topicId: "aptiTopic", name: "Aptitude" }
  ];

  for (let c of courses) {
    const status = document.getElementById(c.statusId).value;
    const topicInput = document.getElementById(c.topicId);
    const topicVal = topicInput.value.trim();
    
    if ((status === "Completed" || status === "In Progress") && topicVal === "") {
      msg.style.color = "#f87171";
      msg.innerText = `Please enter topic covered for ${c.name}!`;
      topicInput.focus();
      return false;
    }
  }

  submitBtn.innerText = "Submitting...";
  submitBtn.disabled = true;
  
  const payload = {
    rollNo: rollNo,
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
      msg.innerText = "Not a valid roll number from CSBS";
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

// Auto-refresh page at Night 11:00 PM
function scheduleNightRefresh() {
  const now = new Date();
  const night11PM = new Date();
  
  night11PM.setHours(23, 0, 0, 0);
  
  let timeToRefresh = night11PM.getTime() - now.getTime();
  
  if (timeToRefresh < 0) {
    timeToRefresh += 24 * 60 * 60 * 1000;
  }
  
  setTimeout(() => {
    location.reload();
  }, timeToRefresh);
}

scheduleNightRefresh();
