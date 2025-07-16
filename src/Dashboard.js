import React from "react";
import DashboardSection from "./DashboardSection";

// ฟังก์ชันที่เกี่ยวข้องกับ dashboard (ย้ายมาจาก App.js)

function getBasicStats(data) {
  const base = {
    New: 0,
    "In Process": 0,
    Pending: 0,
    Closed: 0,
    Cancelled: 0,
    Reject: 0,
  };
  data.forEach((t) => {
    let s = t.status || t["สถานะ"];
    if (s === "In Progress") s = "In Process";
    if (s === "Rejected") s = "Reject";
    if (s === "Completed" || s === "Complete") s = "Closed";
    if (base[s] !== undefined) base[s]++;
  });
  return base;
}

function getDailySummary(data) {
  const dailySummary = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dailySummary[dateKey] = {
      date: date,
      count: 0,
      New: 0,
      'In Process': 0,
      Pending: 0,
      Closed: 0,
      Cancelled: 0,
      Reject: 0,
    };
  }
  data.forEach(ticket => {
    if (!ticket["วันที่แจ้ง"]) return;
    const ticketDate = new Date(ticket["วันที่แจ้ง"]).toISOString().split('T')[0];
    let status = ticket["สถานะ"];
    if (status === "In Progress") status = "In Process";
    if (status === "Rejected") status = "Reject";
    if (status === "Completed" || status === "Complete") status = "Closed";
    if (dailySummary[ticketDate]) {
      dailySummary[ticketDate].count++;
      if (dailySummary[ticketDate][status] !== undefined) {
        dailySummary[ticketDate][status]++;
      }
    }
  });
  return Object.values(dailySummary).sort((a, b) => b.date - a.date);
}

function getUpcomingAppointments(data) {
  const now = new Date();
  return data.filter((t) => {
    if (t["Type"] !== "Service" && t["Type"] !== "Helpdesk") return false;
    if (t["สถานะ"] !== "New" && t["สถานะ"] !== "Pending") return false;
    const apptRaw = t["Appointment"] || t["appointment text"] || t["appointment_datetime"];
    if (!apptRaw) return false;
    try {
      let apptDate;
      if (apptRaw.includes('-')) {
        const [dateStr, timeRange] = apptRaw.split(' ');
        const [startTime] = timeRange.split('-');
        const [hours, minutes] = startTime.split(':');
        apptDate = new Date(dateStr);
        apptDate.setHours(parseInt(hours), parseInt(minutes));
      } else {
        apptDate = new Date(apptRaw);
      }
      if (isNaN(apptDate.getTime())) return false;
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const isToday = apptDate.toDateString() === today.toDateString();
      const isOverdue = apptDate < now;
      return isToday || isOverdue;
    } catch (error) {
      return false;
    }
  }).sort((a, b) => {
    const getDateTime = (ticket) => {
      const apptRaw = ticket["Appointment"] || ticket["appointment text"] || ticket["appointment_datetime"];
      try {
        if (apptRaw.includes('-')) {
          const [dateStr, timeRange] = apptRaw.split(' ');
          const [startTime] = timeRange.split('-');
          const [hours, minutes] = startTime.split(':');
          const date = new Date(dateStr);
          date.setHours(parseInt(hours), parseInt(minutes));
          return date;
        }
        return new Date(apptRaw);
      } catch {
        return new Date(0);
      }
    };
    return getDateTime(a) - getDateTime(b);
  });
}

function getOverdueAppointments(data) {
  const overdueTickets = [];
  const now = new Date();
  data.forEach(ticket => {
    if (!ticket["วันที่แจ้ง"]) return;
    const created = new Date(ticket["วันที่แจ้ง"]);
    const hoursSinceCreation = (now - created) / (1000 * 60 * 60);
    if (ticket["สถานะ"] !== "Completed" && hoursSinceCreation > 48) {
      overdueTickets.push({
        id: ticket["Ticket ID"],
        name: ticket["ชื่อ"],
        department: ticket["แผนก"],
        status: ticket["สถานะ"],
        hoursOverdue: Math.floor(hoursSinceCreation - 48)
      });
    }
  });
  return overdueTickets.sort((a, b) => b.hoursOverdue - a.hoursOverdue);
}

export default function Dashboard({ data }) {
  return (
    <DashboardSection
      stats={getBasicStats(data)}
      daily={getDailySummary(data)}
      upcoming={getUpcomingAppointments(data)}
      overdue={getOverdueAppointments(data)}
    />
  );
} 