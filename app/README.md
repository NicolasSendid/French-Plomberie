# 🛠️ French Plomberie - Web App PWA

Application web progressive (PWA) conçue pour **French Plomberie**. Cette application permet aux clients de prendre rendez-vous, de consulter les prestations et de contacter l'artisan en urgence directement depuis leur smartphone.

## ✨ Fonctionnalités

- **Installation PWA** : Un bouton permet d'ajouter l'application sur l'écran d'accueil du smartphone (sans passer par l'App Store/Play Store).
- **Appel d'Urgence** : Bouton d'appel direct vers le **06 58 90 86 74**.
- **Formulaire de RDV** : Collecte des informations clients (Nom, Prénom, Tél, Mail, Adresse).
- **Géolocalisation 📍** : Possibilité pour le client d'envoyer ses coordonnées GPS précises pour faciliter l'intervention.
- **Prestations sur mesure** : Choix multiple parmi Installation Eau Chaude, Chauffage, Salle de Bains et Cuisine.
- **Emails Automatiques** : 
    - Notification instantanée pour l'artisan sur `frenchplomberie@gmail.com`.
    - Email de confirmation envoyé automatiquement au client.
- **Conformité RGPD** : Case à cocher obligatoire pour le consentement des données.

## 🚀 Technologies utilisées

- **Next.js 14** (App Router)
- **Tailwind CSS** (Design mobile-first)
- **Nodemailer** (Gestion des emails via SMTP Gmail)
- **Lucide React** (Iconographie)

## 🛠️ Installation & Configuration

### 1. Variables d'environnement
Pour que l'envoi d'emails fonctionne, vous devez configurer la variable suivante sur votre interface **Vercel** (Settings > Environment Variables) :

| Variable | Valeur |
| :--- | :--- |
| `SMTP_PASSWORD` | Votre code "Mot de passe d'application" Google (16 caractères) |

> **Note :** Pour obtenir ce code, allez dans votre compte Google > Sécurité > Validation en deux étapes > Mots de passe d'application.

### 2. Déploiement Local
```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev
