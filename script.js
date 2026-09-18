// Paste your NEW Web App URL here
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzM0PE30F3x7kQaXm2MApfPST92cAo_1RVr6UpzHC5i9kUKLcfE9u6jRMj6wq9IL0CN/exec";

let studentMap = {};

document.addEventListener("DOMContentLoaded", function() {
  startLiveClock();
  fetchAnalytics();

  // Dynamic greeting update on typing Roll Number
  const rollInput = document.getElementById('rollNoInput');
  if (rollInput) {
    rollInput.addEventListener('input', handleRollInput);
    rollInput.addEventListener('keyup', handleRollInput);
  }
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
      if (data && !data.error) {
        const submitted = data.submittedCount || 0;
        const total = data.totalStudents || 63;

        const subElem = document.getElementById('submittedCount');
        const totElem = document.getElementById('totalCount');
        if (subElem) subElem.innerText = submitted;
        if (totElem) totElem.innerText = total;
        
        const percent = Math.round((submitted / total) * 100) || 0;
        
        const percElem = document.getElementById('progressPercent');
        const barElem = document.getElementById('progressBar');
        if (percElem) percElem.innerText = percent + "%";
        if (barElem) barElem.style.width = percent + "%";

        // Store Student Roll No -> Name Mapping
        studentMap = {};
        if (data.studentMap) {
          Object.keys(data.studentMap).forEach(key => {
            studentMap[String(key).trim()] = data.studentMap[key];
          });
        }

        handleRollInput();
      }
    })
    .catch(err => console.error("Error loading stats:", err));
}

// 3. Dynamic Student Name Greeting (FIXED UI IDs)
function handleRollInput() {
  const rollInput = document.getElementById('rollNoInput');
  const greetingWrapper = document.getElementById('studentNameWrapper');
  const studentNameSpan = document.getElementById('studentName');

  if (!rollInput || !greetingWrapper || !studentNameSpan) return;

  const rollVal = String(rollInput.value).trim();

  if (rollVal !== "" && studentMap[rollVal]) {
    const name = studentMap[rollVal];
    studentNameSpan.innerText = name;
    greetingWrapper.style.display = "block";
  } else {
    greetingWrapper.style.display = "none";
    studentNameSpan.innerText = "";
  }
}

// Helper Function: Topic Name Validation
function isValidTopicName(topicText) {
  if (!topicText) return false;
  const cleanText = topicText.trim();
  const alphabetCount = (cleanText.match(/[a-zA-Z]/g) || []).length;
  return alphabetCount >= 2;
}

// 4. Submit Handler (FIXED CORS & Reset UI)
function submitProgress() {
  const rollNoInput = document.getElementById("rollNoInput");
  const rollNo = String(rollNoInput.value).trim();

  if (!rollNo) {
    alert("❌ Please enter your Register / Roll Number!");
    rollNoInput.focus();
    return;
  }

  if (!studentMap[rollNo]) {
    alert("❌ Invalid Register Number! Please enter a valid registered student Roll Number.");
    rollNoInput.focus();
    return;
  }

  const dbmsStatus = document.getElementById("dbmsStatus").value;
  const dbmsTopic = document.getElementById("dbmsTopic").value.trim();

  const javaStatus = document.getElementById("javaStatus").value;
  const javaTopic = document.getElementById("javaTopic").value.trim();

  const dsaStatus = document.getElementById("dsaStatus").value;
  const dsaTopic = document.getElementById("dsaTopic").value.trim();

  const aptiStatus = document.getElementById("aptiStatus").value;
  const aptiTopic = document.getElementById("aptiTopic").value.trim();

  if (dbmsStatus === "Pending" && javaStatus === "Pending" && dsaStatus === "Pending" && aptiStatus === "Pending") {
    alert("⚠️ Please update progress for at least one course before submitting!");
    return;
  }

  let errorMessages = [];

  if ((dbmsStatus === "Completed" || dbmsStatus === "In Progress") && !isValidTopicName(dbmsTopic)) {
    errorMessages.push("• DBMS: Please enter a valid topic name.");
  }
  if ((javaStatus === "Completed" || javaStatus === "In Progress") && !isValidTopicName(javaTopic)) {
    errorMessages.push("• Java: Please enter a valid topic name.");
  }
  if ((dsaStatus === "Completed" || dsaStatus === "In Progress") && !isValidTopicName(dsaTopic)) {
    errorMessages.push("• DSA: Please enter a valid topic name.");
  }
  if ((aptiStatus === "Completed" || aptiStatus === "In Progress") && !isValidTopicName(aptiTopic)) {
    errorMessages.push("• Aptitude: Please enter a valid topic name.");
  }

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
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    submitBtn.disabled = false;
    submitBtn.innerText = "Submit Today Progress";

    if (data.result === "success") {
      const name = studentMap[rollNo] || "Student";
      alert(`🎉 Progress Updated Successfully!\n\n${name}, you are person #${data.submissionOrder} to submit today!`);
      
      // Reset Inputs and Badges
      rollNoInput.value = "";
      const wrapper = document.getElementById("studentNameWrapper");
      if (wrapper) wrapper.style.display = "none";

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
    console.error("Submission Error:", err);
    submitBtn.disabled = false;
    submitBtn.innerText = "Submit Today Progress";
    alert("❌ Submission failed. Please check your internet connection.");
  });
}
