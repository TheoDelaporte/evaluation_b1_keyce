const API_URL = 'http://localhost:3000';

// -------------------- LOGIN --------------------
document.getElementById('loginForm')?.addEventListener('submit', async e => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        return alert('Veuillez remplir tous les champs');
    }

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success) {
            // Stocker uniquement l'ID et le role pour sécurité
            const sessionUser = { id: data.user.id, role: data.user.role, username: data.user.username };
            localStorage.setItem('user', JSON.stringify(sessionUser));
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message || 'Erreur login');
        }
    } catch (err) {
        console.error(err);
        alert('Erreur réseau');
    }
});

// -------------------- DASHBOARD --------------------
async function loadDashboard() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return window.location.href = 'index.html';

    const user = JSON.parse(userStr);

    document.getElementById('user-name').textContent = user.username;

    // Récupération sécurisée des infos utilisateur
    try {
        const profileRes = await fetch(`${API_URL}/api/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bio: '' }) // juste pour récupérer les données actuelles
        });
        const profileData = await profileRes.json();
        if (profileData.success) {
            document.getElementById('bio-display').textContent = profileData.user.bio;
        }
    } catch (err) {
        console.error(err);
    }

    // ---------------- Notes ----------------
    try {
        const gradesRes = await fetch(`${API_URL}/api/grades?studentId=${user.id}`);
        const grades = await gradesRes.json();
        const ul = document.getElementById('grades-list');
        ul.innerHTML = '';
        grades.forEach(g => {
            const li = document.createElement('li');
            li.textContent = `${g.subject} : ${g.value}/20`; // XSS sécurisé
            ul.appendChild(li);
        });
    } catch (err) {
        console.error(err);
    }

    // ---------------- Messages ----------------
    await loadMessages();
}

// -------------------- MESSAGES ----------------
async function loadMessages() {
    try {
        const res = await fetch(`${API_URL}/api/messages`);
        const msgs = await res.json();
        const div = document.getElementById('messages-list');
        div.innerHTML = ''; // vider avant ajout
        msgs.forEach(m => {
            const p = document.createElement('p');
            p.textContent = `${m.from}: ${m.content}`; // XSS sécurisé
            div.appendChild(p);
        });
    } catch (err) {
        console.error(err);
    }
}

// -------------------- UPDATE BIO ----------------
async function updateBio() {
    const newBio = document.getElementById('new-bio').value.trim();
    if (newBio.length > 200) return alert('Bio trop longue (max 200 caractères)');

    const user = JSON.parse(localStorage.getItem('user'));

    try {
        const res = await fetch(`${API_URL}/api/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bio: newBio })
        });
        const data = await res.json();
        if (data.success) {
            document.getElementById('bio-display').textContent = data.user.bio;
            // Mise à jour locale
            user.bio = data.user.bio;
            localStorage.setItem('user', JSON.stringify(user));
            alert('Bio mise à jour avec succès');
        } else {
            alert(data.error || 'Erreur mise à jour');
        }
    } catch (err) {
        console.error(err);
        alert('Erreur réseau lors de la mise à jour');
    }
}

// -------------------- POST MESSAGE ----------------
async function postMessage() {
    const content = document.getElementById('msg-content').value.trim();
    if (!content) return alert('Le message ne peut pas être vide');
    if (content.length > 300) return alert('Message trop long (max 300 caractères)');

    try {
        await fetch(`${API_URL}/api/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        document.getElementById('msg-content').value = '';
        await loadMessages(); // reload messages sans recharger tout le dashboard
    } catch (err) {
        console.error(err);
        alert('Erreur réseau lors de l\'envoi du message');
    }
}

// -------------------- LOGOUT ----------------
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
