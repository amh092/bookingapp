# Restaurant Booking Project Specifications

## Problem (Core Idea)

Many restaurants still manage reservations using:

* Phone calls
* WhatsApp messages
* Paper notebooks
* Spreadsheets
* Social media messages
* Separate ordering systems
* Manual table assignment
* Unorganized customer records

This creates double bookings, missed reservations, slow confirmations, unclear table availability, and inefficient restaurant operations.

The Restaurant Booking Platform provides one centralized system where customers can reserve tables and restaurant staff can manage reservations, tables, opening hours, menu items, and orders.

## Users

* **Restaurant Customer**:
  Needs a simple way to view available times, reserve a table, manage a reservation, and browse the menu.

* **Restaurant Owner**:
  Needs full control over restaurant settings, staff, tables, reservations, menu items, and reports.

* **Restaurant Manager**:
  Needs to manage daily reservations, opening hours, orders, and restaurant operations.

* **Restaurant Staff**:
  Needs a quick way to confirm bookings, assign tables, update reservation statuses, and manage orders.

## Features

Here is a list of features for the Restaurant Booking Platform.

### A. Restaurant Information

Each restaurant will have a public profile containing:

* Restaurant name
* Description
* Logo
* Cover image
* Phone number
* Email
* Address
* Location map
* Opening hours
* Social media links
* Available services
* Restaurant policies

Public restaurant URLs should look like:

```text
/restaurants/restaurant-slug
```

For the initial project, the application will support one restaurant.

### B. Reservations

Customers can create table reservations by selecting:

* Number of guests
* Reservation date
* Available time slot
* Customer name
* Phone number
* Email address
* Special requests

Reservation statuses:

* Pending
* Confirmed
* Cancelled
* Completed
* No-show

Customers should receive a unique confirmation code after completing a booking.

Reservation URLs should look like:

```text
/reservations/new
/reservations/confirmation/[confirmationCode]
/reservations/manage/[confirmationCode]
```

### C. Availability

The system will calculate available reservation times using:

* Restaurant opening hours
* Booking duration
* Time-slot duration
* Number of guests
* Table capacities
* Existing reservations
* Blocked dates
* Blocked time periods
* Active and inactive tables

The system must only return a time slot when at least one suitable table is available.

Example:

```text
Date: July 25, 2026
Guests: 4

Available times:
5:00 PM
5:30 PM
7:30 PM
8:00 PM
```

The system must check availability again when the reservation is submitted to prevent double bookings.

### D. Table Management

Restaurant owners and managers can manage tables.

Each table includes:

* Table name or number
* Seating capacity
* Active status
* Location or section
* Optional description

Example tables:

* Table 1 — 2 guests
* Table 2 — 4 guests
* Table 3 — 4 guests
* Family Table — 6 guests
* VIP Table — 8 guests

Staff can assign or change the table connected to a reservation.

### E. Authentication

Restaurant staff will authenticate using:

* Email and password
* Secure access token
* Refresh token
* Logout
* Password reset later

User roles:

* Owner
* Manager
* Staff

Customers will not need accounts for the initial MVP.

### F. Reservation Management

Staff can:

* View all reservations
* Filter reservations by date
* Search by customer name or phone
* Confirm pending reservations
* Cancel reservations
* Reschedule reservations
* Assign tables
* Change guest count
* Add internal notes
* Mark customers as arrived
* Mark reservations as completed
* Mark reservations as no-show

### G. Booking Calendar

The management panel will include a reservation calendar.

Views:

* Daily
* Weekly
* Monthly
* Table-based

Filters:

* Reservation status
* Number of guests
* Assigned table
* Date range

Reservations should be selectable from the calendar to open a details drawer or dialog.

### H. Opening Hours

Restaurant managers can configure opening hours for each day.

Each day includes:

* Opening time
* Closing time
* Closed status

Example:

```text
Sunday: 12:00 PM – 11:00 PM
Monday: 12:00 PM – 11:00 PM
Tuesday: Closed
Wednesday: 12:00 PM – 11:00 PM
```

Restaurants can also create blocked periods for:

* Public holidays
* Private events
* Maintenance
* Staff meetings
* Temporary closures

### I. Menu

Restaurant managers can create menu categories and menu items.

Example categories:

* Appetizers
* Main Courses
* Burgers
* Desserts
* Drinks

Each menu item includes:

* Name
* Description
* Price
* Image
* Category
* Availability
* Featured status
* Preparation time
* Dietary information
* Optional allergens

Public menu URLs should look like:

```text
/menu
/menu/[category]
```

### J. Online Ordering

Customers can:

* Browse menu items
* Filter by category
* Search menu items
* Add items to cart
* Change quantities
* Add item notes
* Select pickup or delivery
* Enter contact information
* Submit an order
* View order confirmation
* Track order status

Order statuses:

* Pending
* Confirmed
* Preparing
* Ready
* Out for delivery
* Completed
* Cancelled

Online ordering will be developed after the reservation MVP.

### K. Notifications

Customers can receive:

* Reservation confirmation
* Reservation cancellation
* Reservation updates
* Reservation reminders
* Order confirmation
* Order status updates

Initial notification method:

* Email

Possible later methods:

* SMS
* WhatsApp

## Data

This is a rough mockup of the data. The structure may change during development.

### USER

* id
* name
* email
* passwordHash
* role
* restaurantId
* createdAt
* updatedAt

### RESTAURANT

* id
* name
* slug
* description
* phone
* email
* address
* logoUrl
* coverUrl
* timezone
* slotDurationMinutes
* bookingDurationMinutes
* createdAt
* updatedAt

### RESTAURANT TABLE

* id
* name
* capacity
* section
* description
* isActive
* restaurantId
* createdAt
* updatedAt

### BUSINESS HOUR

* id
* dayOfWeek
* opensAtMinutes
* closesAtMinutes
* isClosed
* restaurantId

### BLOCKED PERIOD

* id
* startAt
* endAt
* reason
* restaurantId
* createdAt

### CUSTOMER

* id
* name
* phone
* email
* createdAt
* updatedAt

### RESERVATION

* id
* confirmationCode
* guests
* startAt
* endAt
* status
* customerNotes
* internalNotes
* restaurantId
* tableId
* customerId
* createdAt
* updatedAt

### MENU CATEGORY

* id
* name
* description
* position
* isActive
* restaurantId
* createdAt
* updatedAt

### MENU ITEM

* id
* name
* description
* price
* imageUrl
* isAvailable
* isFeatured
* preparationMinutes
* categoryId
* createdAt
* updatedAt

### ORDER

* id
* orderNumber
* type
* status
* subtotal
* deliveryFee
* total
* notes
* address
* restaurantId
* customerId
* createdAt
* updatedAt

### ORDER ITEM

* id
* quantity
* unitPrice
* notes
* orderId
* menuItemId

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS v4
* shadcn/ui
* React Hook Form
* Zod
* date-fns
* Lucide icons

### Backend

* NestJS
* TypeScript
* REST API
* Swagger documentation
* class-validator
* class-transformer
* JWT authentication
* Argon2 password hashing

### Database and ORM

* PostgreSQL
* Prisma ORM
* Neon or Railway PostgreSQL for production
* Local PostgreSQL through Docker during development

Important database rule:

* Never use `prisma db push`
* Always create Prisma migrations
* Run migrations in development
* Run the same migrations in production

Example:

```bash
npx prisma migrate dev --name create_reservations
```

### File Storage

* Cloudinary or Cloudflare R2
* Used for restaurant logos, cover images, and menu item images

### Email

* Resend
* Used for booking confirmations and notifications

### Deployment

* Next.js frontend on Vercel
* NestJS backend on Railway, Render, or Fly.io
* PostgreSQL on Neon or Railway

### Monitoring

* Sentry later
* Backend logging
* Request error tracking

## Project Structure

The frontend and backend are separate projects.

```text
Projects/
├── booking-web/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── public/
│   └── package.json
│
└── booking-api/
    ├── src/
    │   ├── auth/
    │   ├── users/
    │   ├── restaurants/
    │   ├── reservations/
    │   ├── availability/
    │   ├── tables/
    │   ├── customers/
    │   ├── business-hours/
    │   ├── blocked-periods/
    │   ├── menu/
    │   ├── orders/
    │   └── common/
    ├── prisma/
    └── package.json
```

The project will not use Nx or a monorepo.

## UI/UX

### General

* Modern restaurant-focused design
* Clean and welcoming interface
* Mobile-first booking experience
* Light mode by default
* Optional dark mode
* Clear typography
* Generous spacing
* Subtle borders and shadows
* Large touch-friendly booking controls
* Arabic RTL support
* English LTR support
* Accessible forms and dialogs

Design references:

* OpenTable
* Resy
* Airbnb booking flow
* Linear-style admin dashboards
* Modern restaurant websites

### Public Website Layout

* Navbar
* Hero section
* Featured dishes
* About section
* Menu preview
* Reservation call-to-action
* Opening hours
* Restaurant location
* Customer reviews
* Footer

### Public Pages

```text
/
├── menu
├── reservations
├── reservations/confirmation/[code]
├── reservations/manage/[code]
├── cart
├── checkout
└── orders/[orderNumber]
```

### Admin Layout

* Collapsible sidebar
* Top navigation
* Dashboard cards
* Reservation tables
* Calendar views
* Quick-action dialogs
* Mobile sidebar drawer

### Admin Navigation

* Dashboard
* Reservations
* Calendar
* Tables
* Menu
* Orders
* Customers
* Staff
* Settings

### Reservation Cards

Reservation cards should show:

* Customer name
* Reservation time
* Guest count
* Status
* Assigned table
* Phone number
* Special requests

Status colors:

* Pending: yellow
* Confirmed: green
* Cancelled: red
* Completed: blue
* No-show: gray

### Responsive Design

#### Mobile

* Booking form uses one column
* Calendar remains touch-friendly
* Available times use large buttons
* Admin sidebar becomes a drawer
* Data tables can become cards
* Important actions remain visible

#### Desktop

* Persistent admin sidebar
* Multi-column dashboard
* Reservation list and details can appear side by side
* Calendar displays more information
* Table management uses a grid

### Micro-interactions

* Smooth page transitions
* Hover effects on menu and reservation cards
* Toast notifications
* Loading skeletons
* Confirmation dialogs
* Animated status changes
* Disabled loading buttons during submissions

## Security

* Keep database credentials in the NestJS backend only
* Never expose JWT secrets
* Never expose service-role keys
* Never place secrets inside `NEXT_PUBLIC_` variables
* Validate all backend inputs
* Add rate limiting to public reservation endpoints
* Hash passwords using Argon2
* Use secure HTTP-only cookies for refresh tokens
* Restrict admin routes by role
* Validate uploaded image types and sizes
* Recheck availability before creating reservations

## MVP

The initial MVP will include:

* Restaurant landing page
* Public menu page
* Reservation form
* Guest selection
* Date selection
* Available time slots
* Customer details
* Reservation confirmation
* Reservation cancellation
* Admin login
* Admin dashboard
* Reservation list
* Reservation calendar
* Table management
* Opening-hours management
* Blocked-period management

## Later Features

After the reservation MVP:

* Menu management
* Shopping cart
* Pickup orders
* Delivery orders
* Email reminders
* WhatsApp notifications
* Online payments
* Analytics
* Multiple restaurant branches
* Customer accounts
* Loyalty system
* Reviews

## Development Order

1. Create the Next.js frontend
2. Install Tailwind CSS and shadcn/ui
3. Create the NestJS backend
4. Configure PostgreSQL and Prisma
5. Create the initial migration
6. Add restaurant settings
7. Add table management
8. Add opening hours
9. Build availability calculation
10. Build reservation creation
11. Build confirmation and cancellation pages
12. Add admin authentication
13. Build the admin reservation list
14. Build the reservation calendar
15. Add menu management
16. Add online ordering

## Status

* Requirements defined
* Frontend setup started
* Tailwind CSS and shadcn/ui selected
* NestJS selected for the backend
* PostgreSQL and Prisma selected
* Ready to begin the reservation MVP
