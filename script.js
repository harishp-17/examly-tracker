const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxwW3coAMZZLNWnkZ9-jwSCCNej2NgK0lT7ZrKRIZNj0CW1-ho8E7KCDWbk9jn6COUj/exec";

// Global cache for student roll-to-name mapping and analytics
let studentDatabase = {};
let currentStudentName = "Student";

// Subject configurations
const SUBJECT_CONFIG = [
  { key: "dbms", name: "DBMS", selectIds: ["dbms", "dbmsStatus"], boxId: "dbmsBox", wrapperId: "dbmsTopicWrapper", inputId: "dbmsTopic" },
  { key: "java", name: "Java", selectIds: ["java", "javaStatus"], boxId: "javaBox", wrapperId: "javaTopicWrapper", inputId: "javaTopic" },
  { key: "dsa", name: "DSA", selectIds: ["dsa", "dsaStatus"], boxId: "dsaBox", wrapperId: "dsaTopicWrapper", inputId: "dsaTopic" },
  { key: "aptitude", name: "Aptitude", selectIds: ["aptitude", "aptiStatus", "apti"], boxId: "aptiBox", wrapperId: "aptiTopicWrapper", inputId: "aptiTopic" }
];

/**
 * Formats a student's name nicely (e.g. "HARISH P" -> "Harish P")
 */
function formatName(name) {
  if (!name || name === "Student") return "Student";
  return name
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Determines greeting based on current time of day
 * - Morning (5 AM - 12 PM): "Good Morning, [Student Name]! ☀️ Ready to learn?"
 * - Afternoon (12 PM - 5 PM): "Good Afternoon, [Student Name]! 🌤️ Keep up the momentum!"
 * - Evening (5 PM - 11 PM): "Good Evening, [Student Name]! 🌙 Time to log today's progress."
 * - Late Night (11 PM - 5 AM): "Burning the midnight oil, [Student Name]! 🌌"
 */
function updateGreeting(rawName = currentStudentName) {
  const name = formatName(rawName);
  const hour = new Date().getHours();
  
  const greetingIcon = document.getElementById("greetingIcon");
  const greetingTitle = document.getElementById("greetingTitle");
  const greetingSubtitle = document.getElementById("greetingSubtitle");
  
  if (!greetingTitle || !greetingSubtitle || !greetingIcon) return;

  if (hour >= 5 && hour < 12) {
    greetingIcon.textContent = "☀️";
    greetingTitle.textContent = `Good Morning, ${name}!`;
    greetingSubtitle.textContent = "Ready to learn?";
  } else if (hour >= 12 && hour < 17) {
    greetingIcon.textContent = "🌤️";
    greetingTitle.textContent = `Good Afternoon, ${name}!`;
    greetingSubtitle.textContent = "Keep up the momentum!";
  } else if (hour >= 17 && hour < 23) {
    greetingIcon.textContent = "🌙";
    greetingTitle.textContent = `Good Evening, ${name}!`;
    greetingSubtitle.textContent = "Time to log today's progress.";
  } else {
    greetingIcon.textContent = "🌌";
    greetingTitle.textContent = `Burning the midnight oil, ${name}!`;
    greetingSubtitle.textContent = "Time to log today's progress.";
  }
}

/**
 * Handles roll number input auto-detection and student greeting sync
 */
function handleRollNumberInput() {
  const rollInput = document.getElementById("rollNo");
  const wrapper = document.getElementById("studentNameWrapper");
  const nameText = document.getElementById("studentNameText");
  
  if (!rollInput || !wrapper || !nameText) return;

  const rollVal = rollInput.value.trim();
  
  if (rollVal && studentDatabase[rollVal]) {
    currentStudentName = studentDatabase[rollVal];
    nameText.textContent = currentStudentName;
    wrapper.classList.remove("hidden");
    updateGreeting(currentStudentName);
  } else {
    currentStudentName = "Student";
    nameText.textContent = "";
    wrapper.classList.add("hidden");
    updateGreeting("Student");
  }
}

/**
 * Validates that a topic name contains at least 2 alphabet characters
 */
function isValidTopicName(topic) {
  if (!topic || typeof topic !== "string") return false;
  const alphaChars = topic.match(/[a-zA-Z]/g);
  return alphaChars !== null && alphaChars.length >= 2;
}

/**
 * Helper to find element by multiple possible IDs
 */
function getElementByPossibleIds(idList) {
  for (const id of idList) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return null;
}

/**
 * Dynamically toggles visibility of topic input boxes based on status selection
 * - "In Progress" or "Completed": Shows topic input box and highlights subject
 * - "Pending": Hides topic box and clears any entered text
 */
function syncSubjectTopicVisibility(subject) {
  const selectEl = getElementByPossibleIds(subject.selectIds);
  const boxEl = document.getElementById(subject.boxId);
  const wrapperEl = document.getElementById(subject.wrapperId);
  const inputEl = document.getElementById(subject.inputId);
  
  if (!selectEl || !boxEl || !wrapperEl || !inputEl) return;
  
  const status = selectEl.value;
  if (status === "In Progress" || status === "Completed") {
    // Show topic input box
    wrapperEl.classList.remove("hidden");
    wrapperEl.classList.add("highlighted");
    boxEl.classList.add("active-subject");
  } else {
    // Hide topic input box and reset entered value
    wrapperEl.classList.add("hidden");
    wrapperEl.classList.remove("highlighted");
    boxEl.classList.remove("active-subject");
    inputEl.value = "";
    inputEl.classList.remove("input-error");
  }
}

/**
 * Syncs all subject topic boxes to match current dropdown states
 */
function syncAllSubjectTopics() {
  SUBJECT_CONFIG.forEach(sub => {
    syncSubjectTopicVisibility(sub);
  });
}

/**
 * Initializes change listeners for subject status dropdowns
 */
function initSubjectStatusListeners() {
  SUBJECT_CONFIG.forEach(sub => {
    const selectEl = getElementByPossibleIds(sub.selectIds);
    const inputEl = document.getElementById(sub.inputId);
    
    if (selectEl) {
      selectEl.addEventListener("change", () => {
        syncSubjectTopicVisibility(sub);
      });
    }
    
    if (inputEl) {
      inputEl.addEventListener("input", () => {
        if (isValidTopicName(inputEl.value.trim())) {
          inputEl.classList.remove("input-error");
        }
      });
    }
  });

  // Perform initial sync on load
  syncAllSubjectTopics();
}

/**
 * Updates a specific progress bar and text with animated width
 */
function updateProgressBar(barId, textId, count, total, labelPrefix = "") {
  const barEl = document.getElementById(barId);
  const textEl = document.getElementById(textId);
  
  if (!barEl || !textEl) return;
  
  const safeTotal = total > 0 ? total : 63;
  const safeCount = Math.min(Math.max(count || 0, 0), safeTotal);
  const percentage = Math.round((safeCount / safeTotal) * 100);
  
  // Set width for smooth CSS transition
  barEl.style.width = `${percentage}%`;
  
  if (labelPrefix) {
    textEl.textContent = `${labelPrefix}: ${safeCount}/${safeTotal} (${percentage}%)`;
  } else {
    textEl.textContent = `${safeCount}/${safeTotal} (${percentage}%)`;
  }
}

/**
 * Fetches analytics and student mapping from Google Apps Script API endpoint
 */
async function fetchAnalytics() {
  const refreshBtn = document.getElementById("refreshAnalyticsBtn");
  const syncText = document.getElementById("lastSyncedText");
  
  if (refreshBtn) refreshBtn.classList.add("rotating");
  if (syncText) syncText.textContent = "Fetching live analytics...";
  
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "GET"
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    
    // Store student map if available
    if (data.studentMap && typeof data.studentMap === "object") {
      studentDatabase = data.studentMap;
      // Re-trigger auto-suggest in case roll number was already typed
      handleRollNumberInput();
    }
    
    const totalStudents = Number(data.totalStudents) || 63;
    const submittedCount = Number(data.submittedCount) || 0;
    
    // Calculate subject-wise completion counts from API data
    let dbmsCount = 0;
    let javaCount = 0;
    let dsaCount = 0;
    let aptiCount = 0;
    
    if (data.subjectCounts) {
      dbmsCount = Number(data.subjectCounts.dbms || data.subjectCounts.DBMS) || 0;
      javaCount = Number(data.subjectCounts.java || data.subjectCounts.JAVA || data.subjectCounts.Java) || 0;
      dsaCount = Number(data.subjectCounts.dsa || data.subjectCounts.DSA) || 0;
      aptiCount = Number(data.subjectCounts.aptitude || data.subjectCounts.apti || data.subjectCounts.Aptitude) || 0;
    } else if (Array.isArray(data.records) || Array.isArray(data.submissions)) {
      const records = data.records || data.submissions;
      records.forEach(rec => {
        if (rec.dbmsStatus === "Completed" || rec.dbms === "Completed") dbmsCount++;
        if (rec.javaStatus === "Completed" || rec.java === "Completed") javaCount++;
        if (rec.dsaStatus === "Completed" || rec.dsa === "Completed") dsaCount++;
        if (rec.aptiStatus === "Completed" || rec.aptitude === "Completed" || rec.aptitudeStatus === "Completed") aptiCount++;
      });
    } else {
      // Direct subject completion keys or submittedCount fallback
      dbmsCount = Number(data.dbmsCompleted ?? data.dbmsCount ?? submittedCount) || 0;
      javaCount = Number(data.javaCompleted ?? data.javaCount ?? submittedCount) || 0;
      dsaCount = Number(data.dsaCompleted ?? data.dsaCount ?? submittedCount) || 0;
      aptiCount = Number(data.aptitudeCompleted ?? data.aptiCompleted ?? data.aptiCount ?? submittedCount) || 0;
    }

    // Update Overall Progress
    const overallPercentage = Math.round((submittedCount / totalStudents) * 100);
    const overallProgressBar = document.getElementById("overallProgressBar");
    const overallProgressText = document.getElementById("overallProgressText");
    if (overallProgressBar && overallProgressText) {
      overallProgressBar.style.width = `${overallPercentage}%`;
      overallProgressText.textContent = `${submittedCount} / ${totalStudents} Completed (${overallPercentage}%)`;
    }

    // Update Subject-Wise Progress Bars
    updateProgressBar("dbmsProgressBar", "dbmsCountText", dbmsCount, totalStudents);
    updateProgressBar("javaProgressBar", "javaCountText", javaCount, totalStudents);
    updateProgressBar("dsaProgressBar", "dsaCountText", dsaCount, totalStudents);
    updateProgressBar("aptiProgressBar", "aptiCountText", aptiCount, totalStudents);
    
    // Update timestamp
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (syncText) syncText.textContent = `Synced at ${timeStr}`;
    
  } catch (error) {
    console.error("Error fetching analytics:", error);
    if (syncText) syncText.textContent = "Live sync paused (offline mode)";
  } finally {
    if (refreshBtn) {
      setTimeout(() => refreshBtn.classList.remove("rotating"), 500);
    }
  }
}

// Event Listeners & Initialization
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Greeting Card
  updateGreeting("Student");
  
  // 2. Fetch initial analytics and student mappings
  fetchAnalytics();

  // 3. Roll number input listener for instant name detection & greeting update
  const rollInput = document.getElementById("rollNo");
  if (rollInput) {
    rollInput.addEventListener("input", handleRollNumberInput);
  }

  // 4. Initialize subject status and dynamic topic box visibility
  initSubjectStatusListeners();

  // 5. Manual Refresh Button
  const refreshBtn = document.getElementById("refreshAnalyticsBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", fetchAnalytics);
  }

  // 6. Tracker Form Submission with Conditional Validation
  const form = document.getElementById("trackerForm");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const msg = document.getElementById("msg");
      msg.textContent = "";

      // Validate topic inputs ONLY for subjects where status is "In Progress" or "Completed"
      for (const sub of SUBJECT_CONFIG) {
        const selectEl = getElementByPossibleIds(sub.selectIds);
        const inputEl = document.getElementById(sub.inputId);
        const status = selectEl ? selectEl.value : "Pending";
        const topicVal = inputEl ? inputEl.value.trim() : "";

        if (status === "In Progress" || status === "Completed") {
          if (!isValidTopicName(topicVal)) {
            if (inputEl) {
              inputEl.classList.add("input-error");
              inputEl.focus();
            }
            msg.style.color = "#ef4444";
            msg.textContent = `Please enter a valid topic name (at least 2 letters) for ${sub.name}.`;
            return;
          }
        }
      }

      const submitBtn = document.getElementById("submitBtn");
      const btnText = submitBtn.querySelector(".btn-text");
      const btnSpinner = submitBtn.querySelector(".btn-spinner");
      
      if (btnText) btnText.textContent = "Submitting...";
      if (btnSpinner) btnSpinner.classList.remove("hidden");
      submitBtn.disabled = true;
      
      const dbmsSelect = getElementByPossibleIds(["dbms", "dbmsStatus"]);
      const javaSelect = getElementByPossibleIds(["java", "javaStatus"]);
      const dsaSelect = getElementByPossibleIds(["dsa", "dsaStatus"]);
      const aptiSelect = getElementByPossibleIds(["aptitude", "aptiStatus", "apti"]);

      const dbmsTopicInput = document.getElementById("dbmsTopic");
      const javaTopicInput = document.getElementById("javaTopic");
      const dsaTopicInput = document.getElementById("dsaTopic");
      const aptiTopicInput = document.getElementById("aptiTopic");

      const dbmsStatus = dbmsSelect ? dbmsSelect.value : "Pending";
      const javaStatus = javaSelect ? javaSelect.value : "Pending";
      const dsaStatus = dsaSelect ? dsaSelect.value : "Pending";
      const aptiStatus = aptiSelect ? aptiSelect.value : "Pending";

      const payload = {
        rollNo: document.getElementById("rollNo").value.trim(),
        dbmsStatus: dbmsStatus,
        dbmsTopic: dbmsStatus !== "Pending" && dbmsTopicInput ? dbmsTopicInput.value.trim() : "",
        javaStatus: javaStatus,
        javaTopic: javaStatus !== "Pending" && javaTopicInput ? javaTopicInput.value.trim() : "",
        dsaStatus: dsaStatus,
        dsaTopic: dsaStatus !== "Pending" && dsaTopicInput ? dsaTopicInput.value.trim() : "",
        aptiStatus: aptiStatus,
        aptiTopic: aptiStatus !== "Pending" && aptiTopicInput ? aptiTopicInput.value.trim() : ""
      };

      fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(() => {
        msg.style.color = "#34d399";
        msg.textContent = "Progress Updated Successfully in Google Sheet!";
        
        // Reset form, topic visibility, and greeting back to default
        form.reset();
        syncAllSubjectTopics();
        handleRollNumberInput();
        
        // Auto refresh analytics to reflect recent submission
        setTimeout(fetchAnalytics, 1200);
      })
      .catch(error => {
        msg.style.color = "#f87171";
        msg.textContent = "Error updating status. Please try again.";
        console.error("Error submitting progress:", error);
      })
      .finally(() => {
        if (btnText) btnText.textContent = "Submit Progress";
        if (btnSpinner) btnSpinner.classList.add("hidden");
        submitBtn.disabled = false;
      });
    });
  }
});
