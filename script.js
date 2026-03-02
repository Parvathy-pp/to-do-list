const list = document.getElementById("activeList");
const completedList = document.getElementById("completedList");
const inputField = document.getElementById("todoInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");
const dueDateInput = document.getElementById("dueDateInput");

// Save all tasks to localStorage
function saveTasks() {
    const activeTasks = [];
    document.querySelectorAll('#activeList .todo-item').forEach(li => {
        activeTasks.push({
            text: li.querySelector('.todo-text').innerText,
            category: li.dataset.category,
            priority: li.dataset.priority,
            dueDate: li.dataset.duedate

        });
    });

    const completedTasks = [];
    document.querySelectorAll('#completedList .todo-item').forEach(li => {
        completedTasks.push({
            text: li.querySelector('.todo-text').innerText,
            category: li.dataset.category,
            priority: li.dataset.priority,
            dueDate: li.dataset.duedate

        });
    });

    localStorage.setItem('activeTasks', JSON.stringify(activeTasks));
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
}

// Load tasks from localStorage
function loadTasks() {
    const activeTasks = JSON.parse(localStorage.getItem('activeTasks')) || [];
    const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

    activeTasks.forEach(task => {
    const newItem = createTodoItem(
        task.text,
        task.category,
        task.priority,
        task.dueDate
    );
    list.appendChild(newItem);
});

completedTasks.forEach(task => {
    const newItem = createTodoItem(
        task.text,
        task.category,
        task.priority,
        task.dueDate
    );
    newItem.querySelector('input[type="checkbox"]').checked = true;
    newItem.classList.add('completed');
    completedList.appendChild(newItem);
});
}

// Helper to close control panels
function closeAllControls() {
    document.querySelectorAll(".controls").forEach(c => {
        c.classList.remove("show-controls");
    });
}

// Create Todo Item
function createTodoItem(taskText, category = 'Personal', priority = 'Low',dueDate = '') {
    let li = document.createElement("li");
    li.classList.add("todo-item");
    li.dataset.category = category;
    li.dataset.priority = priority;
    li.dataset.duedate = dueDate;

    // Checkbox
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
            li.classList.add("completed");
            completedList.appendChild(li);
        } else {
            li.classList.remove("completed");
            list.appendChild(li);
        }
        saveTasks();
    });

    // Task text
    let span = document.createElement("span");
    span.classList.add("todo-text");
    span.innerText = taskText;

    // Info section
    let infoDiv = document.createElement("div");
    infoDiv.classList.add("task-info");

    let catBadge = document.createElement("span");
    catBadge.className = "badge category-tag";
    catBadge.innerText = category;

    let priBadge = document.createElement("span");
    priBadge.className = `badge priority-${priority.toLowerCase()}`;
    priBadge.innerText = priority;

    infoDiv.appendChild(catBadge);
    infoDiv.appendChild(priBadge);
    if(dueDate){
    let dueBadge = document.createElement("span");
    dueBadge.className = "badge";
    dueBadge.style.backgroundColor = "#3f51b5";
    dueBadge.innerText = "Due: " + dueDate;
    infoDiv.appendChild(dueBadge);
}

    // Delete Button (VISIBLE ALWAYS)
    let deleteBtn = document.createElement("span");
    deleteBtn.innerHTML = "🗑";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const confirmDelete = confirm("Are you sure you want to delete this task?");
        if (confirmDelete) {
            li.remove();
            saveTasks();
        }
    });

    // Assemble
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(infoDiv);
    li.appendChild(deleteBtn);

    return li;
}

// Add new task
document.getElementById("addBtn").addEventListener("click", function () {
    let task = inputField.value.trim();

    if (task === "") {
        alert("Task can't be empty!");
        return;
    }

    let category = categoryInput.value;
    let priority = priorityInput.value;

    let dueDate = dueDateInput.value;

let newItem = createTodoItem(task, category, priority, dueDate);
    list.appendChild(newItem);

    inputField.value = "";
    saveTasks();
});

// Load when page ready
// Filter functionality

// Load when page ready
document.addEventListener("DOMContentLoaded", function () {

    loadTasks();

    // Filter functionality
    const categoryFilter = document.getElementById("categoryFilter");
    const priorityFilter = document.getElementById("priorityFilter");

    function filterTasks() {

        const selectedCategory = categoryFilter.value;
        const selectedPriority = priorityFilter.value;

        document.querySelectorAll(".todo-item").forEach(task => {

            const taskCategory = task.dataset.category;
            const taskPriority = task.dataset.priority;

            const categoryMatch =
                selectedCategory === "All" || taskCategory === selectedCategory;

            const priorityMatch =
                selectedPriority === "All" || taskPriority === selectedPriority;

            if (categoryMatch && priorityMatch) {

                task.style.display = "flex";

            } else {

                task.style.display = "none";

            }

        });

    }

    categoryFilter.addEventListener("change", filterTasks);
    priorityFilter.addEventListener("change", filterTasks);

});