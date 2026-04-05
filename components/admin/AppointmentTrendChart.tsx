import { DailyBookingPoint } from "@/lib/appointment-analytics";

type AppointmentTrendChartProps = {
  data: DailyBookingPoint[];
};

export const AppointmentTrendChart = ({
  data,
}: AppointmentTrendChartProps) => {
  const maxCount = Math.max(...data.map((point) => point.count), 1);

  return (
    <div className="rounded-2xl border border-dark-500 bg-dark-300 p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Daily bookings</h2>
          <p className="text-sm text-dark-700">
            New appointments created over the last 7 days.
          </p>
        </div>
        <div className="rounded-full border border-dark-500 px-3 py-1 text-xs text-dark-700">
          Last 7 days
        </div>
      </div>

      <div className="grid min-h-[220px] grid-cols-7 items-end gap-3">
        {data.map((point) => {
          const height = `${Math.max((point.count / maxCount) * 100, point.count > 0 ? 14 : 4)}%`;

          return (
            <div key={point.key} className="flex h-full flex-col justify-end gap-3">
              <div className="flex h-full items-end">
                <div
                  className="w-full rounded-t-2xl bg-green-500/90 transition-all"
                  style={{ height }}
                  title={`${point.label}: ${point.count} booking${point.count === 1 ? "" : "s"}`}
                />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-lg font-semibold text-white">{point.count}</p>
                <p className="text-xs text-dark-700">{point.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
