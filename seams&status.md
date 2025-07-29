# Tailor Management MVP – PRD

## 1. Title & Author

**Product:** Seams & Status MVP
**Author:** Ayo (you)
**Date:** July 28, 2025

---

## 2. Purpose & Vision

**Problem statement:** Tailors mostly rely on manual records for customers, measurements, orders, and payments, leading to inefficiencies and errors.
**Vision:** Provide a simple web-based tool where tailors can digitally track customers, record measurements, manage a single order lifecycle, and update payments to streamline workflow and improve accuracy.

---

## 3. Stakeholders

* **Primary User:** Independent tailors or small tailoring businesses
* **Internal:** You (owner/developer), potential early testers (tailors), advisor or partner

---

## 4. Target Users & Personas

* **Persona:** “Tailor Tolu,” age 30–50, familiar with pen-and-paper or Excel, wants digital ease without complexity.
* **Pain Points:** Lost measurement notes, no tracking of payments or fitting appointments, difficulty reusing customer data.
* **Goals:** Record measurements once, manage per-order cost and payment, track fitting and collection easily.

---

## 5. Scope

### Must-Have (MVP)

* **Authentication:** Staff login (email/password)
* **Customer Profile:** name, contact; reuse past measurement sets
* **Measurement Forms:** Gender-specific fields and a field for style/type of clothing:

  * *Women:* shoulder, bust, waist, hip, length, underbust length, underbust waist, bust span, sleeve, round sleeve
  * *Men:* shoulder, bust, waist, hip, length, sleeve, crotch length, lap
* **Single Order Creation:** link customer → style, arrival date, measurement set, material cost, initial payment, status
* **Order Status Lifecycle:** New → In Progress → Ready for Fitting → Collected / Completed
* **Payment Tracking:** record deposit + subsequent payments, calculate outstanding balance
* **Appointment Fields:** fitting date and collection status flag

### Should-Have (if fast)

* Simple dashboard listing orders, filter by status or customer
* Search customer by name or contact

### Out of Scope (MVP)

* Inventory/material tracking
* Automated messaging (SMS/email reminders)
* PDF invoice generation or exports
* Reporting or analytics
* Offline mode or mobile-only app

---

## 6. Functional Requirements

### 6.1 Authentication

* Staff sign‑in via email/password
* Only authenticated users can view/modify data

### 6.2 Customer Management

* Create & edit customer profiles
* View past measurement sets
* Copy a past measurement into a new order

### 6.3 Measurement Capture

* Gender-selected measurement form
* Field to specify style/type of clothing for the measurement set (e.g., "Agbada")
* Numeric validation (e.g. no negative values)

### 6.4 Order Lifecycle

* New order creation form capturing all core info
* Visual status indicator of job stage
* Fitting date input field
* "Collected" toggle to complete job

### 6.5 Payment Module

* Enter initial deposit on order creation
* Update payment log (amount + date)
* Automatically compute remaining balance

### 6.6 Dashboard / Search (Optional)

* Sort or filter orders by status or dates
* Search customers/orders by name or phone

---

## 7. Non‑Functional Requirements

* **Performance:** Form submissions under 1 second; dashboard lists load fast
* **Reliability:** Secure Firestore rules; data persistency
* **Usability:** Mobile-optimized forms; clear field labels
* **Security:** Firebase Auth only; secure Firestore rules
* **Scalability:** Easy to extend with Cloud Functions or Storage later

---

## 8. User Flows & Story-level Scenarios

1. **Login → Customer List View**
2. **Add a new customer** → fill name/contact → save
3. **Enter measurement** → choose gender → fill fields or copy previous → save
4. **Create Order** → select customer → enter style, arrival date, link measurement, input cost & initial payment → save
5. **Dashboard View** → filter orders by status; click to view/edit
6. **Add Payment** → log new payment → balance updates
7. **Set Fitting Date** → schedule date on order
8. **Mark Collected** → order completed

---

## 9. Success Metrics & Evaluation Criteria

* At least **3 tailors** onboarded within first month
* Each using tool for **10+ orders**
* Qualitative feedback: is this simpler/faster than pen‑and‑paper?
* Accurate data captured in customer, measurement, order, and payment collections
* Repeat user usage indicating preference for measurement reuse

---

## 10. Timeline & Milestones

| Week | Goals                                                      |
| ---- | ---------------------------------------------------------- |
| 1    | Define Firestore schema, set up Auth & basic app structure |
| 2    | Build customer and measurement forms                       |
| 3    | Order creation and payment update functionality            |
| 4    | Dashboard + order status flow, collection mark             |
| 5    | UI polish, basic user testing with tailors                 |
| 6    | MVP launch, gather real feedback, iterate                  |

---

## 11. Risks & Assumptions

* **Assumption:** Tailors are willing to trade familiarity for digital convenience
* **Risk:** Forms may feel cumbersome—test for simplicity early
* **Dependency:** Firestore usage cost must be monitored as usage grows
* **Auth friction:** Can explore SMS login later if email/password not convenient
* **Feedback dependency:** ASAP feedback essential to iterate

---

## 12. Appendix – Firestore Schema (Draft)

```text
customers/{customerId}:
  userId: ref // Link to the staff user who created the customer
  name: string
  contact: string
  gender: "men" or "women"
  measurementHistory: [{ measurementId, date }]

measurements/{measurementId}:
  userId: ref // Link to the staff user who created the measurement
  customerId: ref
  gender: string
  garmentType: string // e.g., "Agbada", "Kaftan"
  values: { shoulder, bust, waist, hip, ... }
  createdAt: timestamp

orders/{orderId}:
  customerId: ref
  measurementId: ref
  style: string
  arrivalDate: date
  fittingDate: date | null
  materialCost: number
  initialPayment: number
  status: string
  collected: boolean

payments/{paymentId}:
  orderId: ref
  amount: number
  date: date
  note: string | null
```

---
