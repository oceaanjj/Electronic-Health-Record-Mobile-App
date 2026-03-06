# 📱 Master Sync Guide: Mobile App API Reference

This document is the complete reference for connecting your React Native app to the Laravel EHR backend. Every form on the website now has a matching API endpoint.

---

## 1. 🔗 Connection & Auth

- **Base URL:** `http://192.168.1.14:8000/api`
- **Login:** `POST /auth/login?email={username}&password={pass}`
- **Auth Mode:** Bearer Token (Laravel Sanctum). Add `Authorization: Bearer {token}` to all requests.

---

## 2. 🏥 Patient Management

| Action            | Method | Endpoint                      | Key Fields                                                |
| :---------------- | :----- | :---------------------------- | :-------------------------------------------------------- |
| **Register**      | POST   | `/patient`                    | `first_name`, `last_name`, `age`, `sex`, `admission_date` |
| **List Active**   | GET    | `/patient`                    | Returns patients where `is_active: 1`                     |
| **List All**      | GET    | `/patient?all=true`           | Bypass active filter                                      |
| **Edit**          | PUT    | `/patient/{id}`               | Update any patient field                                  |
| **Toggle Status** | POST   | `/patient/{id}/toggle-status` | Body: `{ "is_active": true/false }`                       |

---

## 3. 🩺 Core Assessment Forms

These endpoints save the **actual data** from your forms. If a field is empty, the API automatically sets it to `"N/A"`.

| Feature           | Method | Endpoint             | Form Data Examples                                           |
| :---------------- | :----- | :------------------- | :----------------------------------------------------------- |
| **Vital Signs**   | POST   | `/vital-signs`       | `temperature`, `hr`, `rr`, `bp`, `spo2`, `time`, `date`      |
| **Physical Exam** | POST   | `/physical-exam`     | `general_appearance`, `skin_condition`, `neurological`, etc. |
| **ADL**           | POST   | `/adl`               | `mobility_assessment`, `hygiene_assessment`, etc.            |
| **Intake/Output** | POST   | `/intake-and-output` | `oral_intake`, `iv_fluids_volume`, `urine_output`            |
| **Lab Values**    | POST   | `/lab-values`        | `wbc_result`, `hgb_result`, `platelets_result`, etc.         |

---

## 🧠 4. ADPIE & CDSS Workflow

For every feature above, you can update the **Nursing Diagnosis** (ADPIE) steps. This also triggers the CDSS recommendations.

- **URL Pattern:** `PUT /api/{feature}/{id}/{step}`
- **Steps:** `diagnosis`, `planning`, `intervention`, `evaluation`
- **Example:** `PUT /api/vital-signs/10/diagnosis`
- **Body:** `{ "diagnosis": "Patient has high fever..." }`

---

## 📝 5. Medical History Forms (5 Sub-forms)

Access all history for a patient via `GET /api/medical-history/patient/{id}`.

| Form                | Method | Endpoint                               |
| :------------------ | :----- | :------------------------------------- |
| **Present Illness** | POST   | `/api/medical-history/present-illness` |
| **Past Medical**    | POST   | `/api/medical-history/past-history`    |
| **Allergies**       | POST   | `/api/medical-history/allergies`       |
| **Vaccination**     | POST   | `/api/medical-history/vaccination`     |
| **Developmental**   | POST   | `/api/medical-history/developmental`   |

---

## 💊 6. Medication Forms

| Form               | Method | Endpoint                                      |
| :----------------- | :----- | :-------------------------------------------- |
| **Administration** | POST   | `/api/medication-administration`              |
| **Med History**    | GET    | `/api/medication-administration/patient/{id}` |
| **Recon: Current** | POST   | `/api/medication-reconciliation/current`      |
| **Recon: Home**    | POST   | `/api/medication-reconciliation/home`         |
| **Recon: Changes** | POST   | `/api/medication-reconciliation/              |
| changes`           |

# 📱 Medication Administration API Guide

Use these instructions to fix the data display and submission in your mobile app.

---

## 1. 📋 Displaying Data (Fetching History)

To show the list of medications already given to a patient:

- **Endpoint:** `GET /api/medication-administration/patient/{patient_id}`
- **React Native Example:**

```javascript
const response = await apiClient.get(
  `/medication-administration/patient/${currentPatientId}`,
);
const medHistory = response.data; // This is an array of all records
```

---

## 2. 📝 Submitting Data (Saving Form)

To save a new medication entry or update an existing one for a specific time:

- **Endpoint:** `POST /api/medication-administration`
- **Required JSON Body:**

```json
{
  "patient_id": 19,
  "medication": "Paracetamol",
  "dose": "500mg",
  "route": "Oral",
  "frequency": "Every 4 hours",
  "time": "08:00",
  "date": "2026-03-07",
  "comments": "Patient feels better"
}
```

> **Note:** If you send the same `patient_id`, `date`, and `time`, the API will **automatically update** the existing record instead of creating a duplicate.

---

## 3. ✏️ Editing a Specific Record

If you have the unique `id` of a record and want to edit it directly:

- **Load Data:** `GET /api/medication-administration/{id}`
- **Update Data:** `PUT /api/medication-administration/{id}`

---

## 🛠️ Quick Troubleshooting

1.  **Data not showing?** Ensure your `GET` URL includes the `/patient/` prefix: `/api/medication-administration/patient/19`.
2.  **Submit failing?** Check that `medication`, `patient_id`, and `time` are included in your JSON body.
3.  **Time Format:** Use the `HH:mm` format (e.g., `08:00`, `14:30`) to match the website's database.

---

## 💉 7. Clinical & Diagnostics

| Form               | Method | Endpoint                        |
| :----------------- | :----- | :------------------------------ |
| **IVs & Lines**    | POST   | `/api/ivs-and-lines`            |
| **Discharge Plan** | POST   | `/api/discharge-planning`       |
| **Upload Image**   | POST   | `/api/diagnostics`              |
| **View Images**    | GET    | `/api/diagnostics/patient/{id}` |

---

## 🛠️ Troubleshooting Tips

1.  **404 Error:** Ensure your mobile URL ends with `/api`.
2.  **401 Error:** Login again to get a fresh token.
3.  **Missing Data:** The website uses `patient_id`. I have mapped this to `id` in all API responses for your React Native app.
4.  **Audit Logs:** Every form you submit via mobile will automatically appear in the Audit Logs on the website.
