# Seams & Status MVP - Task List

This document breaks down the tasks required to build the Seams & Status MVP, based on the PRD.

## Week 1: Project Setup & Core Infrastructure
- [x] Define final Firestore schema based on the draft in the PRD.
- [x] Set up a new Firebase project (including Authentication and Firestore).
- [x] Initialize the web application project (e.g., Next.js with TypeScript).
- [x] Create the basic application folder structure (e.g., `app`, `components`, `lib`, `hooks`).
- [x] Implement staff authentication (login form, session management).
- [x] Implement protected routes using Next.js middleware.

## Week 2: Customer & Measurement Management
### Customer Features
- [x] Create the UI to display a list of all customers.
- [x] Build the form to add/edit a customer's profile (name, contact, gender).
- [x] Implement the backend logic to create, update, and read customer data from Firestore.
- [ ] Create a view to see a single customer's details and their measurement history.

### Measurement Features
- [x] Build the gender-specific measurement forms with all required fields, including one for the style/type of clothing.
- [x] Add numeric validation for measurement inputs.
- [x] Implement logic to save new measurement sets to Firestore, linked to a customer.
- [x] Implement functionality to copy a customer's past measurement set into a new one.

## Week 3: Order Creation & Payment Functionality
### Order Creation
- [x] Build the order creation form.
- [x] Add functionality to link an order to a customer and one of their measurement sets.
- [x] Include fields for style, arrival date, material cost, and initial payment.
- [x] Implement the backend logic to save the new order to Firestore.
- [x] Set the default status for new orders to "New".

### Payment Tracking
- [x] On the order details page, display the payment history.
- [x] Build the UI to add a new payment to an order (amount + date).
- [x] Automatically calculate and display the outstanding balance based on material cost and payments made.
- [x] Implement backend logic to save payment records.

## Week 4: Dashboard & Order Status Flow
### Dashboard
- [x] Create a main dashboard page to view all orders.
- [x] Add filters to the dashboard to sort/view orders by status.
- [ ] (Optional) Add a search bar to find a customer by name or contact.
- [x] Each order in the list should be a link to its detailed view.

### Order Lifecycle
- [x] Implement the UI to update an order's status (New → In Progress → Ready for Fitting → Collected / Completed).
- [x] Add a date picker to set a `fittingDate` for an order.
- [x] Add a toggle or button to mark an order as "Collected" to complete it.
- [x] Ensure the visual status indicator on the dashboard updates correctly.

## Week 5: UI Polish & User Testing
- [ ] Review the entire application for UI/UX consistency and ease of use.
- [ ] Ensure all forms and views are mobile-responsive and usable on small screens.
- [ ] Write basic tests for critical user flows.
- [ ] Onboard 1-2 friendly tailors for initial user testing.
- [ ] Address bugs and incorporate feedback from the testing phase.

## Week 6: Launch & Iteration
- [ ] Prepare the application for production deployment.
- [ ] Deploy the MVP to a hosting provider (e.g., Vercel, Firebase Hosting).
- [ ] Onboard the first cohort of tailors (target: 3+).
- [ ] Establish a clear channel for collecting user feedback (e.g., a simple form or a chat group).
- [ ] Monitor Firestore usage and application performance.

## Non-Functional Requirements Checklist
- [ ] **Performance:** All form submissions and data lists load in under 1 second.
- [ ] **Reliability:** Firestore security rules are implemented to protect user data.
- [ ] **Usability:** All form fields have clear labels and are optimized for mobile.
- [ ] **Security:** All data-modifying actions require authentication. 