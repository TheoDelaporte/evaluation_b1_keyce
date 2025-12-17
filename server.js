const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const SECRET_KEY = "cle_secrete";

const USERS = [
  { id: 1, username: "admin", password: "adminpassword", role: "admin", bio: "Directeur" },
  { id: 2, username: "eleve", password: "123", role: "student", bio: "Élève modèle" },
  { id: 3, username: "toto", password: "000", role: "student", bio: "Redoublant" }
];

const GRADES = [
  { id: 101, studentId: 2, subject: "Maths", value: 18 },
  { id: 102, studentId: 2, subject: "Histoire", value: 15 },
  { id: 103, studentId: 3, subject: "Maths", value: 4 },
  { id: 104, studentId: 1, subject: "Salaire", value: 5000 }
];

const MESSAGES = [
  { id: 1, from: "admin", content: "Bienvenue sur l'intranet." }
];

const verifyAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Non connecté" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalide" });
    req.user = user;
    next();
  });
};

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ success: true, token, user: { id: user.id, username: user.username, bio: user.bio } });
  } else {
    res.status(401).json({ success: false, message: "Identifiants invalides" });
  }
});

app.post("/api/update-profile", verifyAuth, (req, res) => {
  const user = USERS.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false });

  if (typeof req.body.bio !== "string" || req.body.bio.length > 200) {
    return res.status(400).json({ success: false, message: "Bio invalide" });
  }

  user.bio = req.body.bio;
  res.json({ success: true, user });
});

app.post("/api/message", verifyAuth, (req, res) => {
  const content = req.body.content;
  if (typeof content !== "string" || content.trim() === "" || content.length > 500) {
    return res.status(400).json({ success: false, message: "Message invalide" });
  }

  const newMessage = {
    id: MESSAGES.length + 1,
    from: req.user.username,
    content: content.trim()
  };
  MESSAGES.push(newMessage);
  res.json({ success: true });
});

app.post("/api/admin/delete-student", verifyAuth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès réservé à l'admin" });
  }

  const id = parseInt(req.body.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID invalide" });

  const index = USERS.findIndex(u => u.id === id);
  if (index !== -1) {
    USERS.splice(index, 1);
    res.json({ success: true, message: `Utilisateur ${id} supprimé.` });
  } else {
    res.status(404).json({ success: false, message: "Introuvable" });
  }
});

app.get("/api/grades", verifyAuth, (req, res) => {
  if (req.user.role === "student") {
    const studentGrades = GRADES.filter(g => g.studentId === req.user.id);
    return res.json(studentGrades);
  }

  if (req.user.role === "admin") {
    return res.json(GRADES);
  }

  res.status(403).json({ message: "Accès interdit" });
});

app.get("/api/grade/detail", verifyAuth, (req, res) => {
  const id = parseInt(req.query.id);
  const grade = GRADES.find(g => g.id === id);

  if (!grade) return res.status(404).json({ message: "Note introuvable" });

  if (req.user.role === "student" && grade.studentId !== req.user.id) {
    return res.status(403).json({ message: "Accès interdit" });
  }

  res.json(grade);
});


app.listen(3000, () => console.log("Server running on port 3000"));
