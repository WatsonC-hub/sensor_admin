# Sensor app

This app is for managing environmental monitoring stations: the physical sites, the sensors and series measured there, the field work done at them, and the quality of the data they produce. The domain language is Danish, and the Danish term is the canonical one here.

## Sites and measurements

**Lokation**:
A physical site where monitoring happens. It has stamdata, contacts, access information and resources.
_Avoid_: site, place

**Tidsserie**:
One measured data series at a lokation, for example water level or temperature.
_Avoid_: timeseries, station (in the code, "station" usually means a tidsserie, and the word is ambiguous)

**Udstyr**:
The physical sensor hardware attached to a tidsserie for a period of time. It keeps a history as hardware is swapped.
_Avoid_: unit, enhed, device

**Boring**:
A groundwater well registered in Jupiter, identified by its borehole number. Pejlinger are taken at a boring's indtag.
_Avoid_: borehole, well

**Indtag**:
A specific intake (screen) in a boring.
_Avoid_: intake

**Målepunkt**:
The reference point that a manual water-level pejling is measured from.
_Avoid_: MP, maalepunkt, watlevmp

**Stamdata**:
The master data that describes a lokation, tidsserie, udstyr or målepunkt.
_Avoid_: metadata, master data

**Label ID**:
The ID printed on the QR label at a station. Scanning it opens that lokation, tidsserie or boring.
_Avoid_: Calypso ID, labelid

## Field work

**Pejling**:
A manual control measurement used to check or correct a tidsserie.
_Avoid_: kontrol, control measurement

**Tilsyn**:
A field inspection of a station, for example a battery change.
_Avoid_: service, inspection

**Opgave**:
A piece of work to be done at a lokation, created manually or from a notifikation.
_Avoid_: task

**Tur**:
A planned field trip that groups opgaver and lokationer.
_Avoid_: trip, itinerary

**Opgavestyring**:
Planning and assigning opgaver and preparing ture.
_Avoid_: task management

**Ressource**:
Something needed when visiting a lokation, such as equipment, safety gear, hygiene items or a certificate.

**Nøgle / adgang**:
How to get physical access to a lokation, such as a key or a code.
_Avoid_: location access

**Parkering**:
A parking spot used when visiting a lokation.

**Parkeringsrute**:
A route drawn on the map from a parkering to a lokation.

## Data quality and alerts

**Kvalitetssikring**:
Reviewing and adjusting a tidsserie's data so it can be trusted.
_Avoid_: QA

**Algoritme**:
An automatic quality check configured on a tidsserie.

**Justering**:
A manual adjustment made during kvalitetssikring. There are four kinds:
- **Godkendelse** (approval of the data up to a given point)
- **Fjernelse** (excluding data)
- **Grænseværdier** (setting the allowed value range)
- **Niveaukorrektion** (level correction)

_Avoid_: adjustment

**Notifikation**:
A system-generated flag on a tidsserie, such as low battery, missing data or not sending. A notifikation can be turned into an opgave.

**Alarm**:
A user-defined rule on a tidsserie that alerts alarm contacts when it triggers.

**Synkronisering**:
Sending a tidsserie's data on to external systems (DMP, Jupiter).
_Avoid_: sync
