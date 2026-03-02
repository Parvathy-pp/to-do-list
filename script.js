// Redirect to login if not logged in
const currentUser = localStorage.getItem("currentUser");
if (!currentUser) {
    window.location.href = "login.html";
}

// DOM Elements
const addBtn = document.getElementById("addBtn");
const activeList = document.getElementById("activeList");
const completedList = document.getElementById("completedList");
const inputField = document.getElementById("todoInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");
const deadlineInput = document.getElementById("deadlineInput");
const hoursInput = document.getElementById("hoursInput");
const minutesInput = document.getElementById("minutesInput");
const secondsInput = document.getElementById("secondsInput");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const priorityFilter = document.getElementById("priorityFilter");
const logoutBtn = document.getElementById("logoutBtn");

let activeTimers = {};

// Logout functionality
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
});

// Notifications
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}

function sendNotification(title, body) {
    if (Notification.permission === "granted") {
        new Notification(title, { body });
    }
}

// Populate timer dropdowns
function populateTimeDropdowns() {
    hoursInput.innerHTML = "";
    minutesInput.innerHTML = "";
    secondsInput.innerHTML = "";

    for (let i = 0; i < 24; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.innerText = i.toString().padStart(2, "0") + "h";
        hoursInput.appendChild(option);
    }
    for (let i = 0; i < 60; i++) {
        const minOption = document.createElement("option");
        minOption.value = i;
        minOption.innerText = i.toString().padStart(2, "0") + "m";
        minutesInput.appendChild(minOption);

        const secOption = document.createElement("option");
        secOption.value = i;
        secOption.innerText = i.toString().padStart(2, "0") + "s";
        secondsInput.appendChild(secOption);
    }
}

// Save tasks per user
function saveTasks() {
    let tasks = [];
    document.querySelectorAll(".todo-item").forEach((li) => {
        tasks.push({
            id: li.dataset.id,
            text: li.querySelector(".todo-text").innerText,
            category: li.dataset.category,
            priority: li.dataset.priority,
            deadline: li.dataset.deadline,
            duration: li.dataset.duration,
            timeLeft: li.dataset.timeLeft,
            completed: li.classList.contains("completed"),
        });
    });
    const allUsersTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
    allUsersTasks[currentUser] = tasks;
    localStorage.setItem("userTasks", JSON.stringify(allUsersTasks));
}

// Load tasks per user
function loadTasks() {
    const allUsersTasks = JSON.parse(localStorage.getItem("userTasks")) || {};
    const tasks = allUsersTasks[currentUser] || [];

    tasks.forEach((task) => {
        const li = createTodoItem(
            task.text,
            task.category,
            task.priority,
            task.deadline,
            task.duration || "0",
            task.id || Date.now().toString(),
            task.timeLeft
        );

        if (task.completed) {
            li.classList.add("completed");
            li.querySelector('input[type="checkbox"]').checked = true;
            completedList.appendChild(li);
        } else {
            activeList.appendChild(li);
        }
    });
}

// Animation for moving tasks between lists
function moveWithAnimation(item, targetList) {
    item.classList.add("task-exit");
    requestAnimationFrame(() => {
        item.classList.add("task-exit-active");
    });
    setTimeout(() => {
        item.remove();
        targetList.appendChild(item);
        item.classList.remove("task-exit", "task-exit-active");
        item.classList.add("task-enter");
        requestAnimationFrame(() => {
            item.classList.add("task-enter-active");
        });
        setTimeout(() => {
            item.classList.remove("task-enter", "task-enter-active");
        }, 250);
        saveTasks();
    }, 250);
}

// Create a new todo item
function createTodoItem(text, category, priority, deadline, duration, id, timeLeft) {
    id = id || Date.now().toString();
    duration = duration || "0";
    timeLeft = timeLeft || duration;

    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = id;
    li.dataset.category = category;
    li.dataset.priority = priority;
    if (deadline) li.dataset.deadline = deadline;
    li.dataset.duration = duration;
    li.dataset.timeLeft = timeLeft;

    const textSpan = document.createElement("span");
    textSpan.className = "todo-text";
    textSpan.innerText = text;

    const details = document.createElement("div");
    details.className = "todo-details";
    details.innerHTML = `<span class="category">${category}</span><span class="priority">${priority}</span>`;

    const deadlineSpan = document.createElement("div");
    deadlineSpan.className = "deadline";
    if (deadline) deadlineSpan.innerText = "Due: " + new Date(deadline).toLocaleString();

    // Timer section
    const durationNum = parseInt(duration);
    if (durationNum > 0) {
        const timerContainer = document.createElement("div");
        timerContainer.className = "timer-container";

        const timerDisplay = document.createElement("span");
        timerDisplay.className = "timer-display";

        let remaining = parseInt(li.dataset.timeLeft);

        function updateDisplay() {
            const hours = Math.floor(remaining / 3600);
            const minutes = Math.floor((remaining % 3600) / 60);
            const seconds = remaining % 60;
            timerDisplay.innerText =
                hours.toString().padStart(2, "0") + ":" +
                minutes.toString().padStart(2, "0") + ":" +
                seconds.toString().padStart(2, "0");
        }

        updateDisplay();

        const startBtn = document.createElement("button");
        startBtn.innerText = "▶";
        startBtn.className = "timer-btn";

        const pauseBtn = document.createElement("button");
        pauseBtn.innerText = "⏸";
        pauseBtn.className = "timer-btn";
        pauseBtn.style.display = "none";

        const resetBtn = document.createElement("button");
        resetBtn.innerText = "🔄";
        resetBtn.className = "timer-btn";
        resetBtn.style.display = "none";

        timerContainer.append(startBtn, pauseBtn, resetBtn, timerDisplay);
        li.appendChild(timerContainer);

        function stopTimer() {
            clearInterval(activeTimers[id]);
            delete activeTimers[id];
        }

        startBtn.addEventListener("click", () => {
            if (activeTimers[id]) return;

            activeTimers[id] = setInterval(() => {
                if (remaining > 0) {
                    remaining--;
                    li.dataset.timeLeft = remaining;
                    updateDisplay();
                } else {
                    stopTimer();
                    sendNotification("Timer Finished!", text);
                }
            }, 1000);

            startBtn.style.display = "none";
            pauseBtn.style.display = "inline-block";
            resetBtn.style.display = "inline-block";
        });

        pauseBtn.addEventListener("click", () => {
            stopTimer();
            startBtn.style.display = "inline-block";
            pauseBtn.style.display = "none";
        });

        resetBtn.addEventListener("click", () => {
            stopTimer();
            remaining = parseInt(duration);
            li.dataset.timeLeft = remaining;
            updateDisplay();

            startBtn.style.display = "inline-block";
            pauseBtn.style.display = "none";
            resetBtn.style.display = "none";
        });
    }

    // Buttons section
    const buttons = document.createElement("div");
    buttons.className = "button-container";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
            li.classList.add("completed");
            moveWithAnimation(li, completedList);
        } else {
            li.classList.remove("completed");
            moveWithAnimation(li, activeList);
        }
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerText = "Delete";
    deleteBtn.addEventListener("click", () => {
        // Stop timer if running
        if (activeTimers[id]) {
            clearInterval(activeTimers[id]);
            delete activeTimers[id];
        }
        li.remove();
        saveTasks();
    });

    buttons.appendChild(checkbox);
    buttons.appendChild(deleteBtn);

    li.appendChild(textSpan);
    li.appendChild(details);
    if (deadline) li.appendChild(deadlineSpan);
    li.appendChild(buttons);

    checkDeadline(li);
    return li;
}

// Add new task
addBtn.addEventListener("click", () => {
    const text = inputField.value.trim();
    if (!text) return;

    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    const duration = (hours * 3600 + minutes * 60 + seconds).toString();

    const li = createTodoItem(
        text,
        categoryInput.value,
        priorityInput.value,
        deadlineInput.value,
        duration
    );

    activeList.appendChild(li);
    inputField.value = "";
    categoryInput.value = "Personal";
    priorityInput.value = "Low";
    deadlineInput.value = "";
    hoursInput.value = "0";
    minutesInput.value = "0";
    secondsInput.value = "0";
    saveTasks();
});

// Check deadlines
function checkDeadline(li) {
    if (!li.dataset.deadline || li.classList.contains("completed")) return;
    const now = new Date();
    const deadline = new Date(li.dataset.deadline);
    const diff = deadline - now;

    li.classList.remove("near-deadline", "overdue");

    if (diff <= 0) {
        li.classList.add("overdue");
        sendNotification("Task Overdue!", li.querySelector(".todo-text").innerText);
    } else if (diff <= 3600000) {
        li.classList.add("near-deadline");
        sendNotification("Task Due Soon!", li.querySelector(".todo-text").innerText);
    }
}

// Periodically check deadlines
setInterval(() => {
    document.querySelectorAll("#activeList .todo-item").forEach(checkDeadline);
}, 30000);

// Combined filter function
function combinedFilter() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedPriority = priorityFilter.value;

    document.querySelectorAll(".todo-item").forEach(task => {
        const taskText = task.querySelector(".todo-text").innerText.toLowerCase();
        const taskCategory = task.dataset.category;
        const taskPriority = task.dataset.priority;

        const searchMatch = taskText.includes(searchTerm);
        const categoryMatch = selectedCategory === "All" || taskCategory === selectedCategory;
        const priorityMatch = selectedPriority === "All" || taskPriority === selectedPriority;

        task.style.display = (searchMatch && categoryMatch && priorityMatch) ? "flex" : "none";
    });
}

// Load tasks and attach filter listeners
document.addEventListener("DOMContentLoaded", function () {
    populateTimeDropdowns();
    loadTasks();
    searchInput.addEventListener("input", combinedFilter);
    categoryFilter.addEventListener("change", combinedFilter);
    priorityFilter.addEventListener("change", combinedFilter);
});