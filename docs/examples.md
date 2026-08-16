// app.get('/findSum/:num1/:num2', (req, res) => {
//     const num1 = req.params.num1;
//     const num2 = req.params.num2;
//     const sum = num1 * num2
//     console.log(req.params);
//     res.send(`the sum between ${num1} and ${num2} is ${sum}`)
// })

// INSERT INTO users (name, email, password, role)
// VALUES ('Test Organizer', 'organizer@test.com', 'test123', 'organizer');
// INSERT INTO events (title, description, start_date, end_date, start_time, end_time, location, category, image, status, organizer_id) 
// VALUES ('Bademeister Schaluppke', 'SPASSbad', '2025-08-21', '2025-08-21', '13:00:00', '20:00:00', 'Köln', 'Comedy & Kabarett', '6603dae7823a6c11df874cdf', 'published', '1');

  Naming convention:
  - feature/event-list-page — new feature
  - feature/login-page — new feature
  - fix/event-date-bug — bug fix

  ng new app-name erstellt ein neues Angular-Projekt mit dem Namen "app-name". Es generiert die grundlegende Projektstruktur, einschließlich der notwendigen Dateien und Ordner für die Entwicklung einer Angular-Anwendung. Dieser Befehl ist der erste Schritt, um mit der Entwicklung einer Angular-App zu beginnen.
  ng serve ist ein Befehl, der verwendet wird, um den Angular-Entwicklungsserver zu starten. Er kompiliert die Anwendung und stellt sie unter der Adresse http://localhost:4200 bereit. Während der Entwicklung überwacht ng serve die Dateien auf Änderungen und aktualisiert die Anwendung automatisch im Browser, wenn Änderungen vorgenommen werden. Dies erleichtert den Entwicklungsprozess, da Entwickler sofort sehen können, wie ihre Änderungen die Anwendung beeinflussen.
  bundle bedeutet, dass alle Dateien und Ressourcen einer Anwendung in eine oder mehrere Dateien zusammengefasst werden, um die Ladezeit zu verbessern. In Angular wird dies durch den Build-Prozess erreicht, bei dem der Code optimiert und in eine kompakte Form gebracht wird, die effizienter geladen werden kann. Dies ist besonders wichtig für die Bereitstellung der Anwendung in Produktionsumgebungen, da es die Leistung verbessert und die Benutzererfahrung optimiert.
    ng build ist ein Befehl, der verwendet wird, um eine Angular-Anwendung für die Produktion zu bauen. Er optimiert den Code, minimiert die Dateien und erstellt eine Version der Anwendung, die bereit für die Bereitstellung ist. Nach dem Ausführen von ng build werden die gebündelten Dateien im Ordner dist/ abgelegt, die dann auf einen Webserver hochgeladen werden können, um die Anwendung online verfügbar zu machen.
    