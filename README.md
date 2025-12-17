# evaluation_b1_keyce

ERREURS TROUVEES ET CORRIGEES DANS LE PROGRAMME


1-Failles XSS
Assainissement du code  en remplaçant les méthodes qui interprètent le HTML en exécutant le script (innerHTML) par des méthodes sûr telles que innerText et textContent.
Assainissement du programme avec la bibliothèque JavaScript DOMPurify qui permet d’éviter les injections de codes dangereux

2- Création d’un Bouclier contre les attaques CSRF
Pour éviter cela, le res.json du login du server.js existant a été remplacé par une fonction qui verifie que si le httpOnly : true et le sameSite :’lax’ alors le code devra afficher que  L’authentification est réussie => 
res.cookie('auth_token', token, {
 httpOnly: true, sameSite: ‘lax’ 
}); 
res.json({ success: true, message: "Authentification réussie" });

3- Le nettoyage de la Migration HTTPONLY
Pour cela nous avons supprimer dans le login la ligne localStorage.Item et dans le loaddashboard la ligne qui permettait de récupérer le token 

4- La protection du SameSite

Afin que les données ne puissent pas être récupérer dans les cookies, l’attribut sameSite a été mis en ‘strict’.
res.cookie('auth_token', token, {
 httpOnly: true, sameSite: ‘strict’ 
}); 

5- Sécurisation de la route '/api/grade' dans server.js pour que seul le Propriétaire de l'Id puisse être la seule personne à se connecter et voir ses propres informations

6- (Server.js) Implémentation d'une whilelistening afin que le serveur puisse mettre en ligne le message(const MESSAGES) de bienvenue de la plateforme.
J'ai supprimé le object.assign dans les routes '/profile/update' et '/api/update-profile'
