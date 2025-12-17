const API_URL = "http://localhost:3000";

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (data.success) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "dashboard.html";
  } else {
    alert("Erreur login");
  }
});

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (c) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c])
  );
}

async function loadGrades() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const res = await fetch("/api/grades", {
    headers: { Authorization: "Bearer " + token },
  });

  const grades = await res.json();

  const list = document.getElementById("grades-list");
  list.innerHTML = "";
  grades.forEach((g) => {
    const colorClass = g.value < 10 ? "grade-bad" : "grade-good";
    list.innerHTML += `<li>${escapeHTML(g.subject)} : <span class="${colorClass}">${g.value}/20</span></li>`;
  });
}

function loadDashboard() {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    window.location.href = "index.html";
    return;
  }
  const user = JSON.parse(userStr);

  document.getElementById("user-name").textContent = user.username;
  document.getElementById("bio-display").textContent = user.bio;

  const params = new URLSearchParams(window.location.search);
  if (params.has("search")) {
    document.getElementById("search-result").textContent =
      "Résultat pour : " + params.get("search");
  }

  loadGrades();

  const token = localStorage.getItem("token");
  fetch("/api/messages", {
    headers: { Authorization: "Bearer " + token },
  })
    .then((res) => res.json())
    .then((msgs) => {
      const div = document.getElementById("messages-list");
      div.innerHTML = "";
      msgs.forEach((m) => {
        div.innerHTML += `<p><b>${escapeHTML(m.from)}:</b> ${escapeHTML(
          m.content
        )}</p>`;
      });
    });
}

async function updateBio() {
  const token = localStorage.getItem("token");
  const newBio = document.getElementById("new-bio").value;

  const res = await fetch("/api/profile/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ bio: newBio }),
  });

  const data = await res.json();
  if (data.success) {
    document.getElementById("bio-display").textContent = data.user.bio;
    localStorage.setItem("user", JSON.stringify(data.user));
  }
}

async function postMessage() {
  const token = localStorage.getItem("token");
  const content = document.getElementById("msg-content").value;
  await fetch("/api/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ content }),
  });
  location.reload();
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
