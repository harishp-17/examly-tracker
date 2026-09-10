const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxwW3coAMZZLNWnkZ9-jwSCCNej2NgK0lT7ZrKRIZNj0CW1-ho8E7KCDWbk9jn6COUj/exec";
let studentMap = {};

window.onload = function() {
  // 1. Fetch Saved Roll Number from browser storage
  const savedRoll = localStorage.getItem("vsb_saved_roll");
  if (savedRoll) {
    document.getElementById("rollNoInput").value = savedRoll;
    document.getElementById("rememberRoll").checked = true;
  }
  
  // 2. Fetch Dashboard Analytics Data
  fetchAnalytics();
};

// Fetch Live Analytics Bar Data
function fetchAnalytics() {
  fetch(SCRIPT_URL)
    .then(res => res.json())
    .then(data => {
      if (data) {
        document.getElementById('submittedCount').innerText = data.submittedCount || 0;
        document.getElementById('totalCount').innerText = data.totalStudents || 63;
        
        const total = data.totalStudents || 63;
        const submitted = data.submittedCount || 0;
        const percent = Math.round((submitted / total) * 100);
        
        document.getElementById('progressPercent').innerText = percent + "%";
        document.getElementById('progressBar').style.width = percent + "%";

        if (data.studentMap) {
          studentMap = data.studentMap;
          handleRollInput();
        }
      }
    })
    .catch(err => console.error("Error loading stats:", err));
}

// Auto Suggest Name on Typing Roll No
function handleRollInput() {
  const rollVal = document.getElementById('rollNoInput').value.trim();
  const nameDisplay = document.getElementById('studentNameDisplay');

  if (studentMap[rollVal]) {
    nameDisplay.innerText = "Student Name: " + studentMap[rollVal];
  } else if (rollVal.length >= 4) {
    nameDisplay.innerText = "Searching Student...";
  } else {
    nameDisplay.innerText = "";
  }
}

// Form Submit Handler
function submitProgress() {
  const rollNo = document.getElementById("rollNoInput").value.trim();
  const rememberChecked = document.getElementById("rememberRoll").checked;

  if (!rollNo) {
    alert("Please enter your Roll Number!");
    return;
  }

  if (rememberChecked) {
    localStorage.setItem("vsb_saved_roll", rollNo);
  } else {
    localStorage.removeItem("vsb_saved_roll");
  }

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.innerText = "Submitting...";
  submitBtn.disabled = true;

  const payload = {
    rollNo: rollNo,
    dbmsStatus: document.getElementById("dbmsStatus").value,
    dbmsTopic: document.getElementById("dbmsTopic").value.trim() || "-",
    javaStatus: document.getElementById("javaStatus").value,
    javaTopic: document.getElementById("javaTopic").value.trim() || "-",
    dsaStatus: document.getElementById("dsaStatus").value,
    dsaTopic: document.getElementById("dsaTopic").value.trim() || "-",
    aptiStatus: document.getElementById("aptiStatus").value,
    aptiTopic: document.getElementById("aptiTopic").value.trim() || "-"
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    submitBtn.disabled = false;
    submitBtn.innerText = "Submit Today Progress";

    if (data.result === "success") {
      alert("Progress Updated Successfully!");
      fetchAnalytics();
    } else {
      alert("Invalid Roll Number! Please check your details.");
    }
  })
  .catch(err => {
    submitBtn.disabled = false;
    submitBtn.innerText = "Submit Today Progress";
    alert("Submission failed. Please check internet connection.");
  });
}

// WhatsApp Copy Button
function copyPendingListForWhatsApp() {
  fetch(SCRIPT_URL)
    .then(res => res.json())
    .then(data => {
      if (data && data.studentMap) {
        let today = new Date().toLocaleDateString('en-GB');
        let text = `*VSB NEOPAT PROGRESS UPDATE (${today})*\n`;
        text += `------------------------------------\n`;
        text += `Total Submitted: ${data.submittedCount} / ${data.totalStudents}\n\n`;
        text += `Kindly update your remaining progress ASAP!\n`;

        navigator.clipboard.writeText(text).then(() => {
          alert("WhatsApp Progress Summary Copied!");
        });
      }
    });
}
