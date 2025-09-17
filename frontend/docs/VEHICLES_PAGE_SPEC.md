Pagina Vehicule — Specificație (EN/RO/RU)

Obiectiv

- Centralizează evidența vehiculelor (disponibilitate, categorie, plăcuță).
- Permite operațiuni rapide (CRUD), căutare/filtrare și semnalarea întreținerii.
- Oferă vizibilitate asupra programărilor (lecții) și previne conflictele.

Acces & permisiuni

- Admin / Director / Reception: vizualizare + creare/editare/ștergere.
- Instructor: vizualizare read-only (ideal: filtrat la vehicule relevante lecțiilor lui).
- Student: fără acces.

Listă (tabel vehicule)

- Coloane vizibile: Număr înmatriculare (proeminent), Marcă, Model, An, Categorie, Disponibil (da/nu), Status întreținere (OK / Due / Overdue), Ultimul service.
- Acțiuni pe rând: Vizualizare, Editare, Duplicare (pre-completare pentru adăugare rapidă), "Marchează service due".
- Acțiuni bulk: Setează disponibil/indisponibil, Export CSV.
- Indicatori vizuali: chip verde „Disponibil”, gri „Indisponibil”, portocaliu „Service în curând”, roșu „Service întârziat”.

Filtre & căutare

- Căutare liberă: plăcuță, marcă, model.
- Filtre dedicate: Categorie, Disponibilitate, Status întreținere (OK/Due/Overdue), An (interval), Data ultimului service (înainte/după).
- Paginare: 25/50/100 per pagină.

Creare / Editare (formular)

- Câmpuri: Număr înmatriculare (unic, normalizat UPPERCASE), Marcă, Model, An (plajă validă), Categorie, Disponibil (switch), Ultimul service, Următorul service (recomandat) sau "maintenance due" (boolean), Note.
- Validări: unicitate plăcuță, an în interval, câmpuri obligatorii pentru marcă/model/plăcuță/categorie.
- Reguli UX:
  - Dacă există lecții viitoare pe vehicul, comutatorul „Disponibil” devine dezactivat și apare un mesaj clar ("există lecții programate în intervalul X–Y").
  - Dacă "Următorul service" este depășit → status "Overdue"; dacă este în următoarele 30 zile → "Due".
  - La salvare, se normalizează plăcuța (trim + uppercase) și se afișează erori prietenoase în caz de duplicat.

Pagina de detaliu (Show)

- Overview: toate câmpurile cheie + card status întreținere.
- Schedule: listă/mini-calendar cu lecțiile viitoare (student, instructor, data/ora, status).
- History: ultimele lecții efectuate cu vehiculul (pentru context operațional).
- Maintenance: date service (ultimul/următorul), note și acțiunea "Marchează service efectuat" care:
  - setează "Ultimul service" la azi,
  - propune automat o nouă dată pentru "Următorul service" (ex. +6 luni).

Logică status întreținere

- Overdue: Următorul service < azi.
- Due: Următorul service în următoarele 30 de zile.
- OK: altfel.
- Dacă nu se folosește "Următorul service", un câmp "maintenance due" (da/nu) poate controla simplificat statusul.

Interacțiuni utile

- Shortcut din detaliu: "Programează lecție cu acest vehicul" (deschide booking cu vehiculul preselectat).
- Notificări opționale: când un vehicul devine "Overdue", afișează un banner informativ pentru recepție/admin.

Mesaje UX (microcopy)

- La conflict: "Vehiculul este deja alocat la această oră. Alege un alt interval sau vehicul."
- La indisponibil cu lecții viitoare: "Nu poți marca vehiculul ca indisponibil — există lecții programate între {data1–data2}."
- La duplicat plăcuță: "Acest număr de înmatriculare există deja."

Cazuri de test (acceptance)

1. Creare vehicul valid → apare în listă cu "Disponibil = Da".
2. Unicitate plăcuță → sistemul blochează salvarea și indică eroarea pe câmp.
3. Status întreținere → setând "Următorul service" ieri, apare "Overdue" (roșu).
4. Indisponibil cu lecții → nu permite schimbarea; afișează mesajul de blocare.
5. Filtrare → filtrele (categorie, disponibil, status service) reduc corect rezultatele.
6. Export → CSV include coloanele vizibile și respectă filtrele active.

I18n (EN/RO/RU)

- Toate etichetele, mesajele și chip-urile de status sunt extrase în traduceri.
- Selector de limbă în top bar (persistă preferința).

Beneficii operaționale

- Recepția vede instant ce vehicule sunt disponibile.
- Directorul identifică rapid riscurile de întreținere.
- Instructorii au transparență asupra resurselor.
- Se reduc conflictele de programare și erorile legate de service.

Următorii pași sugerați pentru implementare

1. Extindere backend (model `Vehicle`): adaugă `last_service`, `next_service` (nullable Date), `maintenance_due` (boolean), `status` calculat (sau calculat la runtime din next_service).
2. API: expune filtre necesare `/api/vehicles/?category=...&is_available=...&status=...&year_gte=...` și endpointuri pentru import/export și `POST /api/vehicles/{id}/mark_service/`.
3. Frontend: implementare list/create/edit/show conform spec; componente reutilizate din Students page (aside filters, Datagrid remount on locale, rowStyle coloring).
4. Teste: unit & integration pentru validări și scenarii acceptare.

Am salvat această specificație în `frontend/docs/VEHICLES_PAGE_SPEC.md` pentru referință și planificare.
