# evaluation_b1_keyce

# XSS via innerHtml
// innerHtml permet une intrusion via l'url.
![alt text](<Capture d’écran 2025-12-17 à 16.38.16.png>)

// Pour sécurisé il faut changer les innerHtml en textContent
 
# via localStorage .
 En injectant du code dans localStorage n'importe qui peut se connecter.

// Exemple
 const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

  
    if (username && password) {
        const fakeUser = {
            id: 1,
            username: username,
            bio: "Élève SafeSchool"
        };

        localStorage.setItem('user', JSON.stringify(fakeUser));
        window.location.href = 'dashboard.html';
    } else {
        alert("Identifiants invalides");
    }
});



# injection via le get 
// exemple 
 const params = new URLSearchParams(window.location.search);
    if (params.has('search')) {
        document.getElementById('search-result').innerHTML = "Résultat pour : " + params.get('search');
    }

# via l'Id
// exemple
 fetch(`/api/grades?studentId=${user.id}`)

Ne pas faire confiance au client.


# double listenner 
// exemple 
document.getElementById('loginForm')?.addEventListener('submit', ...)
document.getElementById('loginForm')?.addEventListener('submit', async ...)

peuvent renter en conflit et créer une faille. Un seul suffit.
