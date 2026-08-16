'use strict';

/**
 * seedDemoEvents.js
 * -----------------------------------------------------------
 * Legt 5 feste Demo-Events mit LOKALEN Bildern an.
 *
 * Ausfuehren aus dem Ordner backend:
 *     node scripts/seedDemoEvents.js
 *
 * ACHTUNG - das Skript loescht vorher:
 *     order_items, cart_items, ticket_categories, events
 * Benutzerkonten (users) bleiben unberuehrt.
 *
 * Die Bilder gehoeren nach frontend/public/events/.
 * Angular liefert alles aus public/ unter dem Root aus, aus
 * frontend/public/events/comedy-night.jpg wird also die
 * Adresse /events/comedy-night.jpg
 * -----------------------------------------------------------
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const DB_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Datum relativ zu heute, damit die Events nicht mit der Zeit
// in der Vergangenheit landen.
function inTagen(tage) {
    const d = new Date();
    d.setDate(d.getDate() + tage);
    return d.toISOString().slice(0, 10);
}

const EVENTS = [
    {
        title: 'Comedy Night Köln',
        description: 'Fünf Comedians, ein Abend, kein Blatt vor dem Mund. ' +
            'Ein Mix aus Stand-up, Improvisation und Publikumsgesprächen im ' +
            'kleinen Rahmen — Platz für rund 200 Gäste.',
        tageBisStart: 21,
        start_time: '20:00:00',
        end_time: '22:30:00',
        location: 'Studio Bühne, Köln',
        category: 'Comedy',
        image: '/events/comedy-night.jpg',
        geo_lat: 50.937531,
        geo_lng: 6.960279,
        tickets: [
            { name: 'Standard', price: 24.00, quantity_available: 150 },
            { name: 'VIP',      price: 39.00, quantity_available: 30 }
        ]
    },
    {
        title: 'Indie Sommerkonzert',
        description: 'Drei Bands aus der lokalen Indie-Szene spielen unter freiem ' +
            'Himmel. Getränke und Foodtrucks vor Ort, Einlass ab 18 Uhr.',
        tageBisStart: 35,
        start_time: '19:00:00',
        end_time: '23:00:00',
        location: 'Rheinpark, Düsseldorf',
        category: 'Konzert',
        image: '/events/indie-sommerkonzert.jpg',
        geo_lat: 51.227741,
        geo_lng: 6.773456,
        tickets: [
            { name: 'Tagesticket',  price: 32.00, quantity_available: 400 },
            { name: 'Frühbucher',   price: 25.00, quantity_available: 100 }
        ]
    },
    {
        title: 'Der Sturm — Theaterpremiere',
        description: 'Shakespeares Spätwerk in einer Inszenierung, die die Insel ' +
            'auf eine leere Bühne verlegt. Eine Stunde fünfzig ohne Pause.',
        tageBisStart: 48,
        start_time: '19:30:00',
        end_time: '21:20:00',
        location: 'Schauspielhaus, Bochum',
        category: 'Theater',
        image: '/events/der-sturm.jpg',
        geo_lat: 51.481845,
        geo_lng: 7.216236,
        tickets: [
            { name: 'Parkett', price: 42.00, quantity_available: 220 },
            { name: 'Rang',    price: 28.00, quantity_available: 180 }
        ]
    },
    {
        title: 'Elektro Open Air',
        description: 'Zwölf Stunden, zwei Floors, sechzehn DJs. Von House über ' +
            'Techno bis Ambient im Chill-Bereich. Ab 18 Jahren.',
        tageBisStart: 62,
        start_time: '14:00:00',
        end_time: '02:00:00',
        location: 'Alte Zeche, Essen',
        category: 'Festival',
        image: '/events/elektro-open-air.jpg',
        geo_lat: 51.486574,
        geo_lng: 7.043059,
        tickets: [
            { name: 'Tagesticket', price: 45.00, quantity_available: 800 },
            { name: 'VIP Area',    price: 89.00, quantity_available: 120 }
        ]
    },
    {
        title: 'Lesung: Neue Stimmen',
        description: 'Vier Debütautorinnen und -autoren lesen aus ihren ersten ' +
            'Romanen. Im Anschluss Gespräch mit dem Publikum und Signierstunde.',
        tageBisStart: 14,
        start_time: '18:30:00',
        end_time: '20:30:00',
        location: 'Stadtbibliothek, Dortmund',
        category: 'Literatur',
        image: '/events/neue-stimmen.jpg',
        geo_lat: 51.513397,
        geo_lng: 7.465298,
        tickets: [
            { name: 'Standard',   price: 12.00, quantity_available: 90 },
            { name: 'Ermäßigt',   price: 8.00,  quantity_available: 40 }
        ]
    }
];

async function main() {
    const conn = await mysql.createConnection(DB_CONFIG);
    console.log('Verbunden mit "' + DB_CONFIG.database + '".\n');

    try {
        // --- Organizer bestimmen -------------------------------------
        // Nicht fest auf ID 2 setzen: je nachdem, wer die Datenbank
        // aufgesetzt hat, kann eine andere ID der Veranstalter sein.
        const [organizers] = await conn.execute(
            "SELECT id, name, email FROM users WHERE role = 'organizer' ORDER BY id LIMIT 1"
        );

        if (organizers.length === 0) {
            console.error('FEHLER: Kein Benutzer mit Rolle organizer oder admin gefunden.');
            console.error('Lege zuerst einen an - entweder ueber seed.sql oder ueber');
            console.error('die Registrierung mit Rollenauswahl "Event Organizer".');
            return;
        }

        const organizerId = organizers[0].id;
        console.log('Veranstalter: ' + organizers[0].name +
                    ' (' + organizers[0].email + ', ID ' + organizerId + ')\n');

        // --- Aufraeumen ----------------------------------------------
        // Reihenfolge wegen der Fremdschluessel: erst was auf
        // ticket_categories zeigt, dann die Kategorien, dann die Events.
        console.log('Loesche alte Daten ...');

        for (const tabelle of ['order_items', 'cart_items', 'ticket_categories', 'events']) {
            try {
                const [r] = await conn.execute('DELETE FROM ' + tabelle);
                console.log('  ' + tabelle + ': ' + r.affectedRows + ' Zeilen geloescht');
            } catch (e) {
                if (e.code === 'ER_NO_SUCH_TABLE') {
                    console.log('  ' + tabelle + ': existiert nicht, uebersprungen');
                } else {
                    throw e;
                }
            }
        }

        // Auto-Increment zuruecksetzen, damit die Events wieder bei 1 anfangen
        await conn.execute('ALTER TABLE events AUTO_INCREMENT = 1');
        await conn.execute('ALTER TABLE ticket_categories AUTO_INCREMENT = 1');

        // --- Events einfuegen ----------------------------------------
        console.log('\nLege Events an ...');

        let ticketZaehler = 0;

        for (const ev of EVENTS) {
            const startDatum = inTagen(ev.tageBisStart);

            const [result] = await conn.execute(
                `INSERT INTO events
                    (title, description, start_date, end_date, start_time, end_time,
                     location, category, image, status, organizer_id, geo_lat, geo_lng)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    ev.title,
                    ev.description,
                    startDatum,
                    startDatum,          // eintaegige Veranstaltungen
                    ev.start_time,
                    ev.end_time,
                    ev.location,
                    ev.category,
                    ev.image,
                    'published',
                    organizerId,
                    ev.geo_lat,
                    ev.geo_lng
                ]
            );

            const eventId = result.insertId;
            console.log('  #' + eventId + '  ' + ev.title + '  (' + startDatum + ')');

            for (const t of ev.tickets) {
                await conn.execute(
                    `INSERT INTO ticket_categories
                        (name, event_id, price, quantity_available, quantity_sold)
                     VALUES (?, ?, ?, ?, 0)`,
                    [t.name, eventId, t.price, t.quantity_available]
                );
                ticketZaehler++;
            }
        }

        console.log('\nFertig: ' + EVENTS.length + ' Events, ' +
                    ticketZaehler + ' Ticketkategorien.');

        // --- Erinnerung an die Bilddateien ---------------------------
        console.log('\nDiese Dateien muessen unter frontend/public/events/ liegen:');
        EVENTS.forEach(e => console.log('  ' + e.image.replace('/events/', '')));

    } finally {
        await conn.end();
    }
}

main().catch(err => {
    console.error('\nAbbruch:', err.code || '', err.message);
    process.exit(1);
});