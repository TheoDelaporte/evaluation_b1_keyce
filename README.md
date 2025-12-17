# evaluation_b1_keyce
1- Erreur au niveau de Samesite pour le cookie par défaut il est en lax .Solution: Mettre en strict;
2-Erreur au niveau de l'insertion du texte des utilisateurs par défauts il est en innerHTML. Solution: Mettre en inseradjacentHTML.
3-Erreur IDOR pour l'accès aux  grades de l'étudiant.Solution: ajouter le if().
4-Erreur IDOR pour l'accès aux details du grades.Solution: ajouter le if().
5-Erreur IDOR pour la suppression de l'utilisateurs .Solution: Modifier le if().
6-Erreur au niveau de l'update du profil pour devenir Admin. Solution: suppression de "Object.assign" et implementation de la liste blanche.
8-Dans le login le token n'était pas protéger.Solution: Ajout du cookies sécurisée avec : HttpOnly.
