export const AppointmentStatusChart = ({ data }: { data: Record<string, number> }) => {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  const statuses = [
    { status: "Scheduled", color: "bg-green-500", key: "scheduled" },
    { status: "Pending", color: "bg-yellow-500", key: "pending" },
    { status: "Cancelled", color: "bg-red-500", key: "cancelled" },
  ];

  return (
    <div className="rounded-2xl border border-dark-500 bg-dark-300 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Appointment Status Distribution
      </h2>
      <div className="space-y-4">
        {statuses.map(({ status, color, key }) => {
          const count = data[key] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={key}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-dark-700">{status}</span>
                <span className="font-semibold text-white">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-dark-500">
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
