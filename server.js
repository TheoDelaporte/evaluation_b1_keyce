// ===== server.js =====
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Pour tests locaux, autorisation CORS
app.use(cors({
    origin: 'http://localhost:5500', // remplacer par l’URL de ton frontend
    credentials: true
}));

// ===== Données simulées =====
const USERS = [
    { id: 1, username: 'admin', password: 'adminpassword', role: 'admin', bio: 'Directeur' },
    { id: 2, username: 'eleve', password: '123', role: 'student', bio: 'Élève modèle' },
    { id: 3, username: 'toto', password: '000', role: 'student', bio: 'Redoublant' }
];

const GRADES = [
    { id: 101, studentId: 2, subject: 'Maths', value: 18 },
    { id: 102, studentId: 2, subject: 'Histoire', value: 15 },
    { id: 103, studentId: 3, subject: 'Maths', value: 4 },
    { id: 104, studentId: 1, subject: 'Salaire', value: 5000 }
];

const MESSAGES = [
    { id: 1, from: 'admin', content: 'Bienvenue sur l\'intranet.' }
];

// ===== Middleware d'authentification =====
function verifyAuth(req, res, next) {
    const sessionId = parseInt(req.cookies.session_id);
    const user = USERS.find(u => u.id === sessionId);

    if (!user) return res.status(401).json({ success: false, message: 'Non authentifié' });

    req.user = user;
    next();
}

// ===== Authentification =====
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Champs requis' });

    const user = USERS.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    // Cookie sécurisé
    res.cookie('session_id', user.id, { httpOnly: true, sameSite: 'strict' });
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role, bio: user.bio } });
});

// ===== API sécurisée =====

// Notes (IDOR corrigé)
app.get('/api/grades', verifyAuth, (req, res) => {
    const studentId = parseInt(req.query.studentId);
    if (!studentId) return res.status(400).json({ error: 'ID étudiant requis' });

    if (req.user.role === 'student' && req.user.id !== studentId) {
        return res.status(403).json({ error: 'Accès interdit' });
    }

    const studentGrades = GRADES.filter(g => g.studentId === studentId);
    res.json(studentGrades);
});

// Détail d'une note
app.get('/api/grade/detail', verifyAuth, (req, res) => {
    const id = parseInt(req.query.id);
    if (!id) return res.status(400).json({ error: 'ID note requis' });

    const grade = GRADES.find(g => g.id === id);
    if (!grade) return res.status(404).json({ error: 'Note introuvable' });

    if (req.user.role === 'student' && grade.studentId !== req.user.id) {
        return res.status(403).json({ error: 'Accès interdit' });
    }

    res.json(grade);
});

// Mise à jour du profil (route unique sécurisée)
app.post('/api/update-profile', verifyAuth, (req, res) => {
    const { bio } = req.body;
    if (bio && bio.length > 200) return res.status(400).json({ error: 'Bio trop longue (max 200 caractères)' });

    const userIndex = USERS.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) return res.status(404).json({ error: 'Utilisateur introuvable' });

    if (bio) USERS[userIndex].bio = bio;

    res.json({ success: true, user: { id: USERS[userIndex].id, username: USERS[userIndex].username, role: USERS[userIndex].role, bio: USERS[userIndex].bio } });
});

// Messages
app.get('/api/messages', verifyAuth, (req, res) => {
    res.json(MESSAGES);
});

app.post('/api/message', verifyAuth, (req, res) => {
    const { content } = req.body;
    if (!content || content.length > 300) return res.status(400).json({ error: 'Message vide ou trop long (max 300 caractères)' });

    const newMessage = {
        id: MESSAGES.length + 1,
        from: req.user.username,
        content
    };

    MESSAGES.push(newMessage);
    res.json({ success: true });
});

// Suppression d'élève (ADMIN seulement)
app.get('/api/admin/delete-student', verifyAuth, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Accès refusé');

    const id = parseInt(req.query.id);
    if (!id) return res.status(400).send('ID requis');

    const index = USERS.findIndex(u => u.id === id);
    if (index === -1) return res.send('Introuvable');

    USERS.splice(index, 1);
    res.send(`Utilisateur ${id} supprimé.`);
});

// ===== Lancement du serveur =====
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
