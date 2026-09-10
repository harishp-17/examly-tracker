<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>III CSBS Examly Course Progress Tracker</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card">
    <h2>Examly Daily Course Tracker</h2>
    <p class="subtitle">III CSBS - Daily Progress Update</p>
    
    <div class="date-badge">
      <span>Date: </span><strong id="currentDate">Loading Date...</strong>
    </div>
    
    <form id="trackerForm">
      <div class="field">
        <label for="rollNo">Register Number / Roll Number</label>
        <input type="text" id="rollNo" placeholder="e.g. 922524244012" required>
      </div>

      <div class="course-group">
        <h3>Today's Test / Course Status</h3>
        
        <!-- DBMS -->
        <div class="field">
          <label for="dbms">2028_DBMS Preparatory Course_Level 1</label>
          <select id="dbms" onchange="toggleTopicBox('dbms', 'dbmsTopicBox', 'dbmsTopic')">
            <option value="Pending" selected>Pending</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
          </select>
          <div id="dbmsTopicBox" class="topic-box" style="display: none;">
            <input type="text" id="dbmsTopic" placeholder="Enter topic covered (Mandatory)">
          </div>
        </div>

        <!-- JAVA -->
        <div class="field">
          <label for="java">NeoPAT_Prepcourse_Java_Level 1</label>
          <select id="java" onchange="toggleTopicBox('java', 'javaTopicBox', 'javaTopic')">
            <option value="Pending" selected>Pending</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
          </select>
          <div id="javaTopicBox" class="topic-box" style="display: none;">
            <input type="text" id="javaTopic" placeholder="Enter topic covered (Mandatory)">
          </div>
        </div>

        <!-- DSA -->
        <div class="field">
          <label for="dsa">NeoPAT_Prepcourse_DSA_Level 1</label>
          <select id="dsa" onchange="toggleTopicBox('dsa', 'dsaTopicBox', 'dsaTopic')">
            <option value="Pending" selected>Pending</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
          </select>
          <div id="dsaTopicBox" class="topic-box" style="display: none;">
            <input type="text" id="dsaTopic" placeholder="Enter topic covered (Mandatory)">
          </div>
        </div>

        <!-- APTITUDE -->
        <div class="field">
          <label for="aptitude">NeoPAT_Aptitude Preparatory Course</label>
          <select id="aptitude" onchange="toggleTopicBox('aptitude', 'aptiTopicBox', 'aptiTopic')">
            <option value="Pending" selected>Pending</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
          </select>
          <div id="aptiTopicBox" class="topic-box" style="display: none;">
            <input type="text" id="aptiTopic" placeholder="Enter topic covered (Mandatory)">
          </div>
        </div>
      </div>

      <button type="submit" id="submitBtn">Submit Progress</button>
    </form>
    
    <div id="msg"></div>
  </div>

  <script src="script.js"></script>
</body>
</html>
