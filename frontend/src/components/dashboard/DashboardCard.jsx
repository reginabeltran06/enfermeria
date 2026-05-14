// frontend/src/components/dashboard/DashboardCard.jsx
import React from "react";
import "./DashboardCard.css";

function DashboardCard({
  title,
  value,
  icon,
  color = "primary",
  trend,
  subtitle,
}) {
  return (
    <div className={`dashboard-card dashboard-card-${color} card-hover`}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <div className="card-title">{title}</div>
        <div className="card-value">{value}</div>
        {trend && <div className="card-trend">📈 {trend}</div>}
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

export default DashboardCard;
