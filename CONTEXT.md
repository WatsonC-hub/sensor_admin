# Sensor app

This app is for managing environmental monitoring stations: the physical sites, the sensors and series measured there, the field work done at them, and the quality of the data they produce. The domain language is Danish, and the Danish term is the canonical one here.

## Lokationer og tidsserier

**Lokation**:
A physical site where monitoring happens. It has stamdata, contacts, access information and resources, and belongs to the projekt of its udstyr.
_Avoid_: site, place

**Lokationstype**:
The kind of site a lokation is, for example boring, vandløb, sø or våd natur.

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

**Udstyr**:
The physical sensor hardware attached to a tidsserie for a period of time. It keeps a history as hardware is swapped.
_Avoid_: enhed, unit, device, sensor

**Terminal-ID**:
The hardware ID that identifies an udstyr.

**Calypso ID**:
The ID on the QR label of an udstyr or a boring. Scanning it opens that udstyr's tidsserie or that boring.
_Avoid_: label ID, labelid

**Boring**:
A groundwater well registered in Jupiter, identified by its DGU nummer. Pejlinger are taken at a boring's indtag. A lokation of lokationstype "Boring" points to a boring by its DGU nummer.
_Avoid_: borehole, well

**Indtag**:
A specific intake (screen) in a boring.
_Avoid_: intake

**Målepunkt**:
The reference point that a manual water-level pejling is measured from.
_Avoid_: MP, maalepunkt, watlevmp

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

**Projekt**:
The customer project that an udstyr is billed to. A lokation belongs to the projekt of its udstyr.

**Initialt projekt**:
The projekt a lokation is given when it is created, before it has any udstyr.

**Serviceansvar**:
Who does the field work in a projekt: **Watsonc-service** or **Kundeservice**.
_Avoid_: service

**Gruppe**:
A user-defined tag that collects lokationer across projekter.

**Kontakt**:
A person tied to a lokation or a projekt, with a **kontaktrolle** describing their role there.

## Feltarbejde

**Pejling**:
A manual water-level measurement. A **kontrolpejling** only checks a tidsserie's data; a **korrektionspejling** changes it.
_Avoid_: kontrolmåling, kontrol, measurement

**Korrektionstype**:
How a korrektionspejling changes a tidsserie's data. It depends on the tidsserietype:
- **Parallelforskydning** (the data is shifted by a constant amount)
- **Lineær korrektion** (the data is scaled)

_Avoid_: translation, scale

**Korrektionsomfang**:
How far in time a korrektionspejling corrects the data:
- fremadrettet
- frem og tilbage til start af tidsserie
- lineær (used with lineær korrektion)
- frem og tilbage til udstyr
- frem og tilbage til niveauspring
- frem og tilbage til forrige pejling
- brugerdefineret dato

**Driftpejling**:
A pejling taken at a boring while the pump is running.

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
- **Oprettet opgave**: created by hand or by konvertering. It has an opgavestatus, an ansvarlig and a forfaldsdato.
- **Notifikationsopgave**: an open notifikation shown in the opgave lists. It has an alvorlighed and a løsningsfrist.

_Avoid_: task

**Konvertering**:
Turning a notifikation into an oprettet opgave.

**Opgavestatus**:
The state of an oprettet opgave. Each status belongs to one category: ikke startet, startet or lukket. **Feltarbejde** is the status that puts an opgave out for field work.

**Simpel opgave**:
An opgave about a batteriskift or kontrolpejling notifikation, which users with simple opgaverettighed may handle.

**Blokering**:
An opgave stopping new notifikationer of its type, either on its tidsserie or on the whole lokation.

**Forfaldsdato**:
The date a person plans for an opgave to be done.

**Tur**:
A named, dated field trip for assigned people, collecting the opgaver in Feltarbejde at its lokationer. A tur is **afsluttet** when no opgave in Feltarbejde is left on it.
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

**Kvalitetssikring**:
Reviewing and adjusting a tidsserie's data so it can be trusted.
_Avoid_: QA

**Algoritme**:
An automatic quality check configured on a tidsserie.
_Avoid_: advarsel

**Justering**:
A manual adjustment made during kvalitetssikring. There are four kinds:
- **Godkendelse** (approval of the data up to a given point; _avoid_ kvalitetsstempel)
- **Fjernelse** (excluding data, either a time range or individual points)
- **Valide værdier** (the allowed value range; _avoid_ grænseværdier, bounds)
- **Springkorrektion** (correcting a level jump; only for tidsserier with parallelforskydning; _avoid_ niveaukorrektion)

_Avoid_: adjustment

**Notifikation**:
A system-generated flag on a tidsserie, such as low battery, missing data or not sending. A notifikation can be converted into an opgave.

**Notifikationstype**:
The kind of notifikation, for example batteriskift, kontrolpejling or fejl i tidsstempler.

**Alvorlighed**:
How serious a notifikation is: Kritisk, Advarsel, Info or OK.

**Alarm**:
A subscription that sends chosen notifikationer on a tidsserie or a gruppe to **alarmkontakter**, by SMS, email or call, each within a set time window.

**Tidsseriestatus**:
A state shown for a tidsserie besides its notifikationer:
- **Inaktiv**
- **Ny opsætning** (the opsætning is not finished; no udstyr yet)
- **Enkeltmåling** (pejlinger only, no udstyr; _avoid_ enkeltmålestation, pejleboring)

**SLA**:
The umbrella term for service deadlines on a lokation. So far it holds only the **løsningsfrist**: the latest date by which a notifikation must be resolved, counted from when it was created.

**Synkronisering**:
Sending a tidsserie's data on to external systems (DMP, Jupiter). DMP synkronisering requires a **dataejer**, the CVR owner of the data.
_Avoid_: sync

## Rettigheder

**Superbruger**:
A Watsonc employee with full rights.

**Egen service**:
A user whose organisation does its own field service. These users see Kundeservice lokationer by default.

**Funktionsadgang**:
Which features a user's organisation has:
- **IoT-adgang** (tidsserier with udstyr)
- **Pejleboringsadgang** (Jupiter boringer and their pejlinger)
- **Opgaverettighed** (ingen, simpel or avanceret)
- **Kontakter**
- **Nøgler**
- **Ressourcer**
- **Ruter og parkering**
- **Alarmer**
- **Tjekliste**
