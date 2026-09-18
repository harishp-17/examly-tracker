const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxwW3coAMZZLNWnkZ9-jwSCCNej2NgK0lT7ZrKRIZNj0CW1-ho8E7KCDWbk9jn6COUj/exec";

let studentMap = {};
let todaySubmittedMap = {};

document.addEventListener("DOMContentLoaded", function() {
  startLiveClock();
  fetchAnalytics();
});

// 1. Live Clock
function startLiveClock() {
  function updateClock() {
    const clockElement = document.getElementById('liveClock');
    if (!clockElement) return;

    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[now.getDay()];
    
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-US', { hour12: true });

    clockElement.innerText = `${dayName}, ${dateStr} | ${timeStr}`;
  }
  
  updateClock();
  setInterval(updateClock, 1000);
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

        // Convert all Keys to String to avoid String vs Number mismatches
        if (data.studentMap) {
          studentMap = {};
          Object.keys(data.studentMap).forEach(key => {
            studentMap[String(key).trim()] = data.studentMap[key];
          });
        }

        if (data.todaySubmittedMap) {
          todaySubmittedMap = {};
          Object.keys(data.todaySubmittedMap).forEach(key => {
            todaySubmittedMap[String(key).trim()] = data.todaySubmittedMap[key];
          });
        }

        handleRollInput();
      }
    })
    .catch(err => console.error("Error loading stats:", err));
}

// 3. Dynamic Greeting & Smart Duplicate Warning Check
function handleRollInput() {
  const rollInput = document.getElementById('rollNoInput');
  const greetingBox = document.getElementById('studentGreetingBadge');
  const warningBox = document.getElementById('duplicateWarningBadge');
  const historyBtn = document.getElementById('historyModalBtn');

  if (!rollInput || !greetingBox) return;

  const rollVal = String(rollInput.value).trim();

  if (studentMap[rollVal]) {
    const name = studentMap[rollVal];
    greetingBox.innerText = `Hello ${name}, please update your Daily Progress!`;
    greetingBox.style.display = "block";
    if (historyBtn) historyBtn.style.display = "block"; // Show 15-Day History Button

    // Duplicate Check (Checked against String key)
    if (todaySubmittedMap[rollVal]) {
      warningBox.className = "submission-status-badge status-submitted";
      warningBox.innerText = `You already submitted today! Submitting again will update your topics.`;
      warningBox.style.display = "block";
    } else {
      warningBox.className = "submission-status-badge status-pending";
      warningBox.innerText = `You have not submitted today yet.`;
      warningBox.style.display = "block";
    }

  } else {
    greetingBox.style.display = "none";
    warningBox.style.display = "none";
    if (historyBtn) historyBtn.style.display = "none";
  }
}

// 4. Open 15-Day History & Streak Modal
function openHistoryModal() {
  const rollVal = String(document.getElementById('rollNoInput').value).trim();
  if (!rollVal || !studentMap[rollVal]) return;

  const modal = document.getElementById('historyModal');
  const modalContent = document.getElementById('historyModalContent');
  const studentName = studentMap[rollVal];

  modalContent.innerHTML = `<div style="text-align:center; padding:20px;">Fetching your 15-day history & streak...</div>`;
  modal.style.display = "flex";

  fetch(`${SCRIPT_URL}?rollNo=${rollVal}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.studentHistory) {
        const hist = data.studentHistory.history || [];
        const streak = data.studentHistory.streakCount || 0;

        let tableRows = "";
        hist.forEach(item => {
          const statusTag = item.submitted ? `<span style="color:#16a34a; font-weight:bold;">Submitted</span>` : `<span style="color:#dc2626;">Pending</span>`;
          tableRows += `
            <tr>
              <td><strong>${item.date}</strong></td>
              <td>${statusTag}</td>
              <td>${item.dbms}</td>
              <td>${item.java}</td>
              <td>${item.dsa}</td>
              <td>${item.apti}</td>
            </tr>
          `;
        });

        modalContent.innerHTML = `
          <div class="modal-header">
            <div>
              <h3 style="margin:0; font-size:16px; color:#0f172a;">${studentName}</h3>
              <span style="font-size:12px; color:#64748b;">Roll: ${rollVal}</span>
            </div>
            <button class="close-btn" onclick="closeHistoryModal()">✕</button>
          </div>

          <div class="streak-badge-card">
            Current Continuous Streak: <strong>${streak} Days</strong>
          </div>

          <h4 style="margin-bottom:8px; font-size:14px; color:#334155;">Last 15 Days Progress History</h4>
          <div style="overflow-x:auto;">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>DBMS</th>
                  <th>Java</th>
                  <th>DSA</th>
                  <th>Apti</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows || '<tr><td colspan="6" style="text-align:center;">No history records found</td></tr>'}
              </tbody>
            </table>
          </div>
        `;
      }
    })
    .catch(err => {
      modalContent.innerHTML = `<div style="color:red; text-align:center; padding:20px;">Failed to load history. Please try again.</div>`;
    });
}

function closeHistoryModal() {
  document.getElementById('historyModal').style.display = "none";
}

// Helper Function: Validation for Topic Name (Must contain at least 2 alphabetic characters)
function isValidTopicName(topicText) {
  if (!topicText) return false;
  const cleanText = topicText.trim();
  const alphabetCount = (cleanText.match(/[a-zA-Z]/g) || []).length;
  return alphabetCount >= 2;
}

// 5. Submit Handler with Register Number & Multi-Course Topic Validation
function submitProgress() {
  const rollNo = String(document.getElementById("rollNoInput").value).trim();

  // 1. Check if Register Number is empty
  if (!rollNo) {
    alert("❌ Please enter your Register / Roll Number!");
    document.getElementById("rollNoInput").focus();
    return;
  }

  // 2. Check if Register Number exists in the student database
  if (!studentMap[rollNo]) {
    alert("❌ Invalid Register Number! Please enter a valid registered student Roll Number.");
    document.getElementById("rollNoInput").focus();
    return;
  }

  // Fetch Values
  const dbmsStatus = document.getElementById("dbmsStatus").value;
  const dbmsTopic = document.getElementById("dbmsTopic").value.trim();

  const javaStatus = document.getElementById("javaStatus").value;
  const javaTopic = document.getElementById("javaTopic").value.trim();

  const dsaStatus = document.getElementById("dsaStatus").value;
  const dsaTopic = document.getElementById("dsaTopic").value.trim();

  const aptiStatus = document.getElementById("aptiStatus").value;
  const aptiTopic = document.getElementById("aptiTopic").value.trim();

  // Check if all statuses are pending
  if (dbmsStatus === "Pending" && javaStatus === "Pending" && dsaStatus === "Pending" && aptiStatus === "Pending") {
    alert("⚠️ Please update progress for at least one course before submitting!");
    return;
  }

  // Collect error messages for all course validation failures
  let errorMessages = [];

  if ((dbmsStatus === "Completed" || dbmsStatus === "In Progress") && !isValidTopicName(dbmsTopic)) {
    errorMessages.push("• DBMS: Please enter a valid topic name. Symbols or numbers alone are not allowed.");
  }

  if ((javaStatus === "Completed" || javaStatus === "In Progress") && !isValidTopicName(javaTopic)) {
    errorMessages.push("• Java: Please enter a valid topic name. Symbols or numbers alone are not allowed.");
  }

  if ((dsaStatus === "Completed" || dsaStatus === "In Progress") && !isValidTopicName(dsaTopic)) {
    errorMessages.push("• DSA: Please enter a valid topic name. Symbols or numbers alone are not allowed.");
  }

  if ((aptiStatus === "Completed" || aptiStatus === "In Progress") && !isValidTopicName(aptiTopic)) {
    errorMessages.push("• Aptitude: Please enter a valid topic name. Symbols or numbers alone are not allowed.");
  }

  // If any course has topic validation errors, display all of them together
  if (errorMessages.length > 0) {
    alert("❌ Validation Errors Found:\n\n" + errorMessages.join("\n"));
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.innerText = "Submitting...";
  submitBtn.disabled = true;

  const payload = {
    rollNo: rollNo,
    dbmsStatus: dbmsStatus,
    dbmsTopic: dbmsTopic || "-",
    javaStatus: javaStatus,
    javaTopic: javaTopic || "-",
    dsaStatus: dsaStatus,
    dsaTopic: dsaTopic || "-",
    aptiStatus: aptiStatus,
    aptiTopic: aptiTopic || "-"
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
      // Mark as submitted locally so badge updates immediately
      todaySubmittedMap[rollNo] = true;

      const name = studentMap[rollNo] || "Student";
      alert(`🎉 Progress Updated Successfully!\n\n${name}, you are person #${data.submissionOrder} to submit today!`);
      
      document.getElementById("rollNoInput").value = "";
      if (document.getElementById("studentGreetingBadge")) document.getElementById("studentGreetingBadge").style.display = "none";
      if (document.getElementById("duplicateWarningBadge")) document.getElementById("duplicateWarningBadge").style.display = "none";
      if (document.getElementById("historyModalBtn")) document.getElementById("historyModalBtn").style.display = "none";

      document.getElementById("dbmsStatus").value = "Pending";
      document.getElementById("javaStatus").value = "Pending";
      document.getElementById("dsaStatus").value = "Pending";
      document.getElementById("aptiStatus").value = "Pending";
      
      document.getElementById("dbmsTopic").value = "";
      document.getElementById("javaTopic").value = "";
      document.getElementById("dsaTopic").value = "";
      document.getElementById("aptiTopic").value = "";

      fetchAnalytics();
    } else {
      alert("❌ Invalid Register Number! Please check your details.");
    }
  })
  .catch(err => {
    submitBtn.disabled = false;
    submitBtn.innerText = "Submit Today Progress";
    alert("❌ Submission failed. Please check your internet connection.");
  });
}
