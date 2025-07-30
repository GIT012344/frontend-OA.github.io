import React from "react";
import styled from "styled-components";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Doughnut } from "react-chartjs-2";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  FireIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

// ---------- Styled Components ----------
const Wrapper = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
`;

const Grid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  margin-top: 32px;
`;

const DashGrid = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 48px;
  align-items: stretch;
`;

const DashCol = styled.div`
  flex: 1 1 50%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// StatCard สำหรับกราฟ (Bar/Donut)
const StatCard = styled.div`
  background: ${({ gradient }) => gradient || "#fff"};
  color: #fff;
  padding: ${props => props.nopad ? "0" : "24px"};
  border-radius: 16px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.07);
  position: relative;
  overflow: hidden;
  min-height: ${props => props.minHeight || "auto"};
  display: ${props => props.nopad ? "flex" : "block"};
  align-items: ${props => props.nopad ? "center" : "initial"};
  justify-content: ${props => props.nopad ? "center" : "initial"};
`;

const IconWrap = styled.div`
  position: absolute;
  top: -20px;
  right: -20px;
  opacity: 0.2;
  svg {
    width: 120px;
    height: 120px;
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.03em;
`;

const StatLabel = styled.div`
  margin-top: 4px;
  font-size: 0.875rem;
  opacity: 0.9;
`;

// ---------- Meta Info ----------
// Updated status colors for better meaning and consistency
const statusMeta = {
  New: { color: "#3b82f6", gradient: "linear-gradient(135deg,#60a5fa,#2563eb)", icon: <FireIcon /> }, // Blue
  "In Process": { color: "#f59e0b", gradient: "linear-gradient(135deg,#fbbf24,#f59e0b)", icon: <ClockIcon /> }, // Yellow/Orange
  Pending: { color: "#ea580c", gradient: "linear-gradient(135deg,#fb923c,#ea580c)", icon: <CalendarDaysIcon /> }, // Dark Orange/Red-Orange
  Closed: { color: "#10b981", gradient: "linear-gradient(135deg,#6ee7b7,#10b981)", icon: <CheckCircleIcon /> }, // Green
  Cancelled: { color: "#ef4444", gradient: "linear-gradient(135deg,#fca5a5,#ef4444)", icon: <XCircleIcon /> }, // Red
  Reject: { color: "#dc2626", gradient: "linear-gradient(135deg,#f87171,#dc2626)", icon: <XCircleIcon /> }, // Dark Red
};

// ---------- Helper ----------
function buildBarData(dailyRaw) {
  const daily = [...dailyRaw].sort((a,b)=> a.date - b.date);
  const labels = daily.map((d) => d.date.toLocaleDateString('th-TH', {
    month: '2-digit',
    day: '2-digit'
  }));
  const datasets = Object.keys(statusMeta).map((status) => ({
    label: status,
    backgroundColor: statusMeta[status].color + "AA",
    data: daily.map((d) => d[status] || 0),
    stack: "stack1",
    borderWidth: 0,
  }));
  return { labels, datasets };
}
// ลบ DashboardWrapper ออกเนื่องจากมี Sidebar อยู่แล้วใน App.js
// ---------- Main Component ----------
export default function DashboardSection({ stats, daily, upcoming = [], overdue = [] }) {
  if (!stats) return null;
  const doughnutData = {
    labels: Object.keys(statusMeta),
    datasets: [
      {
        data: Object.keys(statusMeta).map((s) => stats[s] || 0),
        backgroundColor: Object.keys(statusMeta).map((s) => statusMeta[s].color + "CC"),
        borderWidth: 0,
      },
    ],
  };

  return (
    <Wrapper>
      {/* TOP STAT CARDS */}
      <Grid>
        {Object.keys(statusMeta).map((status) => (
          <StatCard key={status} gradient={statusMeta[status].gradient}>
            <IconWrap>{statusMeta[status].icon}</IconWrap>
            <StatNumber>{stats[status] ?? 0}</StatNumber>
            <StatLabel>{status}</StatLabel>

          </StatCard>
        ))}

      </Grid>

      {/* CHARTS + APPOINTMENTS */}
      <DashGrid>
        {/* LEFT COLUMN */}
        <DashCol>
          <StatCard gradient="#fff" style={{ color: "#000", minHeight: 320 }}>
            <Bar
              height={320}
              data={buildBarData(daily)}
              options={{
                responsive: true,
                layout: { padding: { top: 24 } },
                plugins: { 
                  legend: { position: "bottom" },
                  datalabels: {
                    display: function(context) {
                      // Safe check for context and parsed data
                      return context && context.parsed && context.parsed.y > 0;
                    },
                    anchor: 'end',
                    align: 'top',
                    offset: 6,
                    color: '#1e293b',
                    font: {
                      weight: 'bold',
                      size: 12,
                      family: 'system-ui, -apple-system, sans-serif'
                    },
                    formatter: function(value, context) {
                      // Safe check for value
                      if (!value || value <= 0) return '';
                      return value;
                    },
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: 'rgba(100, 116, 139, 0.2)',
                    borderRadius: 4,
                    borderWidth: 1,
                    padding: {
                      top: 3,
                      bottom: 3,
                      left: 6,
                      right: 6
                    }
                  }
                },
                interaction: { mode: "index", intersect: false },
                scales: { 
                  x: { stacked: true }, 
                  y: { 
                    stacked: true,
                    beginAtZero: true
                  } 
                },
                maintainAspectRatio: false,
              }}
            />
          </StatCard>
        </DashCol>
        {/* RIGHT COLUMN */}
        <DashCol>
          <StatCard
            gradient="#fff"
            style={{
              color: "#000",
              minHeight: 320,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <div style={{ width: "100%", height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Doughnut
                data={doughnutData}
                options={{
                  maintainAspectRatio: false,
                  cutout: "50%",
                  plugins: { 
                    legend: { 
                      position: "bottom",
                      labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                        font: {
                          size: 12,
                          weight: '500'
                        },
                        generateLabels: function(chart) {
                          const data = chart.data;
                          if (data.labels.length && data.datasets.length) {
                            const dataset = data.datasets[0];
                            const total = dataset.data.reduce((sum, value) => sum + value, 0);
                            
                            return data.labels.map((label, index) => {
                              const value = dataset.data[index];
                              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                              
                              return {
                                text: `${label}: ${value} (${percentage}%)`,
                                fillStyle: dataset.backgroundColor[index],
                                strokeStyle: dataset.backgroundColor[index],
                                lineWidth: 0,
                                pointStyle: 'circle',
                                hidden: false,
                                index: index
                              };
                            });
                          }
                          return [];
                        }
                      }
                    },
                    datalabels: {
                     clip: false,
                      display: function(context) {
                        // Safe check for context and data
                        if (!context || !context.dataset || !context.dataset.data || typeof context.parsed !== 'number') {
                          return false;
                        }
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                        const percentage = total > 0 ? ((value / total) * 100) : 0;
                        return percentage > 5; // Only show labels for segments > 5%
                      },
                      color: '#fff',
                      font: {
                        weight: 'bold',
                        size: 12
                      },
                      formatter: function(value, context) {
                        // Safe check for context and data
                        if (!context || !context.dataset || !context.dataset.data || typeof value !== 'number') {
                          return '';
                        }
                        const total = context.dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${percentage}%`;
                      },
                      textAlign: 'center'
                    }
                  },
                  responsive: true,
                  interaction: {
                    intersect: false
                  },
                  elements: {
                    arc: {
                      borderWidth: 2,
                      borderColor: '#fff'
                    }
                  }
                }}
              />
            </div>
          </StatCard>
        </DashCol>
      </DashGrid>     
      
      {(!upcoming || upcoming.length === 0) && (
        <DashGrid>
          <DashCol style={{ flex: "1 1 100%" }}>
            <StatCard gradient="#fff" style={{ color: "#000", textAlign: "center" }}>
              ไม่พบการนัดหมาย Service วันนี้
            </StatCard>
          </DashCol>
        </DashGrid>
      )}
      
    </Wrapper>
  );
}