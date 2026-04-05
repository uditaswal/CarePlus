import { Appointment } from "@/types/appwrite.types";

const DAILY_BOOKING_WINDOW_DAYS = 7;
const PROJECTED_CONSULTATION_FEE = 150;

export type DailyBookingPoint = {
  key: string;
  label: string;
  count: number;
};

export type DoctorLoad = {
  doctorName: string;
  appointments: number;
  scheduled: number;
  pending: number;
  cancelled: number;
};

export type AppointmentAnalytics = {
  scheduledCount: number;
  pendingCount: number;
  cancelledCount: number;
  rescheduleRequestCount: number;
  estimatedRevenue: number;
  dailyBookings: DailyBookingPoint[];
  topDoctors: DoctorLoad[];
};

function getDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function createDailyWindow(days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));

    return {
      key: getDayKey(date),
      label: getDayLabel(date),
      count: 0,
    };
  });
}

export function buildAppointmentAnalytics(
  appointments: Appointment[],
): AppointmentAnalytics {
  const dailyBookings = createDailyWindow(DAILY_BOOKING_WINDOW_DAYS);
  const dailyBookingMap = new Map(
    dailyBookings.map((point) => [point.key, point]),
  );

  const doctorMap = new Map<string, DoctorLoad>();

  let scheduledCount = 0;
  let pendingCount = 0;
  let cancelledCount = 0;
  let rescheduleRequestCount = 0;

  appointments.forEach((appointment) => {
    const doctorName = appointment.primaryPhysician || "Unassigned";
    const doctorStats = doctorMap.get(doctorName) || {
      doctorName,
      appointments: 0,
      scheduled: 0,
      pending: 0,
      cancelled: 0,
    };

    doctorStats.appointments += 1;

    switch (appointment.status) {
      case "scheduled":
        scheduledCount += 1;
        doctorStats.scheduled += 1;
        break;
      case "pending":
        pendingCount += 1;
        doctorStats.pending += 1;
        break;
      case "cancelled":
        cancelledCount += 1;
        doctorStats.cancelled += 1;
        break;
      default:
        break;
    }

    if (appointment.requestStatus === "pending") {
      rescheduleRequestCount += 1;
    }

    const bookingDate = new Date(appointment.$createdAt);
    bookingDate.setHours(0, 0, 0, 0);
    const dayPoint = dailyBookingMap.get(getDayKey(bookingDate));
    if (dayPoint) {
      dayPoint.count += 1;
    }

    doctorMap.set(doctorName, doctorStats);
  });

  return {
    scheduledCount,
    pendingCount,
    cancelledCount,
    rescheduleRequestCount,
    estimatedRevenue: scheduledCount * PROJECTED_CONSULTATION_FEE,
    dailyBookings,
    topDoctors: Array.from(doctorMap.values())
      .sort((left, right) => right.appointments - left.appointments)
      .slice(0, 5),
  };
}

function escapeCsvValue(value: unknown) {
  const normalized =
    value === null || value === undefined ? "" : String(value).replace(/\r?\n/g, " ");

  if (normalized.includes(",") || normalized.includes("\"")) {
    return `"${normalized.replace(/"/g, "\"\"")}"`;
  }

  return normalized;
}

export function serializeAppointmentsToCsv(appointments: Appointment[]) {
  const headers = [
    "Appointment ID",
    "Created At",
    "Patient Name",
    "Patient Email",
    "Patient Phone",
    "Doctor",
    "Status",
    "Scheduled For",
    "Reschedule Status",
    "Requested Time",
    "Reason",
    "Latest Note",
    "Cancellation Reason",
  ];

  const rows = appointments.map((appointment) => [
    appointment.$id,
    appointment.$createdAt,
    appointment.patient?.name || "",
    appointment.patient?.email || "",
    appointment.patient?.phone || "",
    appointment.primaryPhysician || "",
    appointment.status || "",
    appointment.schedule ? new Date(appointment.schedule).toISOString() : "",
    appointment.requestStatus || "none",
    appointment.requestedSchedule
      ? new Date(appointment.requestedSchedule).toISOString()
      : "",
    appointment.reason || "",
    appointment.note || "",
    appointment.cancellationReason || "",
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
}
