# Sensor app

This app is for managing environmental monitoring stations: the physical sites, the sensors and series measured there, the field work done at them, and the quality of the data they produce. The domain language is Danish, and the Danish term is the canonical one here.

## Lokationer og tidsserier

**Lokation**:
A physical site where monitoring happens. It has stamdata, contacts, access information and resources, and belongs to the projekt of its udstyr.
_Avoid_: site, place

**Lokationstype**:
The kind of site a lokation is, for example boring, vandløb, sø or våd natur.

**Lokationsnavn**:
The name of a lokation. For a lokation of lokationstype "Boring" it is the DGU nummer followed by " - " and a suffix, for example a local number.

**Tidsseriestatus**:
The setup state of a tidsserie:
- **Aktiv** (it has udstyr)
- **Enkeltmåling** (a kontrolhyppighed is set, but there is no udstyr, or it has been hjemtaget; _avoid_ enkeltmålestation, pejleboring)
- **Ny opsætning** (it has never had udstyr and no kontrolhyppighed is set)
- **Inaktiv** (its udstyr has been hjemtaget and no kontrolhyppighed is set)

**Lokationsstatus**:
The state shown for a lokation on the map. It is the highest tidsseriestatus among its tidsserier, in the order Aktiv, Enkeltmåling, Ny opsætning, Inaktiv. One aktiv tidsserie makes the whole lokation aktiv.

**Tidsserie**:
One measured data series at a lokation, for example water level or temperature.
_Avoid_: station, timeseries

**Tidsserietype**:
What a tidsserie measures, for example vandstand or temperatur. It decides the korrektionstype and the default kontrolhyppighed.
_Avoid_: parameter

**Tidsserienavn**:
A short prefix followed by the tidsserietype name, shown after the lokationsnavn. For a DGU-boring the indtagsnummer is the prefix.

**Beregnet tidsserie**:
A tidsserie derived from other data by a function, with no udstyr of its own.

**Måleenhed**:
The physical unit of a tidsserie's values, for example cm or °C.
_Avoid_: unit

**Terminal**:
The physical box placed at a lokation. It is identified by its terminal-ID, carries a Calypso ID label, and holds one or more udstyr.

**Sensor**:
A physical probe in a terminal. It can deliver several udstyr, for example vandstand and temperatur from the same probe.

**Udstyr**:
One measurement channel of a sensor, feeding one tidsserie for a period of time. A tidsserie keeps a history of its udstyr as hardware is swapped.
_Avoid_: enhed, unit, device

**Sensortype**:
The kind of measurement an udstyr makes. It must match the tidsserietype of the tidsserie it feeds.

**Terminal-ID**:
The hardware ID that identifies a terminal.

**Calypso ID**:
The ID on the QR label of a terminal or a boring. The label follows the terminal when it is moved. Scanning it opens the terminal's lokation (and one of its tidsserier), or a boring's indtag.
_Avoid_: label ID, labelid

**Hjemtagning**:
Ending an udstyr's period on a tidsserie, with a date and an **årsag**.
_Avoid_: end unit

**Handling**:
What happens to the hardware after a hjemtagning: nothing, or closing the udstyr, the whole sensor or the whole terminal. Closing a terminal can also end its abonnement or put it on lager.

**Abonnement**:
The customer's paid subscription for a terminal in a projekt.

**Lager**:
Watsonc's stock of terminals ready to be used again.

**Overført fakturering**:
Billing information carried over from the old udstyr to the udstyr that replaces it.

**Boring**:
A groundwater well registered in Jupiter, identified by its DGU nummer. Pejlinger are taken at a boring's indtag. A lokation of lokationstype "Boring" points to a boring by its DGU nummer.
_Avoid_: borehole, well

**Indtag**:
A specific intake (screen) in a boring.
_Avoid_: intake

**Anlæg**:
The waterworks plant a boring belongs to. Rights to boringer are given per anlæg.

**Pejlestatus**:
How close a boring is to its next due pejling: OK, **Skal snart pejles** or **Pejleinterval overskredet**.

**Målepunkt**:
The reference point that a manual water-level pejling is measured from. Its **placering** is picked from a fixed list, for example top rør, pejlestuds or overløbskant.
_Avoid_: MP, maalepunkt, watlevmp

**Jupiter-målepunkt**:
The latest målepunkt registered for a boring in Jupiter. It can be copied in as the boring's målepunkt.

**Terrænkote**:
The ground elevation at a lokation, taken from DTM or measured with dGPS.

**Stamdata**:
The master data that describes a lokation, tidsserie, udstyr or målepunkt.
_Avoid_: metadata, master data

**Opsætning**:
Setting up a målested: creating the lokation, tidsserier, udstyr and målepunkt together.
_Avoid_: opret station, create station

**Tjekliste**:
The stamdata areas that must be assessed for a lokation or tidsserie: billeder, adgang, ressourcer, kontakter, målepunkt, synkronisering, kontrolhyppighed, SLA and synlighed.
_Avoid_: station progress

**Synlighed**:
Who can see a tidsserie's data. It is two independent settings:
- **Kræver login** (only logged-in users with access can see the data)
- **Skjult offentligt** (the tidsserie is left out of public views)

**Station** (banned):
An old word that can mean a tidsserie, a lokation or an opsætning. Use one of those instead.

## Projekter, grupper og kontakter

**Organisation**:
The company a user belongs to. Funktionsadgang is given per organisation.

**Kunde**:
A customer organisation. In the map filter, "Kunde" is short for the kundeoverblik: the lokationer with Kundeservice.

**Projekt**:
The customer project that an udstyr is billed to. A lokation belongs to the projekt of its udstyr. A projekt has an **ejer**: the organisation that owns it.

**Initialt projekt**:
The projekt a lokation is given when it is created, before it has any udstyr.

**Serviceansvar**:
Who does the field work in a projekt: **Watsonc-service** or **Kundeservice**.
_Avoid_: service

**Gruppe**:
A user-defined tag that collects lokationer across projekter. Grupper are used across Watsonc's apps, for example to make an alarm cover many lokationer.

**Kontakt**:
A person tied to a lokation or a projekt, with a **kontaktrolle** describing their role there.

## Feltarbejde

**Pejling**:
A manual measurement used to check or correct a tidsserie. For vandstand it is measured from the målepunkt. A **kontrolpejling** only checks the data; a **korrektionspejling** changes it.
_Avoid_: kontrolmåling, kontrol, measurement

**Korrektionstype**:
How a korrektionspejling changes a tidsserie's data. It depends on the tidsserietype:
- **Parallelforskydning** (the data is shifted by a constant amount)
- **Lineær korrektion** (the data is scaled)
- **Simpel korrektion** (used for beregnede flow tidsserier)

Some tidsserier have no korrektionstype; their pejlinger are always kontrolpejlinger.
_Avoid_: translation, scale

**Korrektionsomfang**:
How far in time a korrektionspejling corrects the data. It never reaches data that is already godkendt:
- fremadrettet
- frem og tilbage til start af tidsserie
- lineær (used with lineær korrektion)
- frem og tilbage til udstyr
- frem og tilbage til niveauspring
- frem og tilbage til forrige pejling
- brugerdefineret dato

**Driftpejling**:
A pejling taken at a boring while the pump is running.

**Pumpestop**:
When the pump in a boring stopped before a pejling taken at rest.

**Måling ikke mulig**:
A pejling attempt that gave no value, because of overløb, a dry boring, or another reason.

**Kontrolhyppighed**:
The number of pejlinger required per year at a tidsserie.
_Avoid_: service interval, yearly controls

**Forvarsling**:
How many days before a pejling is due it is flagged.

**Tilsyn**:
A recorded field visit to a tidsserie's udstyr, with a date and a comment, where a **batteriskift** and/or an **eftersyn** was done.
_Avoid_: service, inspection

**Måleinterval** / **Sendeinterval**:
How often the udstyr measures, and how often it sends its data.

**Ressource**:
Something needed when visiting a lokation, such as equipment, safety gear, hygiene items or a certificate.

**Nøgle / adgang**:
How to get physical access to a lokation, such as a key or a code.
_Avoid_: location access

**Parkering**:
A parking spot used when visiting a lokation.
_Avoid_: parking

**Parkeringsrute**:
A route drawn on the map from a parkering to a lokation.

## Opgaver og ture

**Opgave**:
A piece of work to be done at one tidsserie, and through it at its lokation. There are two kinds:
- **Oprettet opgave**: created by hand or by konvertering. It has an opgavestatus, an ansvarlig and a forfaldsdato. It stays open until someone closes it, even if the notifikation it came from clears.
- **Notifikationsopgave**: an open notifikation shown in the opgave lists. It has an alvorlighed and a løsningsfrist.

Everyone with access to the lokation can see its opgaver, but only users in the projekt's ejer organisation (with avanceret opgaverettighed) can work with them. Opgaver with no ejer can be worked with by anyone with avanceret opgaverettighed. Superbrugere get no exception.
_Avoid_: task

**Konvertering**:
Turning a notifikation into an oprettet opgave.

**Opgavestatus**:
The state of an oprettet opgave. Each status belongs to one category: ikke startet, startet or lukket. **Feltarbejde** is the status that puts an opgave out for field work.

**Simpel opgave**:
A notifikationsopgave for a single batteriskift or kontrolpejling notifikation.

**Blokering**:
An opgave muting chosen notifikationstyper, or all of them, on its tidsserie or on the whole lokation while it is open.

**Ansvarlig**:
The one user an opgave or a tur is assigned to.

**Forfaldsdato**:
The date a person plans for an opgave to be done.

**Uplanlagt**:
Not on a tur. An **uplanlagt opgave** is an open opgave that no tur includes; **uplanlagt feltarbejde** is an opgave in Feltarbejde that has not been put on a tur yet.

**Tur**:
A field trip with at most one ansvarlig and an optional name and date. An opgave is on a tur only while its status is Feltarbejde. A tur is **afsluttet** when the last opgave on it leaves Feltarbejde. Only the organisation that created a tur can change it.
_Avoid_: trip, itinerary

**Turforberedelse**:
Gathering the kontakter, adgang, ressourcer and udstyr needed before a tur.

**Opgavestyring**:
Planning and assigning opgaver and preparing ture.
_Avoid_: task management

## Datakvalitet og alarmer

**Rådata**:
A tidsserie's values exactly as the udstyr delivered them.

**Kvalitetssikrede data**:
A tidsserie's values after justeringer and godkendelse.

**Nedbør**:
Precipitation data that can be shown alongside a tidsserie.

**Kvalitetssikring**:
Reviewing and adjusting a tidsserie's data so it can be trusted.
_Avoid_: QA

**Algoritme**:
An automatic quality check configured on a tidsserie.
_Avoid_: advarsel

**Justering**:
A manual adjustment made during kvalitetssikring. There are four kinds:
- **Godkendelse** (approval of the data up to a given date; godkendt data is never changed by later korrektioner; _avoid_ kvalitetsstempel)
- **Fjernelse** (excluding data, either a time range or individual points)
- **Valide værdier** (the allowed value range; _avoid_ grænseværdier, bounds)
- **Springkorrektion** (correcting a level jump; only for tidsserier with parallelforskydning; _avoid_ niveaukorrektion)

_Avoid_: adjustment

**Notifikation**:
A system-generated flag on a tidsserie, shown on its lokation, such as low battery, missing data or not sending. A notifikation can be converted into an opgave.

**Notifikationstype**:
The kind of notifikation, for example batteriskift, kontrolpejling or fejl i tidsstempler.

**Alvorlighed**:
How serious a notifikation is: Kritisk, Advarsel, Info or OK.

**Alarm**:
A subscription that sends chosen notifikationer on a tidsserie to **alarmkontakter**, by SMS, email or call, each within a set time window. When an alarm is linked to a gruppe, it covers every lokation in the gruppe: a chosen notifikation on any of them triggers the alarm.

**SLA**:
The umbrella term for service deadlines on a lokation. So far it holds only the **løsningsfrist**: the latest date by which a notifikation must be resolved, counted from when it was created.

**Synkronisering**:
Sending a tidsserie's data on to external systems (DMP, Jupiter). DMP synkronisering requires a **dataejer**, the CVR owner of the data.
_Avoid_: sync

## Rettigheder

**Superbruger**:
A Watsonc employee with extra rights, such as some opgavestatuser only they can set. A superbruger cannot work with opgaver owned by another organisation.

**Egen service**:
A user whose organisation does its own field service. These users see Kundeservice lokationer by default.

**Funktionsadgang**:
Which features a user's organisation has:
- **IoT-adgang** (tidsserier with udstyr)
- **Pejleboringsadgang** (Jupiter boringer and their pejlinger)
- **Opgaverettighed** (ingen; simpel, which can only view opgaver; or avanceret, which can work with them)
- **Kontakter**
- **Nøgler**
- **Ressourcer**
- **Ruter og parkering**
- **Alarmer**
- **Tjekliste**

## Known contradictions in the UI

Some UI text still uses words this glossary avoids. Fix it when the code is touched:
- "Kontrolmåling", "Indberet kontrol", "Næste kontrol", "dage før kontrol" (should be pejling / kontrolpejling)
- "enhed" (should be udstyr)
- "Sensor" as a column header, "IoT-stationer", "Enkeltmålestationer og pejleboringer" (station is banned)
- "Tidsserie type" next to "Tidsserietype"
- "Kræver rettigheder for at se tidsserien" and "Data tilgængelighed kræver login" for the same setting (Kræver login)
