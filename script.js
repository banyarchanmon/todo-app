const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const priorityInput = document.getElementById("priorityInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const searchInput = document.getElementById("searchInput");
const sortInput = document.getElementById("sortInput");
const darkToggle = document.getElementById("darkToggle");
const progressBar = document.getElementById("progressBar");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

let tasks = [];
let filter = "all";

/* LOAD ON START */
window.addEventListener("DOMContentLoaded", loadTasks);

/* ADD TASK */
addBtn.addEventListener("click", () => {
    if (taskInput.value.trim() === "") return;

    tasks.push({
        id: Date.now(),
        text: taskInput.value,
        date: dateInput.value,
        priority: priorityInput.value,
        completed: false
    });

    save();
    render();

    taskInput.value = "";
    dateInput.value = "";
});

/* SEARCH & SORT EVENTS */
searchInput.addEventListener("input", render);
sortInput.addEventListener("change", render);

/* CLEAR COMPLETED */
clearCompletedBtn.addEventListener("click", () => {
    if(confirm("Are you sure you want to clear all completed tasks?")) {
        tasks = tasks.filter(t => !t.completed);
        save();
        render();
    }
});

/* FILTER */
function setFilter(f) {
    filter = f;
    render();
}

/* THEME TOGGLE */
darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    if (document.body.classList.contains("light")) {
        darkToggle.textContent = "🌙 Dark Mode";
    } else {
        darkToggle.textContent = "☀️ Light Mode";
    }
});

/* RENDER WITH SORT AND PROGRESS */
function render() {
    taskList.innerHTML = "";

    // 1. Filtering Logic
    let filtered = tasks.filter(t => {
        if (filter === "active") return !t.completed;
        if (filter === "completed") return t.completed;
        return true;
    });

    // 2. Searching Logic
    const searchText = searchInput.value.toLowerCase();
    filtered = filtered.filter(t => t.text.toLowerCase().includes(searchText));

    // 3. Sorting Logic (NEW)
    const sortBy = sortInput.value;
    if (sortBy === "date") {
        filtered.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return new Date(a.date) - new Date(b.date);
        });
    } else if (sortBy === "priority") {
        const priorityWeight = { "High": 3, "Medium": 2, "Low": 1 };
        filtered.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
    } else {
        // Newest First (Default)
        filtered.sort((a, b) => b.id - a.id);
    }

    // 4. Update Progress Bar & Count (NEW)
    const completedCount = tasks.filter(t => t.completed).length;
    taskCount.textContent = `Total: ${tasks.length} | Completed: ${completedCount}`;
    
    const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
    progressBar.style.width = `${progressPercent}%`;

    // 5. Generate List Elements
    filtered.forEach(task => {
        const li = document.createElement("li");
        li.className = task.completed ? "completed" : "";

        li.innerHTML = `
            <div class="task-info">
                <span class="text">${task.text}</span>
                <small>${task.date ? "📅 " + task.date : ""}</small>
                <span class="${task.priority.toLowerCase()}">
                    • ${task.priority} Priority
                </span>
            </div>

            <div>
                <button onclick="toggle(${task.id})">✔</button>
                <button onclick="editTask(${task.id})">✏️</button>
                <button onclick="deleteTask(${task.id})">❌</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

/* TOGGLE COMPLETE */
function toggle(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    save();
    render();
}

/* DELETE */
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
}

/* EDIT */
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    let newText = prompt("Edit Task:", task.text);
    if (newText !== null && newText.trim() !== "") {
        task.text = newText;
        save();
        render();
    }
}

/* SAVE TO LOCALSTORAGE */
function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* LOAD FROM LOCALSTORAGE */
function loadTasks() {
    const data = localStorage.getItem("tasks");
    if (data) {
        tasks = JSON.parse(data);
    }
    render();
}