const API_URL = 'http://localhost:3000';

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.success) {
        // localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'dashboard.html';
    } else {
        alert('Erreur login');
    }
});

function loadDashboard() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = 'index.html';
        return;
    }
    const user = JSON.parse(userStr);

    document.getElementById('user-name').innerText = user.username;
    document.getElementById('bio-display').innerText = user.bio;

    const params = new URLSearchParams(window.location.search);
    if (params.has('search')) {
        document.getElementById('search-result').innerText = "Résultat pour : " + params.get('search');
    }

    fetch(`/api/grades?studentId=${user.id}`)
        .then(res => res.json())
        .then(grades => {
            const list = document.getElementById('grades-list');
            grades.forEach(g => {
                const colorClass = g.value < 10 ? 'grade-bad' : 'grade-good';
                list.innerHTML += `<li>${g.subject} : <span class="${colorClass}">${g.value}/20</span> <a href="${API_URL}/api/grade/detail?id=${g.id}">Détail</a></li>`;
            });
        });

    fetch('/api/messages')
        .then(res => res.json())
        .then(msgs => {
            const div = document.getElementById('messages-list');
            msgs.forEach(m => {
                div.innerText += `<p><b>${m.from}:</b> ${m.content}</p>`;
            });
        });
}

async function updateBio() {
    const user = JSON.parse(localStorage.getItem('user'));
    const newBio = document.getElementById('new-bio').value;

    const res = await fetch('/api/profile/update', {
        method: 'POST',
         headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id: user.id, bio: newBio })
    });

    const data = await res.json();
    if (data.success) {
        user.bio = data.user.bio;
        localStorage.setItem('user', JSON.stringify(user)); 
        document.getElementById('bio-display').textContent = user.bio; 
    }
}

async function postMessage() {
    const content = document.getElementById('msg-content').value;
    await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
    location.reload();
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}