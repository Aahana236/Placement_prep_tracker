/***********************
 SAFE ELEMENT SELECTOR
***********************/
const $ = (id) => document.getElementById(id);

/***********************
 GLOBAL STATE (LocalStorage)
***********************/
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentUser = localStorage.getItem('username') || '';
let isDarkMode = localStorage.getItem('theme') === 'dark';

/***********************
 STREAK STATE (Learning Page)
***********************/
let streakData = JSON.parse(localStorage.getItem('streakData')) || {
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: null
};

/***********************
 APPLY THEME (ALL PAGES)
***********************/
if (isDarkMode) {
  document.body.classList.add('dark');
}

/* =========================================================
   LOGIN PAGE (index.html)
========================================================= */
const nameInput = $('nameInput');
const saveNameBtn = $('saveNameBtn');

if (nameInput && saveNameBtn) {
  saveNameBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) return;

    localStorage.setItem('username', name);
    window.location.href = 'dashboard.html';
  });
}

/* =========================================================
   DASHBOARD PAGE (dashboard.html)
========================================================= */
const welcomeText = $('welcomeText');
const logoutBtn = $('logoutBtn');
const themeToggle = $('themeToggle');
const goToLearningBtn = $('goToLearning');

/* TASK ELEMENTS */
const input = $('taskInput');
const dueDateInput = $('dueDateInput');
const addBtn = $('addBtn');
const list = $('taskList');
const categorySelect = $('categorySelect');

const allFilter = $('allFilter');
const completedFilter = $('completedFilter');
const pendingFilter = $('pendingFilter');

const progressText = $('progressText');
const progressBar = $('progressBar');

/* Show username */
if (welcomeText && currentUser) {
  welcomeText.textContent = `Welcome, ${currentUser} 👋`;
}

/***********************
 LOGOUT
***********************/
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
  });
}

/***********************
 THEME TOGGLE
***********************/
if (themeToggle) {
  themeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';

  themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    themeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
  });
}

/***********************
 NAVIGATION → LEARNING PAGE
***********************/
if (goToLearningBtn) {
  goToLearningBtn.addEventListener('click', () => {
    window.location.href = 'learning_page.html';
  });
}

/***********************
 TASK HELPERS
***********************/
function isOverdue(task) {
  if (task.completed) return false;
  const today = new Date().toISOString().split('T')[0];
  return task.dueDate < today;
}

function updateProgress() {
  if (!progressText || !progressBar) return;

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const overdue = tasks.filter(t => isOverdue(t)).length;

  if (total === 0) {
    progressText.textContent = 'No tasks added yet';
    progressBar.style.width = '0%';
    return;
  }

  const percent = Math.round((completed / total) * 100);
  progressText.textContent =
    `Completed: ${completed}/${total} (${percent}%) | Overdue: ${overdue}`;
  progressBar.style.width = `${percent}%`;
}

/***********************
 RENDER TASKS
***********************/
function renderTasks(filter = 'all') {
  if (!list) return;

  list.innerHTML = '';
  updateProgress();

  const today = new Date().toISOString().split('T')[0];

  tasks.forEach((task, index) => {
    if (
      (filter === 'completed' && !task.completed) ||
      (filter === 'pending' && task.completed)
    ) return;

    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = `${task.text} (${task.category})`;

    const due = document.createElement('small');
    due.textContent = `📅 ${task.dueDate}`;

    if (task.completed) {
      span.style.textDecoration = 'line-through';
      due.style.color = 'gray';
    } else if (task.dueDate < today) {
      due.style.color = 'red';
    } else if (task.dueDate === today) {
      due.style.color = 'orange';
    } else {
      due.style.color = 'green';
    }

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = task.completed ? 'Completed' : 'Not Completed';
    toggleBtn.onclick = () => {
      tasks[index].completed = !tasks[index].completed;
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks(filter);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
      tasks.splice(index, 1);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks(filter);
    };

    li.append(span, due, toggleBtn, deleteBtn);
    list.appendChild(li);
  });
}
showTaskReminders();


/***********************
 ADD TASK
***********************/
if (addBtn) {
  addBtn.addEventListener('click', () => {
    const text = input.value.trim();
    const dueDate = dueDateInput.value;
    const category = categorySelect.value;

    if (!text || !dueDate || !category) return;

    tasks.push({ text, category, dueDate, completed: false });
    localStorage.setItem('tasks', JSON.stringify(tasks));

    input.value = '';
    dueDateInput.value = '';
    categorySelect.value = '';

    renderTasks();
  });
}

/***********************
 FILTERS
***********************/
allFilter && (allFilter.onclick = () => renderTasks('all'));
completedFilter && (completedFilter.onclick = () => renderTasks('completed'));
pendingFilter && (pendingFilter.onclick = () => renderTasks('pending'));

/* =========================================================
   LEARNING PAGE — STREAK SYSTEM
========================================================= */
const streakText = $('streakText');
const topicCheckboxes = document.querySelectorAll('.topic-checkbox');

function updateStreakUI() {
  if (!streakText) return;
  streakText.textContent =
    `🔥 Current Streak: ${streakData.currentStreak} days | 🏆 Best Streak: ${streakData.bestStreak} days`;
}

function updateStreak() {
  const today = new Date().toISOString().split('T')[0];

  if (streakData.lastActiveDate === today) return;

  if (
    streakData.lastActiveDate &&
    new Date(today) - new Date(streakData.lastActiveDate) === 86400000
  ) {
    streakData.currentStreak += 1;
  } else {
    streakData.currentStreak = 1;
  }

  streakData.bestStreak = Math.max(
    streakData.bestStreak,
    streakData.currentStreak
  );

  streakData.lastActiveDate = today;
  localStorage.setItem('streakData', JSON.stringify(streakData));
  updateStreakUI();
}

topicCheckboxes.forEach(cb => {
  cb.addEventListener('change', () => {
    if (cb.checked) {
      updateStreak();
    }
  });
});

updateStreakUI();

/***********************
 INITIAL RENDER (Dashboard only)
***********************/
renderTasks();

/***********************
 HEATMAP (Learning Page)
***********************/
const heatmapContainer = $('heatmap');
let activityData = JSON.parse(localStorage.getItem('activityData')) || {};

// Get last 30 days
function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function renderHeatmap() {
  if (!heatmapContainer) return;

  heatmapContainer.innerHTML = '';
  const days = getLast30Days();

  days.forEach(date => {
    const count = activityData[date] || 0;
    const level = Math.min(count, 4);

    const div = document.createElement('div');
    div.className = `heatmap-day level-${level}`;
    div.title = `${date} → ${count} activities`;

    heatmapContainer.appendChild(div);
  });
}

renderHeatmap();

/***********************
 HEATMAP (Learning Page)
***********************/
const heatmapEl = document.getElementById('heatmap');

if (heatmapEl) {
  const today = new Date();
  const activity =
    JSON.parse(localStorage.getItem('learningActivity')) || {};

  // Show last 28 days
  for (let i = 27; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const key = date.toISOString().split('T')[0];

    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';

    if (activity[key]) {
      cell.classList.add('active');
    }

    heatmapEl.appendChild(cell);
  }
}
/***********************
 TRACK LEARNING ACTIVITY (SAFE)
***********************/
document.addEventListener('DOMContentLoaded', () => {
  const topicCheckboxes = document.querySelectorAll('.topic-checkbox');

  if (!topicCheckboxes.length) return;

  topicCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const todayKey = new Date().toISOString().split('T')[0];
      const activity =
        JSON.parse(localStorage.getItem('learningActivity')) || {};

      activity[todayKey] = true;
      localStorage.setItem('learningActivity', JSON.stringify(activity));

      location.reload();
    });
  });
});
/***********************
 LEARNING PAGE DROPDOWNS
***********************/
document.addEventListener('DOMContentLoaded', () => {
  const dropdowns = document.querySelectorAll('.dropdown-btn');

  if (!dropdowns.length) return;

  dropdowns.forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      content.style.display =
        content.style.display === 'block' ? 'none' : 'block';
    });
  });
});
const checkboxes = document.querySelectorAll('.topic-checkbox');
const scoreDisplay = document.getElementById('readinessScore');

// Modal elements
const scoreCard = document.getElementById('scoreCard');
const scoreModal = document.getElementById('scoreModal');
const closeModal = document.getElementById('closeModal');
const modalScore = document.getElementById('modalScore');
const modalStatus = document.getElementById('modalStatus');

// Topic groups
const topicGroups = {
  dsa: 6,
  os: 5,
  dbms: 5,
  cn: 4,
  projects: 4,
  aptitude: 3
};

const totalTopics = Object.values(topicGroups).reduce((a, b) => a + b, 0);

// 🔢 CALCULATE SCORE
function calculateScore() {
  const checked = document.querySelectorAll('.topic-checkbox:checked').length;
  const score = Math.round((checked / totalTopics) * 100);

  localStorage.setItem('readinessScore', score);
  scoreDisplay.textContent = `${score} / 100`;

  return score;
}

// 🔁 Update score when checkbox clicked
checkboxes.forEach(cb => {
  cb.addEventListener('change', calculateScore);
});

// 📊 OPEN MODAL
scoreCard.addEventListener('click', () => {
  const score = calculateScore();
  modalScore.textContent = `${score} / 100`;

  if (score < 40) {
    modalStatus.textContent = '🔴 Beginner';
  } else if (score < 70) {
    modalStatus.textContent = '🟡 Interview Ready';
  } else {
    modalStatus.textContent = '🟢 Placement Ready';
  }

  scoreModal.style.display = 'flex';
});

// ❌ CLOSE MODAL
closeModal.addEventListener('click', () => {
  scoreModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === scoreModal) {
    scoreModal.style.display = 'none';
  }
});

// Load saved score on refresh
calculateScore();
/***********************
 AI STUDY RECOMMENDATION
***********************/
function updateAIRecommendation() {
  const aiSuggestion = document.getElementById('aiSuggestion');
  if (!aiSuggestion) return;

  const sections = {
    DSA: document.querySelectorAll(
      '.learning-section:nth-of-type(1) .topic-checkbox'
    ),
    OS: document.querySelectorAll(
      '.learning-section:nth-of-type(2) .topic-checkbox'
    ),
    DBMS: document.querySelectorAll(
      '.learning-section:nth-of-type(3) .topic-checkbox'
    ),
    CN: document.querySelectorAll(
      '.learning-section:nth-of-type(4) .topic-checkbox'
    ),
    Projects: document.querySelectorAll(
      '.learning-section:nth-of-type(5) .topic-checkbox'
    ),
    Aptitude: document.querySelectorAll(
      '.learning-section:nth-of-type(6) .topic-checkbox'
    ),
  };

  let weakestSection = '';
  let lowestCompletion = 100;

  for (const section in sections) {
    const total = sections[section].length;
    const completed = [...sections[section]].filter(cb => cb.checked).length;
    const percent = total === 0 ? 0 : (completed / total) * 100;

    if (percent < lowestCompletion) {
      lowestCompletion = percent;
      weakestSection = section;
    }
  }

  if (lowestCompletion === 100) {
    aiSuggestion.textContent =
      "🔥 Amazing! You’re well prepared across all subjects. Keep revising!";
  } else {
    aiSuggestion.textContent =
      `Focus more on ${weakestSection}. Improving this area will significantly boost your placement readiness score.`;
  }
}

/* Trigger AI update on topic change */
document.addEventListener('change', (e) => {
  if (e.target.classList.contains('topic-checkbox')) {
    updateAIRecommendation();
  }
});

/* Initial AI suggestion */
updateAIRecommendation();
/***********************
 TASK REMINDERS
***********************/
function showTaskReminders() {
  const reminderBox = document.getElementById('reminderBox');
  if (!reminderBox) return;

  reminderBox.innerHTML = '';

  const today = new Date().toISOString().split('T')[0];

  tasks.forEach(task => {
    if (task.completed) return;

    if (task.dueDate === today) {
      const div = document.createElement('div');
      div.className = 'reminder today';
      div.textContent = `⚠️ Reminder: "${task.text}" is due today!`;
      reminderBox.appendChild(div);
    }

    if (task.dueDate < today) {
      const div = document.createElement('div');
      div.className = 'reminder overdue';
      div.textContent = `🚨 Overdue: "${task.text}" was due on ${task.dueDate}`;
      reminderBox.appendChild(div);
    }
  });
}
showTaskReminders();











