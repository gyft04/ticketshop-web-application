# Projektbericht

**Datenbankbasierte Web-Anwendungen**
Medieninformatik | SoSe 2026

**Student:innen:** Sahel Moghimi, Lawend Ahmad, Nadim Al-Masri, Grace Farelle Tchapewo Yonta
**Dozent:** Prof. Dr. Benjamin Tannert

---

## Inhaltsverzeichnis

1. Einleitung
2. Konzeption der Webanwendung
3. Technische Umsetzung
   - 3.1 Verwendete Technologien
   - 3.2 Aufbau von Frontend und Backend
   - 3.3 REST-API und Kommunikation
   - 3.4 Installation und Ausführung
4. Datenbank
   - 4.1 Datenbankmodell
   - 4.2 Tabellen und Beziehungen
   - 4.3 Anbindung der MySQL-Datenbank
5. Funktionen des Ticketshops
   - 5.1 Eventübersicht, Suche und Filter
   - 5.2 Eventdetails und Ticketauswahl
   - 5.3 Registrierung und Login
   - 5.4 Warenkorb und Bestellvorgang
   - 5.5 Organizer-Dashboard und Shop-Seite
   - 5.6 Bestellhistorie
6. Projektorganisation
7. Fazit und Ausblick

---

## 1. Einleitung

Im Rahmen des Moduls „Datenbankbasierte Web-Anwendungen" haben wir als Semesterprojekt einen Online-Ticketshop für Veranstaltungen entwickelt. Die Idee war, eine Plattform zu bauen, die zwei Seiten abbildet: Nutzer, die Tickets kaufen möchten, und Veranstalter, die ihre Events anbieten wollen.

Orientiert haben wir uns dabei an bestehenden Ticketplattformen wie Eventim. Die Anwendung deckt die wichtigsten Abläufe ab – vom Stöbern durch Veranstaltungen über die Ticketauswahl bis hin zur Bestellung. Veranstalter können sich separat registrieren und ihre Events über ein eigenes Dashboard verwalten.

Technisch gesehen war das Ziel, das Zusammenspiel von Frontend, Backend und Datenbank in der Praxis umzusetzen. Das Angular-Frontend übernimmt die Darstellung und die Nutzerinteraktion, Node.js mit Express stellt die serverseitige Logik bereit, und MySQL speichert alle relevanten Daten dauerhaft.

---

## 2. Konzeption der Webanwendung

Zu Beginn haben wir festgelegt, welche Funktionen die Anwendung mindestens haben soll. Dabei haben wir die Plattform von Anfang an auf zwei Nutzergruppen ausgelegt: Käufer, die Tickets erwerben, und Organizer, die Events erstellen und verwalten.

Für Käufer waren folgende Funktionen vorgesehen:

- Übersicht aller verfügbaren Veranstaltungen mit Such- und Filterfunktion
- Detailseite je Event mit Ticketauswahl und Standortkarte
- Registrierung und Anmeldung
- Warenkorb mit Checkout-Prozess und Bestellbestätigung
- Einsicht in die eigene Bestellhistorie

Für Organizer haben wir zusätzlich eingeplant:

- Separate Registrierung mit eigener Shop-URL (sogenannter Slug)
- Dashboard zum Anlegen, Bearbeiten und Löschen eigener Events
- Bild-Upload für Veranstaltungsbilder
- Eigene öffentliche Shop-Seite unter `/shop/<slug>`

Von Anfang an war klar, dass alle relevanten Daten in einer relationalen Datenbank gespeichert werden müssen, nicht nur temporär im Frontend. Dazu gehören Nutzerdaten, Veranstaltungen, Ticketkategorien, Bestellungen und der Warenkorbinhalt.

---

## 3. Technische Umsetzung

### 3.1 Verwendete Technologien

Das Frontend wurde mit Angular 21 und TypeScript entwickelt. Wir haben ausschließlich Standalone Components verwendet und auf NgModules verzichtet. Für den reaktiven Zustand innerhalb der Komponenten kommen Angular Signals zum Einsatz, die es erlauben, UI-Aktualisierungen gezielt auszulösen. Die Anwendung läuft zoneless, das heißt ohne zone.js – Änderungen an der Oberfläche werden nur dann ausgelöst, wenn sich ein Signal ändert. Für die Karten auf Detailseiten nutzen wir Leaflet mit OpenStreetMap-Kacheln.

Das Backend basiert auf Node.js mit Express. Die Datenbankzugriffe erfolgen über das Paket `mysql2` mit einem Connection Pool. Für die Passwortspeicherung verwenden wir `bcryptjs`, für die Authentifizierung JSON Web Tokens (JWT) über das Paket `jsonwebtoken`. Datei-Uploads werden mit Multer verarbeitet.

Als Datenbanksystem setzen wir MySQL 8 ein. SQL-Abfragen werden direkt im Code formuliert, ohne ORM.

### 3.2 Aufbau von Frontend und Backend

Die Anwendung folgt einer klassischen Client-Server-Architektur. Das Angular-Frontend läuft im Browser des Nutzers und kommuniziert über HTTP mit dem Express-Backend. Das Backend verarbeitet die Anfragen, führt SQL-Abfragen auf der MySQL-Datenbank aus und gibt die Ergebnisse als JSON zurück.

Im Frontend ist der Code nach Seiten und Services gegliedert. Services wie `AuthService`, `CartService` oder `OrdersService` kapseln die Kommunikation mit dem Backend und stellen den Komponenten die Daten bereit. Der `CartService` verwaltet den Warenkorb zusätzlich in einer eigenen DB-Tabelle (`cart_items`), sodass der Inhalt auch nach einem Browser-Refresh erhalten bleibt.

Das Backend ist in Routes, Controller und Middleware unterteilt. Routes definieren die API-Endpunkte, Controller enthalten die eigentliche Logik, und Middleware übernimmt Querschnittsaufgaben wie die JWT-Prüfung oder die Rollenprüfung.

### 3.3 REST-API und Kommunikation

Die Kommunikation zwischen Frontend und Backend erfolgt über eine REST-API. Alle Daten werden im JSON-Format übertragen.

Die wichtigsten Endpunkte sind:

| Endpunkt | Methode | Beschreibung |
|---|---|---|
| `/api/events` | GET | Alle Veranstaltungen abrufen |
| `/api/events/:id` | GET | Einzelnes Event laden |
| `/api/events/:id/tickets` | GET | Ticketkategorien je Event |
| `/api/auth/register` | POST | Neues Konto erstellen |
| `/api/auth/login` | POST | Anmelden, Token erhalten |
| `/api/orders` | POST | Bestellung aufgeben |
| `/api/orders` | GET | Eigene Bestellungen laden |
| `/api/cart` | GET/POST/DELETE | Warenkorb verwalten |
| `/api/organizer/events` | GET/POST/PUT/DELETE | Eigene Events verwalten (nur Organizer) |
| `/api/shop/:slug` | GET | Öffentliche Shop-Seite |
| `/api/upload` | POST | Bild hochladen |

Nach dem Login erhält der Nutzer einen JWT, der Rolle und Shop-Slug enthält. Das Frontend speichert diesen Token im `localStorage` und hängt ihn bei allen geschützten Anfragen im `Authorization`-Header an. Das Backend überprüft den Token über eine Middleware und liest daraus die Nutzer-ID und die Rolle aus. Wichtig: Die Organizer-ID wird serverseitig immer aus dem Token gelesen – nie aus dem Request-Body, um Manipulationen zu verhindern.

### 3.4 Installation und Ausführung

**Voraussetzungen:** Node.js (Version 18 oder höher), eine laufende MySQL-Instanz.

**Datenbank einrichten:**
```sql
CREATE DATABASE ticketshop;
USE ticketshop;
SOURCE backend/database/schema.sql;
SOURCE backend/database/seed.sql;
```

Anschließend Migrationsskripte ausführen (aus dem `backend`-Ordner):
```bash
node scripts/migrate.js
node scripts/addGeoColumns.js
node scripts/addSlugColumn.js
node scripts/addCartTable.js
```

**Backend starten:**
```bash
cd backend
cp .env.example .env   # Datei mit eigenen DB-Zugangsdaten befüllen
npm install
node src/server.js
# läuft auf http://localhost:3000
```

Die Datei `backend/.env` enthält alle Zugangsdaten (Datenbankverbindung und JWT-Secret). Sie ist in `.gitignore` eingetragen und darf nicht ins Repository. Die benötigten Variablen sind in `backend/.env.example` dokumentiert:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=dein_passwort
DB_NAME=ticketshop
JWT_SECRET=dein_geheimer_schluessel
PORT=3000
```

**Frontend starten:**
```bash
cd frontend
npm install
ng serve
# läuft auf http://localhost:4200
```

Das Backend muss vor dem Frontend gestartet werden, da die Anwendung beim ersten Aufruf sofort die Events über die API abruft.

**Demo-Daten laden (optional):**
```bash
cd backend
node scripts/seedDemoEvents.js   # 5 Events mit lokalen Bildern
# oder für mehr Testdaten:
node scripts/importEvents.js     # 162 Events aus events.json
```

---

## 4. Datenbank

### 4.1 Datenbankmodell

Für die persistente Speicherung aller Daten wird eine relationale MySQL-Datenbank mit dem Namen `ticketshop` verwendet. Das Schema wurde so entworfen, dass Redundanzen vermieden werden und die Beziehungen zwischen den Entitäten klar abgebildet sind.

### 4.2 Tabellen und Beziehungen

Die Datenbank besteht aus sechs Tabellen:

**`users`** speichert alle registrierten Nutzer. Neben Name, E-Mail und gehashtem Passwort enthält die Tabelle eine Rolle (`user`, `organizer`, `admin`) sowie einen `slug` für Organizer, über den ihre öffentliche Shop-Seite erreichbar ist.

**`events`** enthält alle Veranstaltungen mit Titel, Beschreibung, Datum, Uhrzeit, Ort, Kategorie, Bild-URL, Status und geografischen Koordinaten (`geo_lat`, `geo_lng`). Jedes Event ist über `organizer_id` einem Nutzer zugeordnet.

**`ticket_categories`** enthält die Ticketkategorien je Veranstaltung. Einem Event können mehrere Kategorien zugeordnet sein, zum Beispiel Standard und VIP, jeweils mit eigenem Preis und verfügbarer Stückzahl.

**`orders`** speichert abgeschlossene Bestellungen mit Gesamtpreis, Bestellstatus und Referenz auf den Nutzer.

**`order_items`** enthält die einzelnen Positionen einer Bestellung mit Anzahl und dem zum Bestellzeitpunkt gültigen Preis. Dadurch bleibt die Preishistorie erhalten, auch wenn Ticketpreise später geändert werden.

**`cart_items`** speichert den aktuellen Warenkorb je Session. Da Angular-Signals beim Browser-Refresh zurückgesetzt werden, wird der Warenkorbinhalt in dieser Tabelle persistent gehalten. Die Zuordnung erfolgt über eine `session_id`, die beim ersten Besuch generiert und im `localStorage` gespeichert wird.

Die Tabellen sind über Fremdschlüsselbeziehungen verbunden:

- `events.organizer_id` → `users.id`
- `ticket_categories.event_id` → `events.id`
- `orders.user_id` → `users.id`
- `order_items.order_id` → `orders.id`
- `order_items.ticket_category_id` → `ticket_categories.id`
- `cart_items.ticket_category_id` → `ticket_categories.id`

### 4.3 Anbindung der MySQL-Datenbank

Das Backend verwendet `mysql2` mit einem Connection Pool (`db.js`). Alle Controller greifen über diesen Pool auf die Datenbank zu. SQL-Abfragen werden direkt als parametrisierte Strings formuliert, um SQL-Injection zu verhindern – Werte werden nie direkt in den Query-String eingebettet, sondern als separate Parameter übergeben.

Bei sicherheitskritischen Operationen wie dem Bestellvorgang werden Transaktionen eingesetzt. Bevor eine Bestellung angelegt wird, prüft das Backend für jede Ticketkategorie, ob noch ausreichend Stück verfügbar sind (`FOR UPDATE`-Lock). Erst wenn alle Prüfungen bestanden sind, werden die Bestellung gespeichert und die Bestände aktualisiert.

Ein Datenbankdump der vollständigen Struktur und der Seed-Daten liegt unter:
- `backend/database/schema.sql` — Tabellenstruktur
- `backend/database/seed.sql` — Demo-Nutzer und Grunddaten

---

## 5. Funktionen des Ticketshops

### 5.1 Eventübersicht, Suche und Filter

Die Startseite der Anwendung zeigt alle verfügbaren Veranstaltungen in einem responsiven Karten-Grid. Die Daten werden beim Laden der Seite einmalig vom Backend abgerufen und in einem Angular Signal gespeichert.

Suche und Filterung erfolgen ausschließlich im Frontend ohne weitere API-Aufrufe. Ein `computed`-Signal leitet aus den geladenen Events und den aktuellen Filterwerten (Suchbegriff, Kategorie) jederzeit die anzuzeigenden Events ab. Das Dropdown mit den verfügbaren Kategorien wird ebenfalls dynamisch aus den geladenen Daten generiert.

Jede Eventkarte zeigt das Veranstaltungsbild, Titel, Kategorie, Ort und Datum. Bei ausverkauften Veranstaltungen wird ein „Sold Out"-Badge eingeblendet.

### 5.2 Eventdetails und Ticketauswahl

Die Detailseite einer Veranstaltung zeigt alle relevanten Informationen sowie die verfügbaren Ticketkategorien. Für jede Kategorie kann die gewünschte Anzahl über Plus- und Minus-Buttons eingestellt werden. Die Auswahl ist auf die tatsächlich verfügbare Stückzahl begrenzt.

Hat eine Veranstaltung Geodaten hinterlegt, wird zusätzlich eine interaktive Karte mit Leaflet und OpenStreetMap eingeblendet. Der Veranstaltungsort wird mit einem Marker markiert.

Über den Button „Add to Cart" werden die ausgewählten Tickets in den Warenkorb übernommen und gleichzeitig in der Datenbank persistiert.

### 5.3 Registrierung und Login

Bei der Registrierung wählen Nutzer zuerst, ob sie als Käufer oder als Veranstalter registrieren möchten. Je nach Auswahl erscheint ein zusätzliches Feld für die Shop-URL (Slug), über die der Organizer später seine öffentliche Seite erreichbar macht. Das Passwort wird vor der Speicherung mit bcrypt gehasht.

Nach dem Login erhält der Nutzer einen JWT, der neben der Nutzer-ID auch Rolle und Slug enthält. Das Frontend dekodiert den Token clientseitig, um Rolle und Slug ohne zusätzlichen API-Aufruf bereitzustellen. Die Weiterleitung nach dem Login hängt von der Rolle ab: Organizer werden direkt zum Dashboard weitergeleitet, Käufer zur Eventübersicht.

Die Navigationsleiste passt sich ebenfalls der Rolle an. Käufer sehen Warenkorb und „My Orders", Organizer sehen ihr Dashboard.

### 5.4 Warenkorb und Bestellvorgang

Der Warenkorb zeigt alle hinzugefügten Tickets mit Event-Name, Ticketkategorie, Anzahl und Einzelpreis. Der Gesamtpreis wird automatisch berechnet. Einzelne Positionen können entfernt werden.

Über „Proceed to Checkout" gelangt der Nutzer auf die Checkout-Seite. Dort gibt er seinen Namen und eine Zahlungsmethode an (Kreditkarte, PayPal oder Rechnung) und sieht noch einmal eine Zusammenfassung der Bestellung. Erst nach Bestätigung wird die Bestellung an das Backend gesendet.

Das Backend prüft in einer Transaktion die Verfügbarkeit aller Tickets, legt die Bestellung in `orders` und `order_items` an, aktualisiert die Bestände in `ticket_categories` und löscht den Warenkorb des Nutzers. Bei Erfolg wird der Nutzer auf eine Bestellbestätigungs-Seite weitergeleitet, die die Bestellnummer und eine Übersicht der gekauften Tickets zeigt.

### 5.5 Organizer-Dashboard und Shop-Seite

Nach dem Login landen Organizer auf ihrem Dashboard, das alle bisher erstellten Events als Kartenübersicht zeigt. Über einen Button kann ein neues Event angelegt werden – ein Modal-Fenster öffnet sich mit einem Formular für Titel, Beschreibung, Datum, Uhrzeit, Ort, Kategorie, Bild sowie die Preise und Stückzahlen für Standard- und VIP-Tickets. Bestehende Events lassen sich über einen weiteren Button im gleichen Formular bearbeiten oder löschen.

Für das Veranstaltungsbild gibt es zwei Möglichkeiten: Entweder wird eine Bild-Datei direkt hochgeladen (das Backend speichert sie im Verzeichnis `uploads/` und gibt die URL zurück), oder es wird manuell eine externe URL eingetragen.

Zusätzlich wird im Dashboard ein Link zur öffentlichen Shop-Seite des Organizers angezeigt. Diese Seite ist unter `/shop/<slug>` öffentlich erreichbar, zeigt alle veröffentlichten Events des Organizers und kann an Besucher weitergegeben werden.

### 5.6 Bestellhistorie

Unter „My Orders" können angemeldete Käufer ihre bisherigen Bestellungen einsehen. Angezeigt werden Bestellnummer, Datum, die gekauften Tickets mit Veranstaltungsname und Ticketkategorie sowie der Gesamtpreis und der Bestellstatus. Der Endpunkt ist JWT-geschützt; das Backend gibt nur die Bestellungen des jeweils angemeldeten Nutzers zurück.

---

## 6. Projektorganisation

### Aufgabenverteilung

| Aufgabe | Hauptverantwortlich |
|---|---|
| Datenbankdesign (Schema, Relationen) | <!-- TODO --> |
| Backend – Auth, JWT, Middleware | <!-- TODO --> |
| Backend – Events, Orders, Cart | <!-- TODO --> |
| Frontend – Eventübersicht, Suche, Filter | <!-- TODO --> |
| Frontend – Eventdetails, Ticketauswahl, Karte | <!-- TODO --> |
| Frontend – Login, Register, Navbar | <!-- TODO --> |
| Frontend – Warenkorb, Checkout, Bestellbestätigung | <!-- TODO --> |
| Frontend – Organizer-Dashboard, Shop-Seite | <!-- TODO --> |
| Projektbericht | <!-- TODO --> |

### Externe Quellen und verwendete Bibliotheken

Folgende Teile wurden nicht vollständig selbst entwickelt:

| Komponente | Quelle |
|---|---|
| Kartendarstellung | [Leaflet](https://leafletjs.com/) (BSD-2-Clause) + [OpenStreetMap](https://www.openstreetmap.org/copyright) Kartenkacheln |
| Kartenkomponente (`map-leaflet`) | Selbst entwickelt auf Basis der Leaflet-Dokumentation |
| Passwort-Hashing | [bcryptjs](https://www.npmjs.com/package/bcryptjs) |
| JWT-Generierung/-Prüfung | [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) |
| Datenbankzugriff | [mysql2](https://www.npmjs.com/package/mysql2) |
| Datei-Upload | [Multer](https://www.npmjs.com/package/multer) |
| Event-Datensatz (`events.json`) | Abgeleitet aus öffentlich sichtbaren Daten von [Eventim](https://www.eventim.de) (nur für Demonstrationszwecke) |
| <!-- TODO: ggf. weitere Quellen ergänzen --> | |

### Projektverlauf und Herausforderungen

Die Entwicklung lief über mehrere Wochen und war in grobe Phasen eingeteilt: Anforderungen und Datenbankdesign, Backend-Implementierung, Frontend-Implementierung und abschließende Integration sowie Tests.

Die größten Herausforderungen lagen in der Integration der drei Schichten. Besonders das korrekte Verhalten des Angular-Frontends ohne zone.js war anfangs ungewohnt – da normale Properties keine UI-Updates auslösen, mussten alle Zustände konsequent über Signals verwaltet werden. Auch die Bestelltransaktion im Backend, die gleichzeitig Bestände prüft, die Bestellung anlegt und den Warenkorb löscht, erforderte mehrere Iterationen. Die Rollenlogik – zwei verschiedene Nutzertypen mit unterschiedlichen Rechten und unterschiedlichen Oberflächen – war ebenfalls aufwendiger als zunächst erwartet.

---

## 7. Fazit und Ausblick

Das Projekt hat gezeigt, wie die einzelnen Schichten einer Webanwendung – Frontend, Backend und Datenbank – miteinander zusammenarbeiten. Die Herausforderungen lagen dabei weniger in den einzelnen Technologien als in deren Zusammenspiel, besonders beim Thema Authentifizierung, rollenbasierter Zugriffssteuerung und konsistentem Zustand über mehrere Schichten hinweg.

Das Ergebnis ist eine funktionsfähige Plattform, die die grundlegenden Abläufe eines Ticketshops aus zwei Perspektiven abbildet – Käufer und Veranstalter. Eine naheliegende Erweiterung wäre die automatische Aktualisierung des Eventstatus auf „ausverkauft", sobald alle Ticketkategorien auf null gesunken sind. Auch eine Pagination für die Eventübersicht wäre sinnvoll, sobald die Datenmenge deutlich wächst. Für Veranstalter wäre eine Verkaufsübersicht interessant, die zeigt, wie viele Tickets pro Event verkauft wurden.
