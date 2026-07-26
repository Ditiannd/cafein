# PRD — Sandbox Floor Planner v2

## Overview

The Sandbox Floor Planner is the central source of truth for every table within the restaurant.

It is not simply a drag-and-drop editor. It defines the actual restaurant layout used across:

- Customer Booking
- Walk-in QR
- POS
- Order Queue
- Reservation System
- Analytics
- Order History
- Backend APIs

Every feature referencing a table must consume data from the Floor Planner.

No module may maintain its own table coordinates or layout.

---

# Objectives

Create a professional floor planning system similar to modern restaurant management platforms.

The planner should allow administrators to design the café visually while ensuring every change automatically propagates throughout the system.

---

# Core Principles

## Single Source of Truth

The Floor Planner owns:

- table positions
- table dimensions
- table metadata
- table status
- layout objects
- QR assignments

Other modules only consume this data.

---

## Flexible Canvas

The planner should NOT use a fixed 8×8 grid.

Instead, use an infinite (or configurable) design canvas.

The grid is only an editing aid.

Administrators should never feel constrained by grid cells.

---

# Canvas Features

## Infinite Canvas

Support:

- Zoom
- Pan
- Fit to screen
- Reset View
- Mini Map (future)

---

## Optional Snap Grid

Grid is optional.

Admin can:

- Enable / Disable
- Change spacing
- Change opacity
- Toggle magnetic snapping

Grid is never the stored coordinate system.

---

# Coordinate System

Store normalized canvas coordinates.

Example:

```ts
{
    x: 421.35,
    y: 196.82,
    width: 120,
    height: 120,
    rotation: 90,
    scale: 1,
    zIndex: 4
}
```

These coordinates become the canonical position.

The renderer scales them responsively.

Never store discrete grid cells.

---

# Floor Objects

The planner should support multiple object types.

## Tables

Properties

- id
- name
- capacity
- shape
- x
- y
- width
- height
- rotation
- status
- qrCode
- notes

Supported Shapes

- Square
- Rectangle
- Round
- Oval
- Bar Seat
- Sofa
- Private Room

---

## Static Objects

Support decorative objects.

Examples

- Wall
- Counter
- Cashier
- Kitchen
- Plant
- Window
- Door
- Decoration
- Waiting Area
- Restroom
- Divider
- Custom Object

Static objects are visual only.

---

# Editing Features

Administrator can:

Move

Rotate

Resize

Duplicate

Delete

Copy

Paste

Undo

Redo

Multi-select

Align

Distribute

Bring Forward

Send Backward

Lock Position

Hide

Show

Rename

Group Objects (future)

---

# Keyboard Shortcuts

Ctrl+C

Ctrl+V

Delete

Ctrl+Z

Ctrl+Shift+Z

Arrow Keys

Shift Drag

Space + Drag

Mouse Wheel Zoom

---

# Selection

Single Select

Multi Select

Selection Box

Property Inspector

Context Menu

---

# Collision Detection

Prevent tables from overlapping.

Allow override if administrator disables collision mode.

---

# Save Layout

Saving stores:

Object positions

Metadata

Canvas settings

Zoom level (optional)

Version history

---

# Versioning

Support layout versions.

Examples

Morning Layout

Weekend Layout

Holiday Layout

Outdoor Event Layout

Administrator can:

Duplicate

Rename

Restore

Archive

---

# QR Integration

Each table owns one QR.

Generate

Regenerate

Download

Bulk Generate

Print

QR always references the table ID.

---

# Table Lifecycle

Available

↓

Reserved

↓

Occupied

↓

Cleaning

↓

Available

Alternative:

Available

↓

Out Of Service

↓

Available

Status changes automatically.

Never manually synchronize.

---

# Reservation Integration

Booking a table automatically:

marks Reserved

blocks double booking

updates customer view

updates POS

updates admin

updates analytics

---

# POS Integration

POS never creates tables.

POS only consumes planner data.

Table assignment always references:

Floor Planner Table ID

---

# Customer Integration

Customer pages render the same layout.

Read-only.

Customers can:

see table location

see capacity

see availability

select tables

view occupied tables

Changes by administrator appear automatically.

---

# Backend Architecture

Tables

Layout Objects

Reservations

QR

Status

Bookings

Orders

Receipts

must all reference:

Table ID

---

# Database

Tables

LayoutObjects

LayoutVersions

Reservations

Orders

OrderItems

Transactions

QR Codes

Reviews

Customers

No duplicated coordinates.

No duplicated layouts.

---

# API

GET /floor/layout

PUT /floor/layout

POST /tables

PATCH /tables/:id

DELETE /tables/:id

GET /tables

GET /tables/availability

POST /tables/:id/status

POST /tables/:id/qr

POST /layout/version

GET /layout/version

POST /layout/restore

---

# Performance

Canvas should support

100+ tables

1000+ objects

without visible lag.

Dragging must remain smooth.

---

# Responsive Rendering

The exact same layout should render correctly on

Desktop

Tablet

Mobile

POS

Customer Booking

No distortion.

---

# Future Features

Heatmap

Reservation Density

AI Auto Arrangement

Suggested Layout

Real-time Multi-user Editing

Live Cursor

Table Analytics

Revenue by Table

Occupancy Timeline

Customer Flow Visualization

---

# Documentation

Every change to the Floor Planner must update:

- `prd.md`
- `project_docs.md`

The Floor Planner is the authoritative source for every table-related feature. Any future functionality involving tables, reservations, seating, orders, analytics, or customer interactions must integrate with this architecture instead of creating separate implementations.