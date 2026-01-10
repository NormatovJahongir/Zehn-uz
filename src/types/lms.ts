// Type definitions for Edu-market-2 LMS
// Purpose: core domain interfaces and enums for Users, Courses, Attendance, Payments, and Centers.

export type ID = string;                   // universal id type (UUID/string)
export type ISODateString = string;        // timestamp in ISO 8601 format

// Roles available in the system
export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

// Basic user record
export interface User {
  id: ID;
  role: Role;
  email: string;
  firstName: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  // optionally associate a user with a Center (for staff or students tied to a center)
  centerId?: ID;
  // relations (store IDs to avoid circular deep models)
  enrolledCourseIds?: ID[];   // for STUDENT
  teachingCourseIds?: ID[];   // for TEACHER
  isActive?: boolean;
  // audit
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  // arbitrary metadata
  meta?: Record<string, unknown>;
}

// Course record
export interface Course {
  id: ID;
  title: string;
  shortDescription?: string;
  description?: string;
  // primary instructor (for multiple instructors, extend to teacherIds)
  teacherId?: ID;
  teacherIds?: ID[];          // support multiple teachers
  centerId?: ID;              // the center where this course is held (optional)
  studentIds?: ID[];          // enrolled students
  price?: number;             // base price in smallest currency unit or float depending on your system
  currency?: string;          // ISO currency code e.g. "USD"
  capacity?: number;          // max number of students
  startDate?: ISODateString;
  endDate?: ISODateString;
  durationWeeks?: number;
  schedule?: string;          // human readable schedule or reference to structured schedule
  tags?: string[];
  isPublished?: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  meta?: Record<string, unknown>;
}

// Attendance status for a student on a given date/session
export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
}

// Attendance record (one entry per student per session)
export interface Attendance {
  id: ID;
  courseId: ID;
  studentId: ID;
  date: ISODateString;        // date/time of the session
  status: AttendanceStatus;
  recordedById?: ID;         // teacher/admin who recorded attendance
  notes?: string;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
}

// Payment method and status enums
export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  ONLINE = "ONLINE", // e.g., Stripe / PayPal
  OTHER = "OTHER",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

// Payment record (for course fees, subscriptions, etc.)
export interface Payment {
  id: ID;
  payerId: ID;                // usually the student (or a parent/company)
  courseId?: ID;             // optional if payment is for a specific course
  amount: number;            // store in smallest currency unit or as agreed in your system
  currency: string;          // ISO currency code
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;    // provider transaction id
  receiptUrl?: string;
  paidAt?: ISODateString;
  dueAt?: ISODateString;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  meta?: Record<string, unknown>;
}

// Center (physical location) with coordinates for maps
export interface Center {
  id: ID;
  name: string;
  description?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  // Coordinates for maps and geospatial features
  latitude: number;          // decimal degrees
  longitude: number;         // decimal degrees
  timezone?: string;         // IANA timezone name e.g. "Europe/London"
  openingHours?: string;     // simple human readable or structured object in future
  managerId?: ID;            // center admin/manager user id
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
  meta?: Record<string, unknown>;
}

// Optional: small helper composite types for APIs
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}