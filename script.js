// Google Apps Script Web App Deployment URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxwW3coAMZZLNWnkZ9-jwSCCNej2NgK0lT7ZrKRIZNj0CW1-ho8E7KCDWbk9jn6COUj/exec";
let studentMap = {};

// DOM Loaded உடனே Clock & Analytics Run ஆகும்
document.addEventListener("DOMContentLoaded", function() {
  startLiveClock();
  fetchAnalytics();
});

// 1. Live Clock Function (Top Right Corner with Day, Date & Seconds)
function startLiveClock() {
  function updateClock() {
    const clockElement = document.getElementById('liveClock');
    if (!clockElement) return;

    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[now.getDay()];
    
    const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
    const timeStr = now.toLocaleTimeString('en-US', { hour12: true }); // HH:MM:SS AM/PM

    clockElement.innerText = `${dayName}, ${dateStr} | ${timeStr}`;
  }
  
  updateClock();
  setInterval(updateClock, 1000); // Updates every second
}

// 2. Fetch Dashboard Analytics Data
function fetchAnalytics() {
  fetch(SCRIPT_URL)
    .then(res => res.json())
    .then(data => {
      if (data) {
        const submitted = data.submittedCount || 0;
        const total = data.totalStudents || 63;

        document.getElementById('submittedCount').innerText = submitted;
        document.getElementById('totalCount').innerText = total;
        
        const percent = Math.round((submitted / total) * 100) || 0;
        
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

// 3. Dynamic Greeting Message on Typing Roll No
function handleRollInput() {
  const rollInput = document.getElementById('rollNoInput');
  const greetingBox = document.getElementById('studentGreetingBadge');

  if (!rollInput || !greetingBox) return;

  const rollVal = rollInput.value.trim();

  if (studentMap[rollVal]) {
    const name = studentMap[rollVal];
    greetingBox.innerText = `Hello ${name}, please update your Daily Progress!`;
    greetingBox.style.display = "block";
  } else {
    greetingBox.style.display = "none";
    greetingBox.innerText = "";
  }
}

// 4. Form Submit Handler with Form Reset
function submitProgress() {
  const rollNo = document.getElementById("rollNoInput").value.trim();

  if (!rollNo) {
    alert("Please enter your Roll Number!");
    return;
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
      const name = studentMap[rollNo] || "Student";
      alert(`🎉 Progress Updated Successfully!\n\n${name}, you are person #${data.submissionOrder} to submit today!`);
      
      // Form Inputs Clear Logic
      document.getElementById("rollNoInput").value = "";
      const greetingBox = document.getElementById("studentGreetingBadge");
      if (greetingBox) greetingBox.style.display = "none";
      
      document.getElementById("dbmsStatus").value = "Pending";
      document.getElementById("javaStatus").value = "Pending";
      document.getElementById("dsaStatus").value = "Pending";
      document.getElementById("aptiStatus").value = "Pending";
      
      document.getElementById("dbmsTopic").value = "";
      document.getElementById("javaTopic").value = "";
      document.getElementById("dsaTopic").value = "";
      document.getElementById("aptiTopic").value = "";

      // Refresh Live Dashboard Counts
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
