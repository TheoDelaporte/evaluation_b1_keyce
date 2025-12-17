const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

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

const verifyAuth = (req, res, next) => {
    const userId = req.cookies.session_id;
    if (!userId) {
        return res.status(401).json({ message: "Non connecté" });
    }
    const user = USERS.find(u => u.id == userId);
    if (!user) {
        return res.status(401).json({ message: "Utilisateur inconnu" });
    }
    req.user = user;
    next();
};

app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
        res.cookie('session_id', user.id);
        res.json({ success: true, user: user });
    } else {
        res.status(401).json({ success: false });
    }
});

app.get('/api/grades', (req, res) => {
    const studentId = parseInt(req.query.studentId);
    const studentGrades = GRADES.filter(g => g.studentId === studentId);
    
    res.json(studentGrades);
});

app.get('/api/grade/detail', (req, res) => {
    const id = parseInt(req.query.id);
    const grade = GRADES.find(g => g.id === id);
    
    if(grade){
        res.json(grade)
    }
    else{
        res.status(404).json({message: "Non Trouvé !"})
    }

    if (grade.studentId !== req.user.id){
        return res.status(403).send({ message:"Accès Refusé !"});
    }
});

app.post('/api/profile/update', (req, res) => {
    const userId = req.body.id; 
    const userIndex = USERS.findIndex(u => u.id == userId);
    
    if (userIndex !== -1) {
        Object.assign(USERS[userIndex], req.body);
        res.json({ success: true, user: USERS[userIndex] });
    } else {
        res.json({ success: false });
    }
});

app.get('/api/messages', (req, res) => {
    res.json(MESSAGES);
});

app.post('/api/message', (req, res) => {
    const newMessage = {
        id: MESSAGES.length + 1,
        from: req.cookies.session_id || 'Anonyme',
        content: req.body.content
    };
    MESSAGES.push(newMessage);
    res.json({ success: true });
});

app.get('/api/admin/delete-student', (req, res) => {
    const id = parseInt(req.query.id);
    const index = USERS.findIndex(u => u.id === id);
    if (index !== -1) {
        USERS.splice(index, 1);
        res.send(`Utilisateur ${id} supprimé.`);
    } else {
        res.send('Introuvable');
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));




// Route pour mettre à jour son profil
app.post('/api/update-profile', verifyAuth, (req, res) => {
    const user = USERS.find(u => u.id === req.user.id);
    
    Object.assign(user, req.body);

    res.json({ success: true, user: user });
});
