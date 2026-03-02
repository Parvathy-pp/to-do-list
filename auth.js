// Simple client-side authentication using localStorage

// Get elements
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

// SIGNUP
if (signupBtn) {
    signupBtn.addEventListener("click", () => {
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;

        if (!email || !password) return;

        let users = getUsers();
        if (users.find(u => u.email === email)) {
            document.getElementById("signupError").innerText = "Email already exists!";
            return;
        }

        users.push({ email, password });
        saveUsers(users);
        localStorage.setItem("currentUser", email);
        window.location.href = "index.html"; // Redirect to todo app
    });
}

// LOGIN
if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            document.getElementById("loginError").innerText = "Invalid email or password!";
            return;
        }

        localStorage.setItem("currentUser", email);
        window.location.href = "index.html"; // Redirect to todo app
    });
}