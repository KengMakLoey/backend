import {
  mysqlTable,
  int,
  varchar,
  datetime,
  date,
  boolean,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// 1. Patient
export const patient = mysqlTable("patient", {
  patientId: int("patient_id").primaryKey().autoincrement(),
  hn: varchar("hn", { length: 255 }).unique().notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  createdAt: datetime("created_at"),
});

// 2. Department
export const department = mysqlTable("department", {
  departmentId: int("department_id").primaryKey().autoincrement(),
  departmentCode: varchar("department_code", { length: 255 }).unique().notNull(),
  departmentName: varchar("department_name", { length: 255 }),
  building: varchar("building", { length: 255 }),
  floor: varchar("floor", { length: 255 }),
  room: varchar("room", { length: 255 }),
});

// 3. Visit
export const visit = mysqlTable("visit", {
  visitId: int("visit_id").primaryKey().autoincrement(),
  vn: varchar("vn", { length: 255 }).unique().notNull(),
  patientId: int("patient_id").notNull().references(() => patient.patientId),
  visitDate: date("visit_date"),
  createdAt: datetime("created_at"),
});

// 4. Queue
export const queue = mysqlTable("queue", {
  queueId: int("queue_id").primaryKey().autoincrement(),
  queueNumber: varchar("queue_number", { length: 255 }),
  visitId: int("visit_id").unique().notNull().references(() => visit.visitId),
  departmentId: int("department_id").notNull().references(() => department.departmentId),
  status: varchar("status", { length: 255 }),
  issuedTime: datetime("issued_time"),
  calledTime: datetime("called_time"),
  completedTime: datetime("completed_time"),
});

// 5. Queue Status History
export const queueStatusHistory = mysqlTable("queue_status_history", {
  historyId: int("history_id").primaryKey().autoincrement(),
  queueId: int("queue_id").notNull().references(() => queue.queueId),
  oldStatus: varchar("old_status", { length: 255 }),
  newStatus: varchar("new_status", { length: 255 }),
  changedBy: varchar("changed_by", { length: 255 }),
  changedAt: datetime("changed_at"),
});

// 6. Staff
export const staff = mysqlTable("staff", {
  staffId: int("staff_id").primaryKey().autoincrement(),
  staffName: varchar("staff_name", { length: 255 }),
  role: varchar("role", { length: 255 }),
  departmentId: int("department_id").references(() => department.departmentId),
});

// 7. Notification
export const notification = mysqlTable("notification", {
  notificationId: int("notification_id").primaryKey().autoincrement(),
  queueId: int("queue_id").notNull().references(() => queue.queueId),
  notificationType: varchar("notification_type", { length: 255 }),
  message: varchar("message", { length: 255 }),
  isSent: boolean("is_sent"),
  sentAt: datetime("sent_at"),
});

// 8. Service Step
export const serviceStep = mysqlTable("service_step", {
  stepId: int("step_id").primaryKey().autoincrement(),
  visitId: int("visit_id").notNull().references(() => visit.visitId),
  stepOrder: int("step_order"),
  serviceName: varchar("service_name", { length: 255 }),
  location: varchar("location", { length: 255 }),
  status: varchar("status", { length: 255 }),
});

// --- Relations (เพื่อให้ Drizzle Query ใช้งานง่ายขึ้น) ---

export const patientRelations = relations(patient, ({ many }) => ({
  visits: many(visit),
}));

export const departmentRelations = relations(department, ({ many }) => ({
  queues: many(queue),
  staff: many(staff),
}));

export const visitRelations = relations(visit, ({ one, many }) => ({
  patient: one(patient, {
    fields: [visit.patientId],
    references: [patient.patientId],
  }),
  queue: one(queue), // 1-to-1
  serviceSteps: many(serviceStep),
}));

export const queueRelations = relations(queue, ({ one, many }) => ({
  visit: one(visit, {
    fields: [queue.visitId],
    references: [visit.visitId],
  }),
  department: one(department, {
    fields: [queue.departmentId],
    references: [department.departmentId],
  }),
  history: many(queueStatusHistory),
  notifications: many(notification),
}));

export const queueStatusHistoryRelations = relations(queueStatusHistory, ({ one }) => ({
  queue: one(queue, {
    fields: [queueStatusHistory.queueId],
    references: [queue.queueId],
  }),
}));

export const staffRelations = relations(staff, ({ one }) => ({
  department: one(department, {
    fields: [staff.departmentId],
    references: [department.departmentId],
  }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  queue: one(queue, {
    fields: [notification.queueId],
    references: [queue.queueId],
  }),
}));

export const serviceStepRelations = relations(serviceStep, ({ one }) => ({
  visit: one(visit, {
    fields: [serviceStep.visitId],
    references: [visit.visitId],
  }),
}));