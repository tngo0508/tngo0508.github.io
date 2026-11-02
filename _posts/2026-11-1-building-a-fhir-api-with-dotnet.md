---
layout: single
title: "FHIR on .NET from Zero: Concepts, Architecture, and Building Your First FHIR API Step by Step"
date: 2026-11-1
show_date: true
categories: Healthcare-IT FHIR
toc: true
toc_sticky: true
toc_label: "FHIR on .NET"
classes: wide
tags:
  - fhir
  - smart-on-fhir
  - dotnet
  - aspnet-core
  - healthcare-it
  - firely
  - api-design
---

I know REST. I can build an ASP.NET Core Web API in my sleep. But the first time I opened the FHIR specification, I felt like I had walked into the middle of a conversation that had been going on for ten years. *Resources? Profiles? Bundles? Scopes like `patient/Observation.rs`?* Every page assumed I already knew the last page.

This post is the guide I wish I'd had. It is written for a .NET developer who understands HTTP and JSON but has never touched healthcare data. By the end you will:

1. Understand **what FHIR actually is** and why it is shaped the way it is.
2. Know the **vocabulary** well enough to read the spec and vendor docs without panic.
3. Understand the **architecture choices** a healthcare company or agency actually faces (build vs. buy vs. facade).
4. **Build a working mini FHIR server in .NET** with the Firely SDK: Patient and Observation resources, search, validation, proper FHIR error responses, and a capability statement.
5. **Secure it with SMART on FHIR** (OAuth 2.0 with FHIR-specific scopes).
6. **Consume it** from a .NET client the way a real integration would.
7. Have a **learning roadmap** for what to study next.

If you want the business-side view first (how Oracle Health / Cerner exposes FHIR, how to register an app), read my earlier post [Connecting the Dots: FHIR and Oracle Health (Cerner)]({% post_url 2026-4-10-connecting-dots-fhir-oracle-cerner %}). This post is the engineering deep dive that follows it.
{: .notice--info}

---

## Part 1: What FHIR Is (And What It Is Not)

### 1.1 The one-paragraph version

**FHIR** (Fast Healthcare Interoperability Resources, pronounced "fire") is a standard published by **HL7 International** that defines:

1. A **data model**: a fixed catalog of about 150 "Resources" (Patient, Observation, Encounter, MedicationRequest, ...) with precisely defined fields and data types.
2. A **REST API**: exactly how to create, read, update, delete, search, and batch those resources over HTTP.
3. **Serialization formats**: JSON and XML representations of each resource, byte for byte.
4. A **conformance layer**: how a server declares what it supports (CapabilityStatement) and how communities tighten the rules for a specific use case (Profiles and Implementation Guides).
5. A companion security standard, **SMART on FHIR**, that defines how apps authenticate and get authorized using OAuth 2.0 and OpenID Connect.

The key insight for a REST developer is this: **you do not design the API.** With a normal Web API, you decide the URL shape, the JSON field names, the error format, the pagination style. With FHIR, *all of that is already decided*. Your job is to implement the standard faithfully. That is what makes FHIR data from a hospital in Texas readable by a clinic app written in Vietnam.

### 1.2 Why healthcare needed this

Before FHIR, healthcare interoperability ran on **HL7 v2** (pipe-delimited messages from the 1980s, still everywhere) and **HL7 v3 / CDA** (giant XML documents that were technically rigorous and practically miserable). Every hospital integration was a bespoke project with a consultant and a six-month timeline.

FHIR, started around 2011 by Grahame Grieve, made a deliberate bet: use the web's native tools (HTTP, REST, JSON, OAuth) and keep the core small. The "80/20 rule" is baked in: the base resources cover what 80% of systems need, and everything else goes into **extensions**.

In the United States this stopped being optional. The **21st Century Cures Act** and the ONC rules require certified EHRs to expose patient data via FHIR R4 APIs conforming to **US Core**, and the CMS Interoperability rules require payers (insurance companies) to expose FHIR Patient Access APIs. If you work for a healthcare company or a government health agency, FHIR is now the default integration surface.

### 1.3 FHIR versions: which one to learn

| Version | Year | Status | What you should know |
|---|---|---|---|
| DSTU2 | 2015 | Legacy | Still running in some EHR sandboxes. Avoid for new work. |
| STU3 | 2017 | Legacy | Same. |
| **R4 (4.0.1)** | 2019 | **Normative core, the industry standard** | **Learn this one.** US Core, ONC certification, and almost every vendor API are R4. |
| R4B | 2022 | Minor update | R4 with a few resources changed. Compatible for most purposes. |
| R5 | 2023 | Current release | Adoption is slow. Vendors are still on R4. |
| R6 | In progress | Ballot | Aims to make more of the spec "normative" (frozen). |

**Default to R4.** Everything in this post uses R4.

### 1.4 What FHIR is NOT

- **Not a database.** FHIR says nothing about how you store data. You can use SQL Server, Postgres, Cosmos DB, or a text file.
- **Not an EHR.** An EHR (Epic, Oracle Health, MEDITECH) is a product. FHIR is one of the ways it talks to the outside world.
- **Not a messaging bus.** Although FHIR does have a "messaging" paradigm, the REST API is what 95% of people mean when they say "FHIR".
- **Not just for hospitals.** Payers, public health agencies, labs, pharmacies, research, and consumer apps (Apple Health uses FHIR) all use it.

---

## Part 2: The Core Concepts You Must Know

This section is the glossary that nobody gives you. Read it once, then come back whenever a term trips you.

### 2.1 Resources

A **Resource** is the unit of exchange. Think of it as a strongly-typed DTO defined by the standard. Every resource has:

- A **resource type** (`Patient`, `Observation`, ...)
- An **id** assigned by the server (logical id, unique per resource type on that server)
- A **meta** element: `versionId`, `lastUpdated`, `profile`, `security`, `tag`
- Resource-specific elements

Here is a minimal real Patient in FHIR JSON:

```json
{
  "resourceType": "Patient",
  "id": "example",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2026-11-01T10:15:00Z"
  },
  "identifier": [
    {
      "system": "http://hospital.example.org/mrn",
      "value": "MRN-00012345"
    }
  ],
  "active": true,
  "name": [
    {
      "use": "official",
      "family": "Nguyen",
      "given": ["Thomas", "Minh"]
    }
  ],
  "gender": "male",
  "birthDate": "1990-05-08",
  "telecom": [
    { "system": "phone", "value": "555-0100", "use": "mobile" }
  ],
  "address": [
    {
      "line": ["123 Main St"],
      "city": "Houston",
      "state": "TX",
      "postalCode": "77001",
      "country": "US"
    }
  ]
}
```

Things to notice as a REST developer:

- **Almost everything is an array.** A person can have multiple names (maiden, official, nickname), multiple identifiers (MRN, SSN, driver's license), multiple addresses. FHIR models reality, not your convenience.
- **Field names are fixed and lowerCamelCase.** You cannot rename `birthDate` to `dob`.
- **Cardinality is strict.** The spec says `Patient.gender` is `0..1` and must come from a fixed value set (`male | female | other | unknown`). `Patient.name` is `0..*`.
- **The `resourceType` discriminator** is always present in JSON. This is how a parser knows what class to build.

The resources you will meet first in almost any project:

| Resource | What it represents | Typical question |
|---|---|---|
| `Patient` | A person receiving care | Who is this? |
| `Practitioner` / `PractitionerRole` | A clinician and their role at an organization | Who treated them? |
| `Organization` | Hospital, clinic, payer | Where? |
| `Encounter` | A visit, admission, or appointment that happened | When did they come in? |
| `Condition` | A diagnosis or problem | What is wrong? |
| `Observation` | A measurement: vitals, lab results, social history | What did we measure? |
| `MedicationRequest` | A prescription or order | What was prescribed? |
| `AllergyIntolerance` | Allergies | What must we avoid? |
| `Procedure` | Something done to the patient | What did we do? |
| `DiagnosticReport` | Lab panel or imaging report grouping Observations | What did the lab say? |
| `DocumentReference` | Pointer to a PDF, note, or image | Where is the discharge summary? |
| `Immunization` | A vaccine given | What shots? |
| `Coverage` | Insurance | Who pays? |

### 2.2 Data types

Resources are built from a fixed set of data types. The ones that confuse newcomers:

**Primitive types** mostly map to what you expect: `string`, `boolean`, `integer`, `decimal`, `date` (`YYYY`, `YYYY-MM`, or `YYYY-MM-DD`, partial dates are legal), `dateTime`, `instant` (full timestamp with timezone), `code` (a string from a fixed list), `uri`, `id`.

**Complex types** are reusable structures:

- `HumanName`: `use`, `family`, `given[]`, `prefix[]`, `suffix[]`
- `Identifier`: `system` + `value`. The system is a URI namespace so that MRN `12345` at Hospital A is not confused with MRN `12345` at Hospital B.
- `Reference`: a pointer to another resource, usually `"reference": "Patient/123"`. This is how FHIR links resources. There are no foreign keys, only URLs.
- `Quantity`: `value`, `unit`, `system` (usually UCUM, `http://unitsofmeasure.org`), `code`.
- `Period`: `start`, `end`.
- `CodeableConcept` and `Coding`: the single most important and most misunderstood type. See the next section.

### 2.3 Terminology: Coding, CodeableConcept, and why "blood pressure" is a number

Healthcare does not store "blood pressure" as a string. It stores a **code** from a **code system**:

```json
"code": {
  "coding": [
    {
      "system": "http://loinc.org",
      "code": "85354-9",
      "display": "Blood pressure panel with all children optional"
    }
  ],
  "text": "Blood pressure"
}
```

- A **Coding** is one code from one system: `system` + `code` + optional `display`.
- A **CodeableConcept** is a list of Codings that all mean the same thing (the same concept expressed in multiple vocabularies) plus a free-text `text`.

The code systems you will see constantly:

| System | URI | Used for |
|---|---|---|
| **LOINC** | `http://loinc.org` | Lab tests, vitals, clinical measurements |
| **SNOMED CT** | `http://snomed.info/sct` | Diagnoses, procedures, findings, body sites |
| **ICD-10-CM** | `http://hl7.org/fhir/sid/icd-10-cm` | Billing diagnoses (US) |
| **RxNorm** | `http://www.nlm.nih.gov/research/umls/rxnorm` | Medications (US) |
| **CPT** | `http://www.ama-assn.org/go/cpt` | Billing procedures (US) |
| **UCUM** | `http://unitsofmeasure.org` | Units (mg, mmHg, kg) |
| FHIR's own | `http://hl7.org/fhir/...` | Status codes like `final`, `active` |

A **ValueSet** is a named list of allowed codes for a field (for example, the ValueSet of Observation statuses). When a profile says a field is **bound** to a ValueSet with strength `required`, your server should reject codes outside it.

You do not need to memorize codes. You need to understand that **a FHIR server stores codes, not words**, and that a search for "all blood pressures" is really a search for `code=http://loinc.org|85354-9`.

### 2.4 References: the graph

Resources point to each other with `Reference` elements. An Observation does not embed the patient; it points to it:

```json
{
  "resourceType": "Observation",
  "id": "bp-1",
  "status": "final",
  "category": [{
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
      "code": "vital-signs"
    }]
  }],
  "code": {
    "coding": [{ "system": "http://loinc.org", "code": "85354-9" }]
  },
  "subject": { "reference": "Patient/example" },
  "encounter": { "reference": "Encounter/visit-42" },
  "effectiveDateTime": "2026-11-01T09:30:00Z",
  "component": [
    {
      "code": { "coding": [{ "system": "http://loinc.org", "code": "8480-6", "display": "Systolic" }] },
      "valueQuantity": { "value": 120, "unit": "mmHg", "system": "http://unitsofmeasure.org", "code": "mm[Hg]" }
    },
    {
      "code": { "coding": [{ "system": "http://loinc.org", "code": "8462-4", "display": "Diastolic" }] },
      "valueQuantity": { "value": 80, "unit": "mmHg", "system": "http://unitsofmeasure.org", "code": "mm[Hg]" }
    }
  ]
}
```

```text
   +-----------+        subject        +-------------+
   | Patient   | <-------------------- | Observation |
   | /example  |                       | /bp-1       |
   +-----------+                       +-------------+
         ^                                    |
         | subject                            | encounter
         |                                    v
   +-----------------+               +---------------+
   | MedicationRequest|               | Encounter     |
   | /rx-7            |               | /visit-42     |
   +-----------------+               +---------------+
```

Notice `effectiveDateTime` and `valueQuantity`. The spec defines these as **choice types**: `effective[x]` can be `effectiveDateTime` or `effectivePeriod`; `value[x]` can be `valueQuantity`, `valueString`, `valueCodeableConcept`, and so on. The JSON field name tells you which one was chosen. Your .NET SDK will model this as a base-typed property (`Observation.Value` of type `DataType`) that you cast.

### 2.5 Bundles

A **Bundle** is a resource that contains other resources. You will meet it in three forms:

1. **Search results** (`type: "searchset"`): every search returns a Bundle with `total`, `link` entries for paging (`self`, `next`, `previous`), and `entry[]` items each holding a `fullUrl` and a `resource`.
2. **Transactions and batches** (`type: "transaction"` or `"batch"`): you `POST` a Bundle to the server root, and each `entry` carries a `request` (method + URL). A transaction is atomic; a batch is not.
3. **Documents and messages**: less common, skip for now.

```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 1,
  "link": [
    { "relation": "self", "url": "https://fhir.example.org/Patient?family=Nguyen" }
  ],
  "entry": [
    {
      "fullUrl": "https://fhir.example.org/Patient/example",
      "resource": { "resourceType": "Patient", "id": "example", "...": "..." },
      "search": { "mode": "match" }
    }
  ]
}
```

### 2.6 OperationOutcome: the standard error body

Every FHIR error response carries an `OperationOutcome`, never a custom `{ "error": "..." }`:

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "not-found",
      "diagnostics": "Patient with id 'abc' was not found."
    }
  ]
}
```

`severity` is `fatal | error | warning | information`. `code` comes from a fixed ValueSet (`not-found`, `invalid`, `required`, `forbidden`, `conflict`, `processing`, ...). You can return an OperationOutcome with a 2xx status too, to carry warnings.

### 2.7 CapabilityStatement: the server's self-description

`GET [base]/metadata` returns a **CapabilityStatement**. It tells clients: which FHIR version, which resources, which interactions (read, search, create...), which search parameters, and (via an extension) where the OAuth endpoints are. Tools like Postman collections, SDKs, and certification test suites read it first. Think of it as OpenAPI for FHIR, except every server must provide it.

### 2.8 Profiles, Extensions, and Implementation Guides

The base FHIR spec is deliberately loose: almost every field is optional. That is where **Profiles** come in.

- A **Profile** is a `StructureDefinition` that constrains a base resource: "In our world, `Patient.identifier` is `1..*`, `Patient.name` is required, and `Patient.gender` must be present." It can also add **Extensions** for data the base resource lacks (US Core adds race, ethnicity, and birth sex extensions to Patient).
- An **Implementation Guide (IG)** is a published package of Profiles, ValueSets, examples, and narrative for a specific domain. **US Core** is the IG you will meet first if you are in the US. Others: International Patient Summary (IPS), Da Vinci (payer workflows), CARIN Blue Button (claims data), mCODE (oncology).
- A resource declares which profiles it claims to conform to in `meta.profile`.

Extensions look like this and can appear on almost any element:

```json
"extension": [
  {
    "url": "http://hl7.org/fhir/us/core/StructureDefinition/us-core-birthsex",
    "valueCode": "M"
  }
]
```

**Rule of thumb for a new project:** you implement *FHIR R4 + the IG your jurisdiction or partner requires*. "We support FHIR" is meaningless without naming the IG.

### 2.9 Interactions: the FHIR REST verb table

This is the part that will feel most familiar. FHIR defines these interactions over HTTP:

| Interaction | HTTP | URL | Notes |
|---|---|---|---|
| read | `GET` | `/Patient/123` | 200 with the resource. 404 if missing, **410 Gone** if deleted. |
| vread | `GET` | `/Patient/123/_history/2` | Read a specific version. |
| update | `PUT` | `/Patient/123` | Full replace. Creates if allowed and id is new ("update as create"). Returns 200 or 201. |
| patch | `PATCH` | `/Patient/123` | JSON Patch or FHIRPath Patch. |
| delete | `DELETE` | `/Patient/123` | Usually soft delete; subsequent read gives 410. |
| create | `POST` | `/Patient` | Server assigns id. Returns **201** with `Location: /Patient/123/_history/1`. |
| search | `GET` | `/Patient?family=Nguyen` or `POST /Patient/_search` | Returns a searchset Bundle. |
| history | `GET` | `/Patient/123/_history` | Bundle of versions. |
| capabilities | `GET` | `/metadata` | CapabilityStatement. |
| batch/transaction | `POST` | `/` | Bundle in, Bundle out. |
| operation | `GET`/`POST` | `/Patient/123/$everything`, `/Observation/$lastn`, `/$export` | Named RPC-style operations, prefixed with `$`. |

HTTP details that are mandated and that trip people up:

- **Content type is `application/fhir+json`** (not `application/json`). Also accept `application/json` to be friendly, but emit the FHIR one. Clients may send `?_format=json`.
- **Versioning via ETag.** Reads return `ETag: W/"2"` (the `versionId`). Updates can send `If-Match: W/"2"` for optimistic concurrency; mismatch is **412 Precondition Failed**. Strongly recommended for any clinical write.
- **`Prefer: return=minimal | representation | OperationOutcome`** controls what a create/update returns in the body.
- **Conditional create** with `If-None-Exist: identifier=http://hospital.example.org/mrn|MRN-00012345` makes `POST` idempotent. Essential for integrations that replay.
- **Conditional update** with `PUT /Patient?identifier=...` updates whichever single resource matches.
- **Validation errors** are typically `400 Bad Request` (malformed) or `422 Unprocessable Entity` (well-formed but violates business rules or profiles) with an OperationOutcome.

### 2.10 Search: the part that is actually hard

FHIR search looks like a query string, but the semantics are rich. Every resource has a fixed list of **search parameters** defined by the spec, each with a **type**:

| Param type | Example | Behavior |
|---|---|---|
| `string` | `family=ngu` | Case-insensitive, accent-insensitive **starts-with** by default. `:exact` and `:contains` modifiers. |
| `token` | `identifier=http://hospital.example.org/mrn\|MRN-00012345`, `gender=male`, `code=http://loinc.org\|85354-9` | Exact match on `system\|code`. Omit system to match any system. |
| `date` | `birthdate=1990-05-08`, `date=ge2026-01-01&date=lt2026-02-01` | Prefixes `eq ne gt lt ge le sa eb ap`. Partial dates match ranges. |
| `number` / `quantity` | `value-quantity=gt120\|http://unitsofmeasure.org\|mm[Hg]` | Prefix + optional unit. |
| `reference` | `subject=Patient/123` or `patient=123` | Follows the reference. Chaining: `subject.name=Nguyen`. |
| `uri` | `url=http://...` | For canonical resources. |
| `composite` | `component-code-value-quantity=8480-6$gt120` | Two params joined. |

Plus the **result parameters** that work on any search: `_count` (page size), `_sort=-date`, `_include=Observation:subject` (pull the referenced Patient into the same Bundle), `_revinclude=Observation:patient` (pull everything that references these patients), `_summary`, `_elements=name,birthDate`, `_total=accurate`, `_lastUpdated`, `_id`, `_profile`, `_tag`.

Multiple values in one parameter are **OR** (`gender=male,female`); repeating the parameter is **AND** (`date=ge2026-01-01&date=lt2026-02-01`).

A production FHIR server spends most of its complexity budget on search. This is the main reason I will recommend below that you *not* build a general-purpose FHIR server from scratch for production unless you have a very good reason.

---

## Part 3: SMART on FHIR, Explained for Someone Who Knows OAuth Vaguely

### 3.1 The problem SMART solves

A FHIR server holds Protected Health Information (PHI). You need to answer: **who** is calling, **on behalf of which user**, **about which patient**, and **what are they allowed to see?** Plain OAuth 2.0 gives you the first two. **SMART App Launch** (the official name of "SMART on FHIR") adds the last two with FHIR-specific conventions.

SMART is a *profile of OAuth 2.0 and OpenID Connect*. If you have used Microsoft Entra ID or Duende IdentityServer, nothing here is alien. SMART just pins down the details so that any SMART app can connect to any SMART server without custom code.

### 3.2 Discovery

A SMART-enabled FHIR server publishes `GET [base]/.well-known/smart-configuration`:

```json
{
  "issuer": "https://auth.example.org",
  "authorization_endpoint": "https://auth.example.org/connect/authorize",
  "token_endpoint": "https://auth.example.org/connect/token",
  "jwks_uri": "https://auth.example.org/.well-known/jwks",
  "scopes_supported": ["openid", "fhirUser", "launch", "launch/patient", "patient/*.rs", "user/*.rs", "offline_access"],
  "response_types_supported": ["code"],
  "capabilities": ["launch-ehr", "launch-standalone", "client-public", "client-confidential-symmetric", "context-ehr-patient", "permission-patient", "permission-user", "sso-openid-connect"],
  "code_challenge_methods_supported": ["S256"]
}
```

The same endpoints are also advertised inside the CapabilityStatement under the `oauth-uris` extension on `rest.security`. Clients look here, never in documentation.

### 3.3 Scopes: the FHIR-specific part

SMART scopes encode *context* / *resource* . *permissions*:

```text
patient/Observation.rs      read + search Observations for the ONE patient in context
user/Patient.cruds          full access to any Patient the logged-in user can see
system/*.rs                 backend service, read everything (no human user)
launch                      "I am being launched from inside an EHR, give me context"
launch/patient              "standalone launch, please ask the user to pick a patient"
openid fhirUser             return an id_token that says which Practitioner/Patient the user is
offline_access              give me a refresh token
```

- **`patient/`** scopes are limited to a single patient whose id is returned in the token response as `"patient": "123"`. Your server must enforce that every query is filtered to that patient. This is the heart of patient-facing apps.
- **`user/`** scopes are limited by whatever the logged-in user is allowed to see in the EHR. Used for clinician apps.
- **`system/`** scopes are for machine-to-machine **Backend Services** (nightly data pulls, population analytics). No user, no browser.
- The permission letters are **SMART v2**: `c`reate, `r`ead, `u`pdate, `d`elete, `s`earch. SMART v1 used `.read` / `.write` / `.*`. You will see both in the wild; most servers accept both.

### 3.4 The three launch flows

**EHR Launch.** A clinician is inside Epic or Oracle Health, clicks your app in a menu. The EHR opens your app's **launch URL** with `?iss=<fhir-base>&launch=<opaque-token>`. Your app reads `.well-known/smart-configuration` from `iss`, redirects the browser to the authorization endpoint with scopes including `launch`, gets an authorization code, exchanges it for a token, and the token response includes `patient` (and often `encounter`) so your app knows exactly which chart is open. **This is the flow Oracle Health and Epic require for apps embedded in the clinician's workflow.**

**Standalone Launch.** The user opens your app directly (a patient on their phone). You redirect to the authorization endpoint with `launch/patient`; the auth server makes them log in and, if they are a proxy for several family members, pick a patient. Token response includes `patient`.

**Backend Services.** No user. Your service signs a JWT with its private key (registered with the server as a JWKS), posts it to the token endpoint as `client_assertion` with `grant_type=client_credentials` and `scope=system/Patient.rs`, and gets an access token. This is how **Bulk Data** exports (`$export`) are typically authorized.

```text
 EHR Launch (clinician app)

 Browser (in EHR)          Your App (server)         Auth Server              FHIR Server
      |  1. launch?iss&launch   |                         |                        |
      |------------------------>|                         |                        |
      |                         | 2. GET .well-known/smart-configuration           |
      |                         |------------------------------------------------->|
      |  3. 302 -> /authorize?scope=launch openid fhirUser patient/*.rs&launch=...  |
      |<------------------------|                         |                        |
      |  4. follow redirect, user already logged in to EHR, consent                |
      |-------------------------------------------------->|                        |
      |  5. 302 -> redirect_uri?code=abc                  |                        |
      |<--------------------------------------------------|                        |
      |  6. GET redirect_uri?code=abc                     |                        |
      |------------------------>|                         |                        |
      |                         | 7. POST /token (code, PKCE verifier)             |
      |                         |------------------------>|                        |
      |                         | 8. {access_token, id_token, patient:"123"}       |
      |                         |<------------------------|                        |
      |                         | 9. GET /Observation?patient=123  (Bearer token)  |
      |                         |------------------------------------------------->|
      |                         | 10. Bundle                                       |
      |                         |<-------------------------------------------------|
```

### 3.5 What the FHIR server must enforce

When your FHIR server receives `Authorization: Bearer <jwt>`, it must:

1. **Validate the JWT** (signature against the auth server's JWKS, issuer, audience = your FHIR base URL, expiry). Standard ASP.NET Core `JwtBearer` middleware does this.
2. **Parse the SMART scopes** from the `scope` claim.
3. **Check the interaction** against the scopes: a `POST /Observation` requires a `.c` scope on `Observation` or `*`.
4. **Enforce patient context**: if the token only has `patient/` scopes, every read and search must be constrained to the `patient` claim. A `GET /Observation` with no filter becomes `GET /Observation?patient=123` whether the client asked or not. A `GET /Patient/999` for a different patient is **403**.
5. **Log** an `AuditEvent` for every access (HIPAA expects an audit trail).

We will implement steps 1 through 4 in Part 6.

---

## Part 4: Architecture. What Will You Actually Build?

Before any code, understand the three positions a .NET developer can be in. "Build a FHIR API" means very different things in each.

```text
 Position A: FHIR Client / SMART App            Position B: FHIR Facade
 ------------------------------------            --------------------------------------
 Your .NET app consumes someone else's           Your .NET API speaks FHIR on the outside
 FHIR server (Epic, Oracle Health,               and translates to a legacy system
 Azure FHIR service).                            (SQL tables, HL7 v2, SOAP) on the inside.

   [Your App] --FHIR--> [Vendor FHIR Server]       [Partner] --FHIR--> [Your Facade] --SQL--> [Legacy DB]

 Position C: FHIR Server (repository)
 ------------------------------------------------
 A full, generic FHIR store: any resource type, full search,
 history, transactions, bulk export, conformance.

   [Many Apps] --FHIR--> [FHIR Server] --> [Its own storage]
```

### 4.1 Position A: You consume FHIR

This is the most common starting point. A healthcare company wants a patient-facing app, a clinician dashboard, or an analytics pipeline that pulls from the EHR. You write a **SMART client**. You never host FHIR yourself. The Firely SDK's `FhirClient` does the HTTP for you. We cover this in Part 7.

### 4.2 Position B: You expose FHIR over something that is not FHIR

A state health agency has a 15-year-old immunization registry in SQL Server and is now required to expose it as FHIR `Immunization` resources. A payer has claims in a mainframe and must expose `ExplanationOfBenefit` for CMS Patient Access. **This is the most common reason a .NET team builds a FHIR API from scratch**, and it is a very reasonable thing to build: you only implement the resources and search parameters your IG requires, and you map them to your existing data. This is exactly what Part 5 teaches, except we use a simple store instead of a legacy one.

### 4.3 Position C: You run a full FHIR server

Here the honest advice is: **do not write one from scratch for production.** A conformant R4 server with full search, chaining, `_include`, history, transactions, profile validation, and bulk export is a multi-year effort. The ecosystem already has excellent options, several of them .NET:

| Option | Language | Notes |
|---|---|---|
| **Azure Health Data Services, FHIR service** | Managed (built on .NET) | Microsoft's PaaS. HIPAA-ready, SMART via Entra ID, `$export`, event grid. The default choice if you are an Azure shop. |
| **Microsoft FHIR Server for Azure** (`microsoft/fhir-server`) | **C# / ASP.NET Core, open source** | The code behind the managed service. Runs on SQL Server or Cosmos DB. **Read its source: it is the best real-world example of a .NET FHIR server.** |
| **Firely Server** (formerly Vonk) | C# / .NET, commercial | From the Firely team that maintains the .NET SDK. Very conformant, plugin model, used by many EU national programs. |
| **HAPI FHIR** | Java, open source | The reference implementation. `https://hapi.fhir.org/baseR4` is a free public test server you will use constantly. |
| **Google Cloud Healthcare API, AWS HealthLake** | Managed | Equivalents on other clouds. |
| **Smile CDR, IBM/LinuxForHealth, Medplum** | Various | Other commercial/open options. |

Even when you adopt one of these, you still need everything in this post: you will write SMART clients against it, write facades or custom operations around it, configure its CapabilityStatement, and debug its OperationOutcomes.

### 4.4 Reference architecture for a healthcare company

Here is a typical shape when a mid-size organization adopts FHIR properly:

```text
                               +------------------------------+
   Patient app  (SMART,  ----->|                              |
   standalone launch)          |   API Gateway / WAF          |
                               |   (Azure APIM, rate limits,  |
   Clinician app (SMART, ----->|    TLS, IP allow lists)      |
   EHR launch)                 |                              |
                               +---------------+--------------+
   Partner / payer (SMART              |                 |
   Backend Services, $export) ---------+                 |
                                                         v
   +----------------------+        +------------------------------------+
   | Authorization Server |<------>|  FHIR Server                       |
   | (Entra ID, Duende    | JWKS   |  (Azure FHIR service / Firely /    |
   |  IdentityServer,     |        |   microsoft/fhir-server / facade)  |
   |  Keycloak)           |        +----------------+-------------------+
   | - SMART scopes       |                         |
   | - launch context     |                         | (facade or sync)
   | - patient picker     |                         v
   +----------------------+        +------------------------------------+
                                   |  Systems of record                 |
                                   |  EHR (HL7 v2 feeds), LIS, PACS,    |
                                   |  claims DB, registry SQL Server    |
                                   +------------------------------------+
                                                   |
                                   +---------------v--------------------+
                                   |  Cross-cutting                     |
                                   |  AuditEvent store, Consent checks, |
                                   |  Provenance, terminology service,  |
                                   |  de-identification for analytics   |
                                   +------------------------------------+
```

Concepts you will hear in meetings:

- **Terminology service**: a FHIR server (or module) that answers "is code X in ValueSet Y?" (`ValueSet/$validate-code`) and "expand this ValueSet" (`$expand`). Needed for real validation.
- **Consent**: the `Consent` resource records what the patient agreed to share. Enforcement is your job.
- **Provenance**: who created or changed a resource and from which source system. Required by US Core for some resources.
- **Bulk Data (`$export`)**: asynchronous export of ndjson files, one line per resource, for population-level analytics. Authorized with Backend Services.
- **Subscriptions**: FHIR R4 `Subscription` resource, or the R4 "Subscriptions Backport" IG, for push notifications when resources change (for example, "tell me when a lab result for Patient/123 is final").
- **CDS Hooks**: a sibling standard for clinical decision support cards triggered inside the EHR. Often built alongside SMART apps.

---

## Part 5: Hands-On. Build a Mini FHIR Server in .NET

Now we build. The goal is a **learning server** that behaves correctly for a small slice of FHIR so you internalize the rules. It is intentionally not production-grade (in-memory storage, two resource types, a handful of search parameters), but every line follows the standard, and the shape is the same one you would use for a Position B facade.

### 5.1 Toolkit

**Firely .NET SDK** (`Hl7.Fhir.R4` on NuGet) is the de facto FHIR library for .NET, maintained by Firely and used by Microsoft's own server. It gives you:

- POCO classes for every R4 resource and data type (`Hl7.Fhir.Model.Patient`, `Observation`, `Bundle`, `OperationOutcome`...).
- JSON and XML parsers and serializers that are **FHIR-correct** (plain `System.Text.Json` would get choice types, extensions, and primitives wrong).
- `FhirClient` for calling FHIR servers.
- `ModelInfo` for reflecting over the model (what resources exist, which search parameters they have).
- FHIRPath evaluation and a validator (in companion packages).

Pick the package for your FHIR version: `Hl7.Fhir.R4`, `Hl7.Fhir.R4B`, `Hl7.Fhir.R5`, or `Hl7.Fhir.STU3`.

Other things to install:

- **.NET 10 SDK** (anything from .NET 8 up works; I use 10 to match my other posts).
- **Postman** or `curl`. There is a nice Postman collection from Firely and one from HL7.
- Optional: **Firely Terminal** (`dotnet tool install -g firely.terminal`) for working with FHIR packages and validation from the command line.
- Optional: **Visual Studio Code with the FHIR extensions**, or JetBrains Rider.

### 5.2 Create the project

```bash
dotnet new web -n MiniFhir
```

```bash
cd MiniFhir
```

```bash
dotnet add package Hl7.Fhir.R4
```

Project layout we will end with:

```text
MiniFhir/
  Program.cs                   endpoint wiring
  Fhir/
    FhirResults.cs             helpers to return application/fhir+json and OperationOutcome
    FhirRequestReader.cs       parse request body into a Resource
    CapabilityStatementFactory.cs
    SearchQuery.cs             tiny search parameter parser
  Storage/
    IResourceStore.cs
    InMemoryResourceStore.cs   versioned, soft-delete store
  Auth/                        added in Part 6
    SmartScope.cs
    SmartAuthorizationFilter.cs
```

### 5.3 Serialization helpers: speaking `application/fhir+json`

The first thing a FHIR server must get right is the wire format. We centralize it.

```csharp
// Fhir/FhirResults.cs
using Hl7.Fhir.Model;
using Hl7.Fhir.Serialization;

namespace MiniFhir.Fhir;

public static class FhirMediaType
{
    public const string Json = "application/fhir+json";
}

public static class FhirResults
{
    private static readonly FhirJsonSerializer Serializer =
        new(new SerializerSettings { Pretty = true });

    public static IResult Ok(Resource resource)
        => Resource(resource, StatusCodes.Status200OK);

    public static IResult Created(Resource resource, string baseUrl)
    {
        var location = $"{baseUrl}/{resource.TypeName}/{resource.Id}/_history/{resource.Meta?.VersionId}";
        return Resource(resource, StatusCodes.Status201Created, location);
    }

    public static IResult Resource(Resource resource, int statusCode, string? location = null)
    {
        var json = Serializer.SerializeToString(resource);
        return new FhirResourceResult(json, statusCode, resource.Meta?.VersionId, resource.Meta?.LastUpdated, location);
    }

    public static IResult Error(int statusCode, OperationOutcome.IssueType code, string diagnostics,
        OperationOutcome.IssueSeverity severity = OperationOutcome.IssueSeverity.Error)
    {
        var outcome = new OperationOutcome();
        outcome.Issue.Add(new OperationOutcome.IssueComponent
        {
            Severity = severity,
            Code = code,
            Diagnostics = diagnostics
        });
        return Resource(outcome, statusCode);
    }

    public static IResult NotFound(string type, string id)
        => Error(StatusCodes.Status404NotFound, OperationOutcome.IssueType.NotFound,
            $"{type} with id '{id}' was not found.");

    public static IResult Gone(string type, string id)
        => Error(StatusCodes.Status410Gone, OperationOutcome.IssueType.Deleted,
            $"{type} with id '{id}' has been deleted.");

    // A custom IResult so we control status, headers and content type exactly.
    private sealed class FhirResourceResult(
        string json, int statusCode, string? versionId, DateTimeOffset? lastUpdated, string? location) : IResult
    {
        public async Task ExecuteAsync(HttpContext httpContext)
        {
            var response = httpContext.Response;
            response.StatusCode = statusCode;
            response.ContentType = $"{FhirMediaType.Json}; charset=utf-8";

            if (versionId is not null)
                response.Headers.ETag = $"W/\"{versionId}\"";
            if (lastUpdated is not null)
                response.Headers.LastModified = lastUpdated.Value.ToString("R");
            if (location is not null)
                response.Headers.Location = location;

            await response.WriteAsync(json);
        }
    }
}
```

Reading a request body is the mirror image. The parser throws `FormatException` or `StructuralTypeException` on malformed input; we convert that into a `400` OperationOutcome.

```csharp
// Fhir/FhirRequestReader.cs
using Hl7.Fhir.Model;
using Hl7.Fhir.Serialization;

namespace MiniFhir.Fhir;

public sealed class FhirParseException(string message) : Exception(message);

public static class FhirRequestReader
{
    private static readonly FhirJsonParser Parser = new(new ParserSettings
    {
        AcceptUnknownMembers = false,   // reject fields that are not in the spec
        AllowUnrecognizedEnums = false  // reject codes outside required bindings on primitives
    });

    public static async Task<T> ReadAsync<T>(HttpRequest request) where T : Resource
    {
        var contentType = request.ContentType ?? "";
        if (!contentType.Contains("json", StringComparison.OrdinalIgnoreCase))
            throw new FhirParseException($"Unsupported Content-Type '{contentType}'. Use {FhirMediaType.Json}.");

        using var reader = new StreamReader(request.Body);
        var body = await reader.ReadToEndAsync();
        if (string.IsNullOrWhiteSpace(body))
            throw new FhirParseException("Request body is empty.");

        Resource parsed;
        try
        {
            parsed = Parser.Parse<Resource>(body);
        }
        catch (Exception ex) when (ex is FormatException or StructuralTypeException)
        {
            throw new FhirParseException($"Invalid FHIR JSON: {ex.Message}");
        }

        if (parsed is not T typed)
            throw new FhirParseException(
                $"Expected resourceType '{ModelInfo.GetFhirTypeNameForType(typeof(T))}' but received '{parsed.TypeName}'.");

        return typed;
    }
}
```

Why not just use `[FromBody] Patient patient` with the built-in JSON binder? Because `System.Text.Json` does not understand FHIR's choice types (`valueQuantity` vs `valueString` both map to `Observation.Value`), its primitive-with-extension pattern (`_birthDate`), or its strictness rules. The Firely parser does. If you prefer `System.Text.Json` integration, the SDK ships `JsonSerializerOptions.ForFhir(ModelInfo.ModelInspector)` which plugs FHIR-aware converters into the standard pipeline. Either approach is fine; the point is to never hand-roll FHIR JSON.

### 5.4 Storage: versioned and soft-deleting

FHIR's history and `410 Gone` semantics mean a naive dictionary is not enough. We store every version.

```csharp
// Storage/IResourceStore.cs
using Hl7.Fhir.Model;

namespace MiniFhir.Storage;

public sealed record StoredResource(Resource Resource, bool IsDeleted);

public interface IResourceStore
{
    Task<StoredResource?> GetAsync(string type, string id);
    Task<Resource?> GetVersionAsync(string type, string id, string versionId);
    Task<Resource> CreateAsync(Resource resource);
    Task<(Resource Resource, bool Created)> UpsertAsync(Resource resource);
    Task<bool> DeleteAsync(string type, string id);
    Task<IReadOnlyList<Resource>> ListAsync(string type);
    Task<IReadOnlyList<StoredResource>> HistoryAsync(string type, string id);
}
```

```csharp
// Storage/InMemoryResourceStore.cs
using System.Collections.Concurrent;
using Hl7.Fhir.Model;

namespace MiniFhir.Storage;

public sealed class InMemoryResourceStore : IResourceStore
{
    // key: "Patient/123" -> list of versions, newest last. A deleted marker is a version with Resource == null.
    private readonly ConcurrentDictionary<string, List<(Resource? Resource, string VersionId, DateTimeOffset At)>> _data = new();
    private readonly object _gate = new();

    private static string Key(string type, string id) => $"{type}/{id}";

    public Task<StoredResource?> GetAsync(string type, string id)
    {
        if (!_data.TryGetValue(Key(type, id), out var versions) || versions.Count == 0)
            return Task.FromResult<StoredResource?>(null);

        var latest = versions[^1];
        return Task.FromResult<StoredResource?>(latest.Resource is null
            ? new StoredResource(new Basic { Id = id }, IsDeleted: true)  // placeholder; callers only check IsDeleted
            : new StoredResource(latest.Resource.DeepCopy() as Resource ?? latest.Resource, IsDeleted: false));
    }

    public Task<Resource?> GetVersionAsync(string type, string id, string versionId)
    {
        if (!_data.TryGetValue(Key(type, id), out var versions))
            return Task.FromResult<Resource?>(null);
        var match = versions.FirstOrDefault(v => v.VersionId == versionId);
        return Task.FromResult(match.Resource?.DeepCopy() as Resource);
    }

    public Task<Resource> CreateAsync(Resource resource)
    {
        lock (_gate)
        {
            resource.Id = Guid.NewGuid().ToString("N")[..12];
            Stamp(resource, "1");
            _data[Key(resource.TypeName, resource.Id)] = [(resource.DeepCopy() as Resource, "1", resource.Meta.LastUpdated!.Value)];
            return Task.FromResult(resource);
        }
    }

    public Task<(Resource Resource, bool Created)> UpsertAsync(Resource resource)
    {
        lock (_gate)
        {
            var key = Key(resource.TypeName, resource.Id);
            var versions = _data.GetOrAdd(key, _ => []);
            var created = versions.Count == 0 || versions[^1].Resource is null;
            var nextVersion = (versions.Count + 1).ToString();
            Stamp(resource, nextVersion);
            versions.Add((resource.DeepCopy() as Resource, nextVersion, resource.Meta.LastUpdated!.Value));
            return Task.FromResult((resource, created));
        }
    }

    public Task<bool> DeleteAsync(string type, string id)
    {
        lock (_gate)
        {
            if (!_data.TryGetValue(Key(type, id), out var versions) || versions.Count == 0 || versions[^1].Resource is null)
                return Task.FromResult(false);
            versions.Add((null, (versions.Count + 1).ToString(), DateTimeOffset.UtcNow));
            return Task.FromResult(true);
        }
    }

    public Task<IReadOnlyList<Resource>> ListAsync(string type)
    {
        var prefix = type + "/";
        var list = _data
            .Where(kv => kv.Key.StartsWith(prefix, StringComparison.Ordinal))
            .Select(kv => kv.Value[^1].Resource)
            .Where(r => r is not null)
            .Select(r => r!.DeepCopy() as Resource ?? r!)
            .ToList();
        return Task.FromResult<IReadOnlyList<Resource>>(list);
    }

    public Task<IReadOnlyList<StoredResource>> HistoryAsync(string type, string id)
    {
        if (!_data.TryGetValue(Key(type, id), out var versions))
            return Task.FromResult<IReadOnlyList<StoredResource>>([]);
        var history = versions
            .Select(v => v.Resource is null
                ? new StoredResource(new Basic { Id = id, Meta = new Meta { VersionId = v.VersionId, LastUpdated = v.At } }, true)
                : new StoredResource(v.Resource.DeepCopy() as Resource ?? v.Resource, false))
            .Reverse()
            .ToList();
        return Task.FromResult<IReadOnlyList<StoredResource>>(history);
    }

    private static void Stamp(Resource resource, string versionId)
    {
        resource.Meta ??= new Meta();
        resource.Meta.VersionId = versionId;
        resource.Meta.LastUpdated = DateTimeOffset.UtcNow;
    }
}
```

In a real facade, `IResourceStore` is where you call your legacy SQL and map rows to resources. In Microsoft's server it is backed by a `Resource` table holding the raw JSON plus a set of **search index tables** (one per search parameter type: `TokenSearchParam`, `DateTimeSearchParam`, `StringSearchParam`...) populated at write time. That design, "store the document, index the search params separately," is the standard pattern and worth remembering.

### 5.5 A minimal search parameter parser

We will support, for Patient: `_id`, `identifier`, `family`, `given`, `name`, `birthdate`, `gender`. For Observation: `_id`, `patient`/`subject`, `code`, `category`, `date`, `status`. Plus `_count` and `_sort` on `_lastUpdated`.

```csharp
// Fhir/SearchQuery.cs
using Hl7.Fhir.Model;

namespace MiniFhir.Fhir;

public sealed class SearchQuery
{
    public Dictionary<string, List<string>> Parameters { get; } = new(StringComparer.OrdinalIgnoreCase);
    public int Count { get; private set; } = 20;
    public string? Sort { get; private set; }
    public List<string> Unknown { get; } = [];

    public static SearchQuery Parse(IQueryCollection query, IReadOnlySet<string> supported)
    {
        var q = new SearchQuery();
        foreach (var (key, values) in query)
        {
            var baseName = key.Split(':')[0];   // strip modifiers like family:exact
            switch (baseName)
            {
                case "_count":
                    q.Count = Math.Clamp(int.TryParse(values.FirstOrDefault(), out var c) ? c : 20, 1, 100);
                    break;
                case "_sort":
                    q.Sort = values.FirstOrDefault();
                    break;
                case "_format":
                    break;
                default:
                    if (!supported.Contains(baseName)) { q.Unknown.Add(key); break; }
                    foreach (var v in values)
                        q.Parameters.GetOrAdd(key).Add(v!);
                    break;
            }
        }
        return q;
    }

    public bool Has(string name) => Parameters.Keys.Any(k => k.Split(':')[0].Equals(name, StringComparison.OrdinalIgnoreCase));

    // FHIR semantics: repeating the parameter is AND; comma inside one value is OR.
    public bool Matches(string name, Func<string, string?, bool> valueMatches)
    {
        foreach (var (key, values) in Parameters)
        {
            var parts = key.Split(':', 2);
            if (!parts[0].Equals(name, StringComparison.OrdinalIgnoreCase)) continue;
            var modifier = parts.Length > 1 ? parts[1] : null;

            foreach (var andValue in values)
            {
                var orValues = andValue.Split(',');
                if (!orValues.Any(v => valueMatches(v, modifier))) return false;
            }
        }
        return true;
    }
}

internal static class DictionaryExtensions
{
    public static List<string> GetOrAdd(this Dictionary<string, List<string>> dict, string key)
    {
        if (!dict.TryGetValue(key, out var list)) dict[key] = list = [];
        return list;
    }
}

// Matchers for the FHIR search parameter types we support.
public static class SearchMatch
{
    // string: case-insensitive starts-with, or :exact / :contains
    public static bool String(string? actual, string wanted, string? modifier) => actual is not null && modifier switch
    {
        "exact" => actual.Equals(wanted, StringComparison.Ordinal),
        "contains" => actual.Contains(wanted, StringComparison.OrdinalIgnoreCase),
        _ => actual.StartsWith(wanted, StringComparison.OrdinalIgnoreCase)
    };

    // token: system|code, |code (no system), system| (any code in system), or code (any system)
    public static bool Token(string? system, string? code, string wanted)
    {
        var idx = wanted.IndexOf('|');
        if (idx < 0) return string.Equals(code, wanted, StringComparison.Ordinal);
        var wantedSystem = wanted[..idx];
        var wantedCode = wanted[(idx + 1)..];
        var systemOk = wantedSystem.Length == 0 ? string.IsNullOrEmpty(system) : string.Equals(system, wantedSystem, StringComparison.Ordinal);
        var codeOk = wantedCode.Length == 0 || string.Equals(code, wantedCode, StringComparison.Ordinal);
        return systemOk && codeOk;
    }

    public static bool Token(CodeableConcept? concept, string wanted)
        => concept?.Coding.Any(c => Token(c.System, c.Code, wanted)) == true;

    // date: prefix (eq ne gt lt ge le) + partial date. We compare the *range* a partial date represents.
    public static bool Date(string? actualIso, string wanted)
    {
        if (actualIso is null) return false;
        var prefix = "eq";
        if (wanted.Length > 2 && char.IsLetter(wanted[0]) && char.IsLetter(wanted[1]))
        {
            prefix = wanted[..2];
            wanted = wanted[2..];
        }
        var (aStart, aEnd) = Range(actualIso);
        var (wStart, wEnd) = Range(wanted);
        return prefix switch
        {
            "eq" => aStart >= wStart && aEnd <= wEnd,
            "ne" => !(aStart >= wStart && aEnd <= wEnd),
            "gt" => aEnd > wEnd,
            "lt" => aStart < wStart,
            "ge" => aEnd >= wStart,
            "le" => aStart <= wEnd,
            _ => false
        };
    }

    // "1990" -> whole year, "1990-05" -> whole month, full dateTime -> instant
    private static (DateTimeOffset Start, DateTimeOffset End) Range(string iso)
    {
        if (iso.Length == 4 && int.TryParse(iso, out var y))
            return (new DateTimeOffset(y, 1, 1, 0, 0, 0, TimeSpan.Zero), new DateTimeOffset(y, 12, 31, 23, 59, 59, TimeSpan.Zero));
        if (iso.Length == 7 && DateTimeOffset.TryParse(iso + "-01", out var m))
            return (m, m.AddMonths(1).AddTicks(-1));
        if (iso.Length == 10 && DateTimeOffset.TryParse(iso, out var d))
            return (d, d.AddDays(1).AddTicks(-1));
        var dt = DateTimeOffset.Parse(iso);
        return (dt, dt);
    }

    // reference: "Patient/123" or just "123" when the type is implied by the parameter
    public static bool Reference(ResourceReference? actual, string wanted, string impliedType)
    {
        if (actual?.Reference is null) return false;
        var normalizedWanted = wanted.Contains('/') ? wanted : $"{impliedType}/{wanted}";
        return actual.Reference.EndsWith(normalizedWanted, StringComparison.Ordinal);
    }
}
```

This is roughly 150 lines and it already handles the four search parameter types you will meet most. A production engine does this with indexes and SQL, but the *semantics* are identical, and now you understand what `birthdate=ge1990` or `code=http://loinc.org|85354-9` really ask for.

### 5.6 The CapabilityStatement

The server must describe itself. We generate it from code so it never drifts from reality.

```csharp
// Fhir/CapabilityStatementFactory.cs
using Hl7.Fhir.Model;

namespace MiniFhir.Fhir;

public static class CapabilityStatementFactory
{
    public static CapabilityStatement Create(string baseUrl)
    {
        var cs = new CapabilityStatement
        {
            Status = PublicationStatus.Active,
            Date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
            Kind = CapabilityStatementKind.Instance,
            FhirVersion = FHIRVersion.N4_0_1,
            Format = ["application/fhir+json"],
            Software = new CapabilityStatement.SoftwareComponent { Name = "MiniFhir", Version = "0.1" },
            Implementation = new CapabilityStatement.ImplementationComponent { Description = "Learning FHIR server", Url = baseUrl }
        };

        var rest = new CapabilityStatement.RestComponent { Mode = CapabilityStatement.RestfulCapabilityMode.Server };

        rest.Resource.Add(ResourceCapability("Patient",
            ["_id", "identifier", "family", "given", "name", "birthdate", "gender"],
            ["token", "token", "string", "string", "string", "date", "token"]));

        rest.Resource.Add(ResourceCapability("Observation",
            ["_id", "patient", "subject", "code", "category", "date", "status"],
            ["token", "reference", "reference", "token", "token", "date", "token"]));

        cs.Rest.Add(rest);
        return cs;
    }

    private static CapabilityStatement.ResourceComponent ResourceCapability(string type, string[] searchParams, string[] searchTypes)
    {
        var r = new CapabilityStatement.ResourceComponent
        {
            Type = type,
            Versioning = CapabilityStatement.ResourceVersionPolicy.Versioned,
            ReadHistory = true,
            UpdateCreate = true,
            ConditionalCreate = false,
            ConditionalUpdate = false,
            ConditionalDelete = CapabilityStatement.ConditionalDeleteStatus.NotSupported
        };

        foreach (var interaction in new[]
        {
            CapabilityStatement.TypeRestfulInteraction.Read,
            CapabilityStatement.TypeRestfulInteraction.Vread,
            CapabilityStatement.TypeRestfulInteraction.Update,
            CapabilityStatement.TypeRestfulInteraction.Delete,
            CapabilityStatement.TypeRestfulInteraction.Create,
            CapabilityStatement.TypeRestfulInteraction.SearchType,
            CapabilityStatement.TypeRestfulInteraction.HistoryInstance
        })
        {
            r.Interaction.Add(new CapabilityStatement.ResourceInteractionComponent { Code = interaction });
        }

        for (var i = 0; i < searchParams.Length; i++)
        {
            r.SearchParam.Add(new CapabilityStatement.SearchParamComponent
            {
                Name = searchParams[i],
                Type = Enum.Parse<SearchParamType>(searchTypes[i], ignoreCase: true)
            });
        }
        return r;
    }
}
```

### 5.7 Wiring the endpoints

Now `Program.cs`. We use Minimal APIs. Each FHIR interaction maps to one route.

{% raw %}
```csharp
// Program.cs
using Hl7.Fhir.Model;
using MiniFhir.Fhir;
using MiniFhir.Storage;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IResourceStore, InMemoryResourceStore>();
var app = builder.Build();

string BaseUrl(HttpRequest r) => $"{r.Scheme}://{r.Host}{r.PathBase}";

// Translate parse errors into FHIR 400s everywhere.
app.Use(async (ctx, next) =>
{
    try { await next(); }
    catch (FhirParseException ex)
    {
        await FhirResults.Error(StatusCodes.Status400BadRequest, OperationOutcome.IssueType.Invalid, ex.Message)
            .ExecuteAsync(ctx);
    }
});

// ---- capabilities ----
app.MapGet("/metadata", (HttpRequest req) =>
    FhirResults.Ok(CapabilityStatementFactory.Create(BaseUrl(req))));

// ---- Patient ----
MapResource<Patient>(app, "Patient",
    supportedSearch: ["_id", "identifier", "family", "given", "name", "birthdate", "gender"],
    filter: (p, q) =>
        q.Matches("_id", (v, _) => p.Id == v)
        && q.Matches("identifier", (v, _) => p.Identifier.Any(i => SearchMatch.Token(i.System, i.Value, v)))
        && q.Matches("family", (v, m) => p.Name.Any(n => SearchMatch.String(n.Family, v, m)))
        && q.Matches("given", (v, m) => p.Name.Any(n => n.Given.Any(g => SearchMatch.String(g, v, m))))
        && q.Matches("name", (v, m) => p.Name.Any(n =>
               SearchMatch.String(n.Family, v, m) || n.Given.Any(g => SearchMatch.String(g, v, m)) || SearchMatch.String(n.Text, v, m)))
        && q.Matches("birthdate", (v, _) => SearchMatch.Date(p.BirthDate, v))
        && q.Matches("gender", (v, _) => SearchMatch.Token(null, p.Gender?.GetLiteral(), v)),
    validate: p =>
    {
        var issues = new List<string>();
        if (p.Name.Count == 0) issues.Add("Patient.name is required by this server's profile.");
        if (p.Identifier.Count == 0) issues.Add("Patient.identifier is required by this server's profile.");
        return issues;
    });

// ---- Observation ----
MapResource<Observation>(app, "Observation",
    supportedSearch: ["_id", "patient", "subject", "code", "category", "date", "status"],
    filter: (o, q) =>
        q.Matches("_id", (v, _) => o.Id == v)
        && q.Matches("patient", (v, _) => SearchMatch.Reference(o.Subject, v, "Patient"))
        && q.Matches("subject", (v, _) => SearchMatch.Reference(o.Subject, v, "Patient"))
        && q.Matches("code", (v, _) => SearchMatch.Token(o.Code, v))
        && q.Matches("category", (v, _) => o.Category.Any(c => SearchMatch.Token(c, v)))
        && q.Matches("date", (v, _) => SearchMatch.Date((o.Effective as FhirDateTime)?.Value, v))
        && q.Matches("status", (v, _) => SearchMatch.Token(null, o.Status?.GetLiteral(), v)),
    validate: o =>
    {
        var issues = new List<string>();
        if (o.Status is null) issues.Add("Observation.status is required (cardinality 1..1).");
        if (o.Code is null || o.Code.Coding.Count == 0) issues.Add("Observation.code is required (cardinality 1..1).");
        if (o.Subject?.Reference is null) issues.Add("Observation.subject is required by this server's profile.");
        return issues;
    });

app.Run();

// ------------------------------------------------------------------
// Generic FHIR interactions for one resource type
// ------------------------------------------------------------------
static void MapResource<T>(
    WebApplication app,
    string type,
    string[] supportedSearch,
    Func<T, SearchQuery, bool> filter,
    Func<T, List<string>> validate) where T : Resource, new()
{
    var supported = supportedSearch.ToHashSet(StringComparer.OrdinalIgnoreCase);
    string BaseUrl(HttpRequest r) => $"{r.Scheme}://{r.Host}{r.PathBase}";

    // search:  GET /Patient?family=Nguyen
    app.MapGet($"/{type}", async (HttpRequest req, IResourceStore store) =>
    {
        var query = SearchQuery.Parse(req.Query, supported);
        if (query.Unknown.Count > 0)
            return FhirResults.Error(StatusCodes.Status400BadRequest, OperationOutcome.IssueType.NotSupported,
                $"Unsupported search parameter(s): {string.Join(", ", query.Unknown)}. See /metadata.");

        var all = (await store.ListAsync(type)).Cast<T>().Where(r => filter(r, query));
        all = query.Sort switch
        {
            "_lastUpdated" => all.OrderBy(r => r.Meta?.LastUpdated),
            "-_lastUpdated" => all.OrderByDescending(r => r.Meta?.LastUpdated),
            _ => all.OrderBy(r => r.Id)
        };

        var matches = all.ToList();
        var bundle = new Bundle { Type = Bundle.BundleType.Searchset, Total = matches.Count };
        bundle.Link.Add(new Bundle.LinkComponent { Relation = "self", Url = $"{BaseUrl(req)}{req.Path}{req.QueryString}" });
        foreach (var r in matches.Take(query.Count))
        {
            bundle.Entry.Add(new Bundle.EntryComponent
            {
                FullUrl = $"{BaseUrl(req)}/{type}/{r.Id}",
                Resource = r,
                Search = new Bundle.SearchComponent { Mode = Bundle.SearchEntryMode.Match }
            });
        }
        return FhirResults.Ok(bundle);
    });

    // read:  GET /Patient/123
    app.MapGet($"/{type}/{{id}}", async (string id, IResourceStore store) =>
    {
        var stored = await store.GetAsync(type, id);
        if (stored is null) return FhirResults.NotFound(type, id);
        if (stored.IsDeleted) return FhirResults.Gone(type, id);
        return FhirResults.Ok(stored.Resource);
    });

    // vread:  GET /Patient/123/_history/2
    app.MapGet($"/{type}/{{id}}/_history/{{vid}}", async (string id, string vid, IResourceStore store) =>
    {
        var version = await store.GetVersionAsync(type, id, vid);
        return version is null ? FhirResults.NotFound(type, $"{id}/_history/{vid}") : FhirResults.Ok(version);
    });

    // history:  GET /Patient/123/_history
    app.MapGet($"/{type}/{{id}}/_history", async (string id, HttpRequest req, IResourceStore store) =>
    {
        var history = await store.HistoryAsync(type, id);
        if (history.Count == 0) return FhirResults.NotFound(type, id);
        var bundle = new Bundle { Type = Bundle.BundleType.History, Total = history.Count };
        foreach (var h in history)
        {
            bundle.Entry.Add(new Bundle.EntryComponent
            {
                FullUrl = $"{BaseUrl(req)}/{type}/{id}",
                Resource = h.IsDeleted ? null : h.Resource,
                Request = new Bundle.RequestComponent
                {
                    Method = h.IsDeleted ? Bundle.HTTPVerb.DELETE : Bundle.HTTPVerb.PUT,
                    Url = $"{type}/{id}"
                }
            });
        }
        return FhirResults.Ok(bundle);
    });

    // create:  POST /Patient
    app.MapPost($"/{type}", async (HttpRequest req, IResourceStore store) =>
    {
        var resource = await FhirRequestReader.ReadAsync<T>(req);
        var issues = validate(resource);
        if (issues.Count > 0)
            return FhirResults.Error(StatusCodes.Status422UnprocessableEntity, OperationOutcome.IssueType.Invariant, string.Join(" ", issues));

        resource.Id = null;   // FHIR: server assigns the id on create, ignore any client-supplied id
        var created = await store.CreateAsync(resource);
        return FhirResults.Created(created, BaseUrl(req));
    });

    // update:  PUT /Patient/123   (with optional If-Match for optimistic concurrency)
    app.MapPut($"/{type}/{{id}}", async (string id, HttpRequest req, IResourceStore store) =>
    {
        var resource = await FhirRequestReader.ReadAsync<T>(req);
        if (resource.Id is not null && resource.Id != id)
            return FhirResults.Error(StatusCodes.Status400BadRequest, OperationOutcome.IssueType.Invalid,
                $"Resource id '{resource.Id}' does not match URL id '{id}'.");

        var issues = validate(resource);
        if (issues.Count > 0)
            return FhirResults.Error(StatusCodes.Status422UnprocessableEntity, OperationOutcome.IssueType.Invariant, string.Join(" ", issues));

        var existing = await store.GetAsync(type, id);
        var ifMatch = req.Headers.IfMatch.FirstOrDefault();
        if (ifMatch is not null && existing is not null && !existing.IsDeleted)
        {
            var currentEtag = $"W/\"{existing.Resource.Meta?.VersionId}\"";
            if (!string.Equals(ifMatch, currentEtag, StringComparison.Ordinal))
                return FhirResults.Error(StatusCodes.Status412PreconditionFailed, OperationOutcome.IssueType.Conflict,
                    $"Version conflict: current version is {currentEtag}, you sent {ifMatch}.");
        }

        resource.Id = id;
        var (saved, created) = await store.UpsertAsync(resource);
        return created ? FhirResults.Created(saved, BaseUrl(req)) : FhirResults.Ok(saved);
    });

    // delete:  DELETE /Patient/123
    app.MapDelete($"/{type}/{{id}}", async (string id, IResourceStore store) =>
    {
        await store.DeleteAsync(type, id);
        return Results.NoContent();   // FHIR allows 200, 202 or 204 for delete; 204 is the common choice
    });
}
```
{% endraw %}

Run it:

```bash
dotnet run
```

### 5.8 Exercise the server

Create a patient:

```bash
curl -i -X POST http://localhost:5000/Patient -H "Content-Type: application/fhir+json" -d "{\"resourceType\":\"Patient\",\"identifier\":[{\"system\":\"http://hospital.example.org/mrn\",\"value\":\"MRN-00012345\"}],\"name\":[{\"family\":\"Nguyen\",\"given\":[\"Thomas\"]}],\"gender\":\"male\",\"birthDate\":\"1990-05-08\"}"
```

You should see:

```text
HTTP/1.1 201 Created
Content-Type: application/fhir+json; charset=utf-8
ETag: W/"1"
Location: http://localhost:5000/Patient/3f2a9c1e7b4d/_history/1
```

Now try these, and predict the status code before you look:

```bash
curl -i http://localhost:5000/Patient/3f2a9c1e7b4d
```

```bash
curl -i "http://localhost:5000/Patient?family=ngu"
```

```bash
curl -i "http://localhost:5000/Patient?family:exact=ngu"
```

```bash
curl -i "http://localhost:5000/Patient?birthdate=ge1990&gender=male"
```

```bash
curl -i "http://localhost:5000/Patient?identifier=http://hospital.example.org/mrn|MRN-00012345"
```

```bash
curl -i "http://localhost:5000/Patient?favoriteColor=blue"
```

```bash
curl -i -X POST http://localhost:5000/Patient -H "Content-Type: application/fhir+json" -d "{\"resourceType\":\"Patient\",\"gender\":\"purple\"}"
```

```bash
curl -i -X DELETE http://localhost:5000/Patient/3f2a9c1e7b4d
```

```bash
curl -i http://localhost:5000/Patient/3f2a9c1e7b4d
```

Expected answers, in order: 200, a Bundle with 1 match, a Bundle with 0 matches (exact is case-sensitive and must match fully), 1 match, 1 match, **400** with `not-supported`, **400** with `invalid` (the parser rejects `purple` because `gender` is a required binding), 204, and finally **410 Gone**. If you got those, you have internalized more FHIR REST semantics than many working integrations.

Add an Observation that points at the patient (use your real id), then search `GET /Observation?patient=3f2a9c1e7b4d&code=http://loinc.org|85354-9`.

### 5.9 Real validation against profiles

The hand-written `validate` functions above are a stand-in. Real projects validate against **StructureDefinitions** (the base spec plus your IG). Firely ships this as a separate package:

```bash
dotnet add package Firely.Fhir.Validation.R4
```

```bash
dotnet add package Hl7.Fhir.Specification.Data.R4
```

```csharp
using Firely.Fhir.Validation;
using Hl7.Fhir.Specification.Source;
using Hl7.Fhir.Specification.Terminology;

// Resolve StructureDefinitions from the core spec package (and later, your IG package from Simplifier / packages.fhir.org)
var coreSource = ZipSource.CreateValidationSource();
var resolver = new CachedResolver(new MultiResolver(coreSource /*, new DirectorySource("profiles") */));
var terminology = new LocalTerminologyService(resolver);

var validator = new Validator(resolver, terminology);

var result = validator.Validate(patient, "http://hl7.org/fhir/StructureDefinition/Patient");
// result is an OperationOutcome you can return directly with 422 if result.Success is false
```

To validate against **US Core**, download the IG package (`hl7.fhir.us.core`) with Firely Terminal (`fhir install hl7.fhir.us.core`) and add a `DirectorySource` pointing at it, then validate against `http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient`. Validation is slow relative to a simple parse, so production servers usually validate on write, not on read.

---

## Part 6: Securing It with SMART on FHIR

### 6.1 The pieces

- An **authorization server** that understands SMART. Options: **Duende IdentityServer** (.NET, you control everything, you must implement the `launch` context and patient claim yourself), **Microsoft Entra ID** (used by Azure Health Data Services; SMART scopes map to app roles and a "SMART on FHIR proxy"), **Keycloak** (Java, open source, has a SMART extension), or a vendor's (Epic and Oracle Health run their own; you only register your client there).
- Your FHIR server validates the token and enforces scopes.
- For development, the **SMART App Launcher** at `https://launch.smarthealthit.org` is a free sandbox that acts as both an auth server and a FHIR server, pre-loaded with synthetic patients. It is the fastest way to see every flow work.

### 6.2 Token validation

```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

```csharp
// Program.cs (additions)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Smart:Issuer"];          // e.g. https://auth.example.org
        options.Audience = builder.Configuration["Smart:FhirBaseUrl"];      // SMART: aud must be the FHIR base URL
        options.TokenValidationParameters.ValidateIssuer = true;
        options.TokenValidationParameters.ValidateAudience = true;
        options.TokenValidationParameters.ValidateLifetime = true;
        options.TokenValidationParameters.ClockSkew = TimeSpan.FromMinutes(1);
    });
builder.Services.AddAuthorization();

// after Build():
app.UseAuthentication();
app.UseAuthorization();
```

`/metadata` and `/.well-known/smart-configuration` must stay anonymous; everything else requires a token.

```csharp
app.MapGet("/.well-known/smart-configuration", (IConfiguration cfg) => Results.Json(new
{
    issuer = cfg["Smart:Issuer"],
    authorization_endpoint = cfg["Smart:AuthorizationEndpoint"],
    token_endpoint = cfg["Smart:TokenEndpoint"],
    jwks_uri = cfg["Smart:JwksUri"],
    scopes_supported = new[] { "openid", "fhirUser", "launch", "launch/patient", "patient/*.rs", "user/*.cruds", "system/*.rs", "offline_access" },
    response_types_supported = new[] { "code" },
    code_challenge_methods_supported = new[] { "S256" },
    capabilities = new[] { "launch-ehr", "launch-standalone", "client-public", "client-confidential-asymmetric",
                           "context-ehr-patient", "permission-patient", "permission-user", "sso-openid-connect", "permission-v2" }
})).AllowAnonymous();
```

### 6.3 Parsing SMART scopes

```csharp
// Auth/SmartScope.cs
namespace MiniFhir.Auth;

public enum SmartContext { Patient, User, System }

public sealed record SmartScope(SmartContext Context, string ResourceType, string Permissions)
{
    // Accepts v2 "patient/Observation.rs" and v1 "patient/Observation.read" / ".write" / ".*"
    public static SmartScope? TryParse(string raw)
    {
        var slash = raw.IndexOf('/');
        var dot = raw.LastIndexOf('.');
        if (slash < 0 || dot < slash) return null;

        var context = raw[..slash] switch
        {
            "patient" => SmartContext.Patient,
            "user" => SmartContext.User,
            "system" => SmartContext.System,
            _ => (SmartContext?)null
        };
        if (context is null) return null;

        var resource = raw[(slash + 1)..dot];
        var perms = raw[(dot + 1)..] switch
        {
            "read" => "rs",
            "write" => "cud",
            "*" => "cruds",
            var v2 => v2
        };
        return new SmartScope(context.Value, resource, perms);
    }

    public bool Allows(string resourceType, char permission)
        => (ResourceType == "*" || ResourceType == resourceType) && Permissions.Contains(permission);
}
```

### 6.4 Enforcing scopes and patient context

An endpoint filter inspects the HTTP method, the resource type from the route, and the token:

```csharp
// Auth/SmartAuthorizationFilter.cs
using Hl7.Fhir.Model;
using MiniFhir.Fhir;

namespace MiniFhir.Auth;

public sealed class SmartAuthorizationFilter(string resourceType) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
    {
        var http = ctx.HttpContext;
        var user = http.User;
        if (user.Identity?.IsAuthenticated != true)
            return FhirResults.Error(StatusCodes.Status401Unauthorized, OperationOutcome.IssueType.Login, "A valid bearer token is required.");

        var scopes = (user.FindFirst("scope")?.Value ?? "")
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Select(SmartScope.TryParse)
            .Where(s => s is not null)
            .ToList()!;

        var needed = http.Request.Method switch
        {
            "POST" => 'c',
            "PUT" or "PATCH" => 'u',
            "DELETE" => 'd',
            _ => http.Request.RouteValues.ContainsKey("id") ? 'r' : 's'
        };

        if (!scopes.Any(s => s!.Allows(resourceType, needed)))
            return FhirResults.Error(StatusCodes.Status403Forbidden, OperationOutcome.IssueType.Forbidden,
                $"Token lacks a scope permitting '{needed}' on {resourceType}.");

        // Patient-context enforcement: if ONLY patient/ scopes apply, pin every request to that patient.
        var onlyPatientContext = scopes.All(s => s!.Context == SmartContext.Patient);
        if (onlyPatientContext)
        {
            var patientId = user.FindFirst("patient")?.Value;
            if (patientId is null)
                return FhirResults.Error(StatusCodes.Status403Forbidden, OperationOutcome.IssueType.Forbidden,
                    "Token has patient/ scopes but no patient context.");

            http.Items["smart.patient"] = patientId;   // handlers read this and filter
        }

        return await next(ctx);
    }
}
```

Then, in `MapResource`, add `.AddEndpointFilter(new SmartAuthorizationFilter(type))` to each route, and make the handlers honor the pinned patient:

```csharp
// inside the Patient search / read handlers
if (http.Items.TryGetValue("smart.patient", out var pinned) && pinned is string pid)
{
    // search: force the compartment
    matches = matches.Where(p => p.Id == pid).ToList();
    // read of another patient: 403, not 404 (don't leak existence)
}

// inside Observation handlers: force subject == Patient/pid
```

That "**compartment**" idea is formal in FHIR: the **Patient compartment** is the set of resources that belong to a patient (Observations with `subject`, MedicationRequests with `subject`, Encounters with `subject`...). `GET /Patient/123/Observation` is compartment search syntax, and `GET /Patient/123/$everything` returns the whole compartment. SMART `patient/` scopes are compartment restrictions.

### 6.5 Testing the secured server without building an auth server

For local learning you can point `Smart:Issuer` at a Duende IdentityServer dev host, or temporarily use a **symmetric test key** and mint tokens yourself with `System.IdentityModel.Tokens.Jwt`, putting `scope` and `patient` claims in. For the real thing, the **SMART App Launcher** sandbox lets you act as a client against its server, and **Inferno** (`https://inferno.healthit.gov`) is ONC's free test suite that will tell you exactly where your server breaks the SMART and US Core rules. Run Inferno early; it is brutally educational.

---

## Part 7: Consuming FHIR from .NET (the Client Side)

Most teams start here. The Firely `FhirClient` handles content negotiation, Bundles, and paging.

```csharp
using Hl7.Fhir.Model;
using Hl7.Fhir.Rest;

var settings = new FhirClientSettings
{
    PreferredFormat = ResourceFormat.Json,
    VerifyFhirVersion = true,           // fail fast if the server is not R4
    PreferredReturn = Prefer.ReturnRepresentation
};

// A public HAPI test server. Never put real PHI here.
var client = new FhirClient("https://hapi.fhir.org/baseR4", settings);

// Attach a SMART bearer token (from the flow in Part 3)
client.RequestHeaders?.Authorization = new("Bearer", accessToken);

// read
var patient = await client.ReadAsync<Patient>("Patient/example");
Console.WriteLine(patient.Name.FirstOrDefault()?.Family);

// search with a typed query
var q = new SearchParams()
    .Where("family=Nguyen")
    .Where("birthdate=ge1990-01-01")
    .LimitTo(50)
    .OrderBy("-_lastUpdated");
var bundle = await client.SearchAsync<Patient>(q);

// paging: follow "next" links until exhausted
while (bundle is not null)
{
    foreach (var entry in bundle.Entry)
        if (entry.Resource is Patient p)
            Console.WriteLine($"{p.Id}: {p.Name.FirstOrDefault()?.ToString()}");

    bundle = await client.ContinueAsync(bundle);
}

// create
var newObs = new Observation
{
    Status = ObservationStatus.Final,
    Code = new CodeableConcept("http://loinc.org", "8302-2", "Body height"),
    Subject = new ResourceReference("Patient/example"),
    Effective = new FhirDateTime(DateTimeOffset.UtcNow),
    Value = new Quantity(175, "cm", "http://unitsofmeasure.org")
};
var created = await client.CreateAsync(newObs);

// transaction: several writes atomically
var tx = new TransactionBuilder(client.Endpoint, Bundle.BundleType.Transaction)
    .Create(new Patient { Name = [new HumanName { Family = "Tran", Given = ["Linh"] }] })
    .Create(newObs)
    .ToBundle();
var txResult = await client.TransactionAsync(tx);

// operations
var everything = await client.InstanceOperationAsync(new Uri("Patient/example", UriKind.Relative), "everything");

// errors arrive as FhirOperationException with the server's OperationOutcome attached
try
{
    await client.ReadAsync<Patient>("Patient/does-not-exist");
}
catch (FhirOperationException ex)
{
    Console.WriteLine($"{(int)ex.Status}: {ex.Outcome?.Issue.FirstOrDefault()?.Diagnostics}");
}
```

Reading the `value[x]` choice type in C#:

```csharp
switch (observation.Value)
{
    case Quantity qty:
        Console.WriteLine($"{qty.Value} {qty.Unit}");
        break;
    case CodeableConcept cc:
        Console.WriteLine(cc.Text ?? cc.Coding.FirstOrDefault()?.Display);
        break;
    case FhirString s:
        Console.WriteLine(s.Value);
        break;
}
```

And the SMART handshake itself from a server-side .NET web app: use the standard **OpenID Connect** middleware (`Microsoft.AspNetCore.Authentication.OpenIdConnect`), set `Authority` from the `.well-known/smart-configuration` you fetched for the `iss`, request scopes `openid fhirUser launch patient/*.rs`, pass the `launch` parameter through to the authorization request in `OnRedirectToIdentityProvider`, and read `patient` out of the token response in `OnTokenResponseReceived`. It is ordinary OIDC code with two extra parameters.

---

## Part 8: Production Concerns You Will Be Asked About

Once the API works, the healthcare-specific questions start. Know these before the architecture review:

**Compliance and audit.** HIPAA requires access logging. Emit a FHIR `AuditEvent` (or an equivalent structured log) for every read and write: who (token `sub` and `fhirUser`), what (resource and id), when, from where, outcome. Microsoft's server and Firely Server do this out of the box; a facade must do it itself.

**PHI never goes to public sandboxes.** HAPI and SMART Launcher are for synthetic data only. Use **Synthea** (`synthetichealth/synthea`) to generate realistic fake patients as FHIR Bundles for development and demos.

**Idempotency.** Integrations retry. Support conditional create (`If-None-Exist`) keyed on `identifier`, or you will create duplicate patients at 3 a.m.

**Concurrency.** Return `ETag`, honor `If-Match`, return 412. Two nurses editing the same allergy list is not hypothetical.

**Soft deletes and history.** Clinical data is almost never hard-deleted. Design storage for versions from day one.

**Performance of search.** Index search parameters at write time. Do not scan JSON documents at query time. For SQL Server, the pattern is a `Resource` table with the raw JSON plus narrow index tables per parameter type, which is exactly how `microsoft/fhir-server` is laid out.

**Pagination.** Always page. Use opaque continuation tokens in the `next` link; never `offset` on a live clinical table.

**Terminology.** Decide early whether you validate codes against ValueSets (needs a terminology service such as the one inside Firely Server, Ontoserver, or Azure's) or only check structure.

**Profile conformance.** Decide which IG you claim, declare it in `meta.profile` and in the CapabilityStatement, and run Inferno or Touchstone against it.

**Bulk Data.** If payers or analytics teams will pull whole populations, implement `$export` (async, `202 Accepted` + polling + ndjson files in blob storage) with Backend Services auth, or use a platform that has it.

**Versioning your own API.** You do not. FHIR is the version. You may run multiple FHIR versions at different base URLs (`/r4`, `/r5`).

---

## Part 9: A Learning Roadmap

Here is the order I would study if I were starting over, with time estimates for someone working on it part time.

**Week 1 to 2: Read the spec selectively.** Start at `https://hl7.org/fhir/R4/`. Read **Resource Index** (skim), **RESTful API**, **Search**, **Bundle**, **OperationOutcome**, **Patient**, **Observation**. Do not read the whole thing; nobody does.

**Week 2 to 3: Play with a public server.** Use Postman against `https://hapi.fhir.org/baseR4`. Create a patient, search for it, update it with `If-Match`, delete it, read it again. Try `_include` and `_revinclude`. Get a 412 and a 410 on purpose.

**Week 3 to 4: Build the mini server from this post.** Then extend it: add `Encounter`, add `_include=Observation:subject`, add conditional create. Each addition teaches a chunk of the spec.

**Week 5: SMART.** Work through the SMART App Launcher sandbox with a small ASP.NET Core app using the OIDC middleware. Do an EHR launch and a standalone launch. Read the SMART App Launch spec (`https://hl7.org/fhir/smart-app-launch/`); it is short.

**Week 6: US Core (or your jurisdiction's IG).** Read the US Core Patient and Observation profiles. Validate your resources against them with Firely Terminal or the validator package. Understand "Must Support."

**Week 7 onward: Read a real server.** Clone `microsoft/fhir-server`. Trace one request from controller to SQL. You will recognize everything from this post, at scale.

**Then specialize** by what your organization needs: Bulk Data and Backend Services for payers and analytics; CDS Hooks and EHR launch for clinician tools; Consent and Patient Access APIs for consumer apps; HL7 v2-to-FHIR conversion (Microsoft publishes an open-source FHIR Converter with Liquid templates) for integrating legacy feeds.

---

## Part 10: Glossary (Quick Reference)

| Term | Meaning |
|---|---|
| **HL7** | Health Level Seven International, the standards body. Also the name of the older v2 messaging standard. |
| **FHIR** | Fast Healthcare Interoperability Resources. HL7's modern REST/JSON standard. |
| **R4** | FHIR release 4 (4.0.1). The industry baseline. |
| **Resource** | A typed unit of data (Patient, Observation...). |
| **Element** | A field within a resource. |
| **Cardinality** | How many times an element may appear: `0..1`, `1..1`, `0..*`, `1..*`. |
| **Choice type** `value[x]` | An element that can be one of several types; JSON name carries the type (`valueQuantity`). |
| **Reference** | A link to another resource, by relative URL (`Patient/123`). |
| **Compartment** | The set of resources belonging to one Patient (or Practitioner, Encounter...). |
| **Coding / CodeableConcept** | A code from a code system / a set of equivalent codings plus text. |
| **Code system** | A vocabulary: LOINC, SNOMED CT, ICD-10, RxNorm. |
| **ValueSet** | A named list of allowed codes for an element. |
| **Binding** | The rule tying an element to a ValueSet, with strength `required`, `extensible`, `preferred`, or `example`. |
| **Profile** | A StructureDefinition that constrains or extends a resource for a use case. |
| **Extension** | A standard way to add data a base resource lacks. |
| **Implementation Guide (IG)** | A published package of profiles, value sets, and rules for a domain or jurisdiction (US Core, IPS, Da Vinci). |
| **Must Support** | IG flag: if you have the data, you must send it; receivers must handle it. |
| **CapabilityStatement** | A server's self-description at `/metadata`. |
| **Bundle** | A container of resources: search results, transactions, documents. |
| **OperationOutcome** | The standard error/warning body. |
| **Operation (`$name`)** | A named, RPC-style action: `$everything`, `$validate`, `$export`. |
| **SMART App Launch** | The OAuth 2.0 / OIDC profile for FHIR apps. |
| **Scope** `patient/Observation.rs` | SMART permission: context / resource . permissions. |
| **EHR launch / Standalone launch** | App started from inside the EHR with context vs. started by the user directly. |
| **Backend Services** | SMART flow for server-to-server access with signed JWTs. |
| **Bulk Data / Flat FHIR** | `$export` of ndjson files for population-level data. |
| **US Core** | The US national base IG required by ONC certification. |
| **Cures Act / ONC / CMS** | The US laws and agencies that mandate FHIR APIs. |
| **Firely SDK** | The .NET FHIR library (`Hl7.Fhir.R4`). |
| **HAPI** | The Java reference implementation and free public test server. |
| **Inferno** | ONC's conformance test tool. |
| **Synthea** | Synthetic patient generator. |

---

## Closing Thoughts

The hardest part of FHIR is not the code. It is accepting that the API is not yours to design, and then learning the standard's vocabulary well enough that the spec becomes a reference instead of a wall. Once it clicks, FHIR is pleasant: every server works the same way, the .NET SDK is mature, and the error messages actually tell you what is wrong.

If you build the mini server in Part 5 and then run it against Inferno, you will fail a lot of tests, and each failure will teach you a specific rule. That is the fastest path from "clueless about FHIR" to the person on the team who can read a US Core profile and know exactly what the facade has to return.

## Resources

- FHIR R4 specification: `https://hl7.org/fhir/R4/`
- SMART App Launch: `https://hl7.org/fhir/smart-app-launch/`
- US Core IG: `https://hl7.org/fhir/us/core/`
- Firely .NET SDK docs: `https://docs.fire.ly/projects/Firely-NET-SDK/`
- Firely SDK on GitHub: `https://github.com/FirelyTeam/firely-net-sdk`
- Microsoft FHIR Server for Azure (open source, C#): `https://github.com/microsoft/fhir-server`
- Azure Health Data Services docs: `https://learn.microsoft.com/azure/healthcare-apis/`
- HAPI public test server: `https://hapi.fhir.org/baseR4`
- SMART App Launcher sandbox: `https://launch.smarthealthit.org`
- Inferno test suite: `https://inferno.healthit.gov`
- Synthea synthetic patients: `https://github.com/synthetichealth/synthea`
- Simplifier (profile registry and FHIR package feed): `https://simplifier.net`
- FHIR community chat (very active, friendly to beginners): `https://chat.fhir.org`
