# Back-end micro-services

✅ Already in this repository.
❌ Not yet migrated.

## Installation:

1) Use deploy.sh to npm install all the services with  a package.json.
2) Some service require a .env, look if there is .env-exemple.
3) Use npm start to start a service.

Note: Some service require others to work,you will have to start few services.

## Services:

-  ✅ (Authentification) Service who handle users and permissions.
-  ✅ (Safeplace) Service who handle safeplaces informations, edition and claims.
-  ✅ (Commercial) Service who handle the cycle of life of a campains and billing.
-  ✅ (Advertising) Service who broadcast the good ad to a targeted user.
-  ✅ (Stripe) Service who handle the relations with stripe.


## Annex services:

-  ❌ (auth-deploy) Service who handle the authentification service deploy.
-  ❌ (webapp-deploy) Service who handle the web app deploy.
-  ✅ (API-RUNNER) Service who test others services in production.
