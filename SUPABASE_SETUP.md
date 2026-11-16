# Configuration Supabase pour Profili A4

L'application stocke les comptes dans Supabase Auth, les profils dans `public.profiles` et les photos dans le bucket privé `profili-a4-profile-photos`. Aucun secret `service_role` n'est requis ou autorisé dans le navigateur.

## Organisation et séparation des comptes

- Les pages sont dans `HTML/`, les feuilles de style dans `CSS/` et les scripts de l'application dans `JS/`.
- Le fichier `index.html` à la racine redirige vers `HTML/index.html`, afin de conserver l'accès habituel sur un hébergement statique.
- `service-worker.js` reste un petit point d'entrée à la racine : les navigateurs exigent cet emplacement pour que le service worker puisse contrôler les pages de `HTML/`. Son implémentation est dans `JS/service-worker.js`.
- Les comptes partagent le même projet et la même table Supabase; les profils sont associés à leur propriétaire via `user_id`. Les politiques RLS ne permettent à un compte de lire ou modifier que ses propres profils. Il n'y a pas une base physique distincte par utilisateur.

## 1. Créer/configurer le projet

1. Dans le tableau de bord Supabase, créez un projet ou sélectionnez le projet de destination.
2. Ouvrez **SQL Editor** et vérifiez le projet de destination. Si les migrations n'ont pas encore été appliquées, exécutez dans l'ordre `20261116190000_profiles.sql`, `20261116213500_account_moderation.sql`, `20261116214500_terms_translations.sql`, `20261116221500_manual_billing_notifications.sql`, puis `20261116223000_account_notifications_documents.sql`. Ne réexécutez pas une migration déjà appliquée.
3. Dans **Authentication > URL Configuration**, ajoutez l'URL de déploiement de l'application aux URL autorisées. Ajoutez aussi `http://localhost:8000/HTML/app.html` pour le développement local si nécessaire.
4. Configurez les fournisseurs e-mail et les modèles de confirmation/récupération de mot de passe dans Supabase Auth. L'inscription peut nécessiter la confirmation de l'adresse avant la première connexion.
5. Dans **Project Settings > API**, copiez le Project URL et la clé publique `anon`/publishable. Ne copiez jamais la clé `service_role`.
6. Renseignez ces deux valeurs dans `JS/supabase-config.js`. Cette clé publique est destinée au navigateur; la sécurité des données repose sur RLS et les politiques du stockage, pas sur le masquage de cette clé.

Les migrations sont préparées dans le dépôt et **n'ont pas été exécutées**. Ne les exécutez pas sur un environnement réel sans vérifier le projet et sauvegarder les données existantes.

## 2. Consentement et modération des comptes

La migration incrémentale `supabase/migrations/20261116213500_account_moderation.sql` ajoute le consentement versionné aux CGU, les rôles propriétaire/délégués, l'état de suspension et le journal d'audit. Elle remplace les politiques RLS des profils et des photos afin de refuser l'accès aux comptes suspendus ou n'ayant pas accepté la version courante. Elle ne supprime aucun compte ni profil.

Le texte CGU v1.0 présent dans cette migration et dans l'écran d'inscription est un projet basé sur les règles communiquées. Faites valider sa formulation avant de l'appliquer à un environnement réel. Les comptes existants devront accepter cette version avant de retrouver l'accès à leurs profils.
La migration `supabase/migrations/20261116214500_terms_translations.sql` ajoute les textes français, anglais et russe de la version 1.0 et enregistre la langue affichée au moment de l'acceptation. Les traductions expriment le même texte contractuel; faites valider leur formulation avant déploiement.

Après vérification et sauvegarde des données :

1. Exécutez `supabase/migrations/20261116213500_account_moderation.sql` une seule fois, après la migration des profils.
2. Exécutez `supabase/migrations/20261116214500_terms_translations.sql` une seule fois, après la migration de modération.
3. Exécutez `supabase/migrations/20261116221500_manual_billing_notifications.sql` une seule fois, après les traductions des conditions.
4. Exécutez `supabase/migrations/20261116223000_account_notifications_documents.sql` une seule fois, après la migration des paiements.
5. Déployez `supabase/functions/account-moderation/index.ts` avec `supabase functions deploy account-moderation`.
6. Configurez le secret d'environnement `PROFILI_A4_OWNER_EMAIL` avec l'adresse e-mail confirmée du propriétaire initial. Le propriétaire est créé lors de sa prochaine connexion. Ne placez jamais la clé `service_role` dans `JS/supabase-config.js`; la fonction utilise les variables serveur de Supabase.
7. Testez d'abord sur un projet de développement : consentement d'un compte existant, refus RLS avant consentement, affichage des CGU dans les trois langues, suspension et blocage de l'accès, réactivation, délégation/révocation et journal d'audit.

Le propriétaire peut créer ou révoquer des délégués. Les délégués peuvent suspendre/réactiver les comptes non propriétaires, mais ne peuvent pas déléguer des rôles. Chaque action exige un motif et est journalisée. Les suspensions conservent les données, affichent un avis dans l'application et proposent un lien de recours.

L'envoi d'e-mails de modération n'est pas activé. L'avis dans l'application et le recours restent disponibles. La suppression définitive est volontairement absente jusqu'à la définition et validation de règles distinctes.

## 3. Échéances manuelles et e-mails de paiement

La migration `supabase/migrations/20261116221500_manual_billing_notifications.sql` ajoute des échéances mensuelles saisies manuellement, leur journal et une file d'envoi. Le propriétaire et les administrateurs délégués peuvent enregistrer ou modifier une échéance non payée. Une période, un montant positif, un code de devise reconnu et une date d'échéance sont requis; aucun tarif ni devise n'est préconfiguré. Les paiements confirmés sont verrouillés. Une correction passe par une annulation motivée et journalisée, puis par la création d'une nouvelle échéance.

Le bouton « Marquer payé » enregistre une confirmation manuelle faite par un administrateur; il ne vérifie ni ne traite un transfert bancaire. Il place un e-mail de confirmation dans la file. Cet e-mail est un reçu informatif simple, pas une facture fiscale. Une échéance impayée produit le premier rappel après 3 jours de retard, puis un rappel tous les 3 jours jusqu'à confirmation ou annulation. Les dates sont calculées selon la date du projet Supabase (généralement UTC). Une échéance doit être créée pour chaque période mensuelle; aucune facturation récurrente n'est générée automatiquement.

Ce service est la fonction distincte `supabase/functions/payment-notifications/index.ts`; il ne modifie pas la fonction de modération. Après avoir appliqué les migrations dans l'ordre :

1. Vérifiez un domaine et une adresse expéditrice dans Resend.
2. Configurez les secrets Supabase `RESEND_API_KEY`, `RESEND_FROM` (adresse expéditrice vérifiée) et `PAYMENT_NOTIFICATIONS_CRON_SECRET`. Ne collez jamais ces secrets dans le chat ou dans le navigateur.
3. Déployez la fonction avec `supabase functions deploy payment-notifications --no-verify-jwt`. Les actions administratives vérifient elles-mêmes la session et le rôle; le traitement planifié exige le secret dédié.
4. Configurez Supabase Cron pour appeler toutes les 5 minutes `payment-notifications` avec le corps `{"action":"process_outbox"}`, la clé publique du projet dans l'en-tête `apikey` et le secret `x-payment-cron-secret`. Les clés d’idempotence Resend aident à éviter les doublons lors des reprises; les échecs restent en file et apparaissent dans le panneau des paiements.
5. Testez d'abord avec des adresses de test : création/modification d'échéance, confirmation manuelle, e-mail de reçu, rappels à J+3 puis tous les 3 jours, annulation et e-mail de correction.

La configuration des secrets Resend, le déploiement, la planification Cron et l'envoi réel n'ont pas été effectués depuis ce dépôt.

## 4. Centre de notifications et documents personnalisés

La migration incrémentale `supabase/migrations/20261116223000_account_notifications_documents.sql` ajoute une boîte de notifications par compte, ainsi que le stockage séparé des modèles et documents. Elle reprend aussi, sans doublons, les événements déjà présents dans les journaux de modération, de paiement et la file d'e-mails. Les notifications de modération et de paiement sont créées côté base; leur consultation et le marquage comme lu sont limités au propriétaire du compte par RLS. Les comptes suspendus ou n'ayant pas accepté les conditions courantes ne peuvent pas accéder à ces données. Quand un e-mail de paiement est mis en file, son état (en attente, nouvelle tentative, accepté par Resend ou ignoré) est aussi visible dans la notification.

L'éditeur de documents propose des modèles pour les rapports de paie, les chèques de paie imprimables, les badges du personnel événementiel et les billets. Chaque compte peut modifier les champs, les afficher/masquer, les réordonner, ajouter ses propres informations, ajuster la forme, l'orientation A4, les couleurs et la police, puis enregistrer ses propres modèles et documents. Les logos et photos sont stockés dans le bucket privé existant; les fichiers acceptés sont JPEG, PNG ou WebP, jusqu'à 5 Mo.

Le chèque et le billet sont des maquettes imprimables uniquement : aucun chèque bancaire n'est émis, aucun paiement n'est traité et aucune entrée événementielle n'est validée. Aucune migration n'a été exécutée à distance; appliquez cette migration une seule fois après celles des paiements, CGU, modération et profils.

## 5. Données locales existantes

Les anciennes versions conservaient les profils dans le navigateur. Avant de remplacer/déployer l'ancienne version, connectez-vous à chaque compte local et utilisez **Export** pour sauvegarder les profils. Dans la version Supabase, connectez-vous avec le compte cloud puis utilisez **Импорт локальной копии** (Importer une copie locale). L'import prend en charge les anciennes copies JSON contenant les photos en data URL et les envoie dans le stockage privé.

Les mots de passe des anciens comptes locaux ne sont pas migrés. L'ancienne version conservait une liste d'utilisateurs dans `localStorage`; après avoir exporté tous les profils locaux, supprimez uniquement cette ancienne entrée `users` des données du site dans le navigateur. Ne videz pas toutes les données du site avant d'avoir effectué les exports. Chaque personne doit créer un compte Supabase et confirmer son adresse si la confirmation e-mail est activée. L'export cloud actuel contient les données des profils, mais pas les fichiers photo privés.

Les paramètres de présentation et photos par défaut restent enregistrés localement, isolés par identifiant de compte sur cet appareil; ils ne sont pas synchronisés entre appareils.

Le choix de langue est mémorisé globalement dans le navigateur. Après connexion, il est aussi enregistré dans les métadonnées Auth du compte, puis restauré lors d'une connexion sur un autre appareil. Cette préférence ne nécessite aucune migration SQL.

## 6. Limites opérationnelles

- L'interface PWA et ses ressources statiques sont mises en cache pour l'ouverture hors ligne. L'authentification, la synchronisation, les modifications cloud et les photos nécessitent une connexion Internet.
- L'installation PWA exige HTTPS, sauf sur localhost. Chrome/Edge affichent leur invite native lorsque les critères d'installation sont remplis; iPhone/iPad affichent les étapes Safari « Partager > Sur l'écran d'accueil », et Safari sur Mac « Fichier > Ajouter au Dock ».
- La synchronisation temps réel requiert l'activation de Realtime dans le projet Supabase. La migration ajoute la table à la publication `supabase_realtime` lorsqu'elle existe.
- Les noms de colonnes personnalisés, la confirmation e-mail et les URL de redirection doivent être vérifiés dans la configuration du projet choisi.
- Le plafond de 300 profils par compte est contrôlé dans l'interface et par un trigger PostgreSQL. Il s'applique actuellement à tous les comptes : le projet n'a pas encore d'état d'abonnement permettant de distinguer les comptes gratuits et payants.
- La limite gratuite de 300 profils est donc effective. Les offres payantes et l'augmentation de quota au-delà de cette limite restent désactivées tant qu'un prestataire de paiement et une vérification serveur des abonnements ne sont pas configurés.
- Les photos sont privées et servies avec des URL signées temporaires. Une suppression de profil supprime également sa photo; un échec de nettoyage est signalé.

## 7. Vérifications manuelles après configuration

1. Créer deux comptes distincts et confirmer les e-mails.
2. Créer un profil et une photo sur le premier compte; vérifier leur présence après reconnexion et sur un autre appareil.
3. Vérifier que le second compte ne voit pas les profils ni les photos du premier.
4. Modifier un profil sur un appareil et vérifier le rafraîchissement du profil sur l'autre.
5. Tester une image non prise en charge et une image dépassant 20 Mo; elles doivent être refusées.
6. Vérifier la récupération de mot de passe avec une URL de redirection autorisée.
7. Créer une notification de modération et une notification de paiement; vérifier qu'elles apparaissent uniquement dans le compte cible, puis tester le marquage comme lu et l'état de l'e-mail.
8. Enregistrer un modèle et un document dans chacune des quatre catégories; actualiser la liste, se reconnecter depuis un second appareil et vérifier qu'ils sont conservés.
9. Modifier l'ordre, la visibilité et les libellés de champs, ajouter un champ personnalisé, changer thème/orientation et vérifier l'aperçu ainsi que le PDF imprimé.
10. Vérifier qu'un compte suspendu ne peut pas ouvrir son centre de notifications ou ses documents tant que l'accès n'est pas réactivé.
11. Tester l'installation sur Android/Windows depuis l'invite native, sur iPhone/iPad depuis Safari et sur Mac depuis Safari; couper ensuite le réseau et vérifier que l'interface s'ouvre sans prétendre synchroniser les données cloud.
