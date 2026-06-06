import { pgTable, serial, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

// Sapphire Voyage — ride bookings.
// Dates/times are stored as plain strings (date = "YYYY-MM-DD", time = "HH:MM")
// so availability math is timezone-stable for Puerto Rico (AST, no DST).
export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // Null for guest bookings; set when a logged-in customer books.
  customerId: integer("customer_id").references(() => usersTable.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  // "airport" | "point-to-point" | "long-distance" | "event" | "tour"
  serviceType: text("service_type").notNull(),
  // "one-way" | "round-trip"
  tripType: varchar("trip_type", { length: 20 }).notNull().default("one-way"),
  pickup: text("pickup").notNull(),
  dropoff: text("dropoff").notNull(),
  passengers: integer("passengers").notNull().default(1),
  date: text("date").notNull(),
  time: text("time").notNull(),
  returnDate: text("return_date"),
  returnTime: text("return_time"),
  notes: text("notes"),
  // "pending" | "confirmed" | "completed" | "cancelled"
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  priceQuote: text("price_quote"),
  adminNotes: text("admin_notes"),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  createdAt: true,
  customerId: true,
  status: true,
  priceQuote: true,
  adminNotes: true,
});

export type Booking = typeof bookingsTable.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Admin-blocked dates/times. time = null means the whole day is blocked.
export const blockedSlotsTable = pgTable("blocked_slots", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  date: text("date").notNull(),
  time: text("time"),
  reason: text("reason"),
});

export type BlockedSlot = typeof blockedSlotsTable.$inferSelect;
