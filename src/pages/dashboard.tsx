import { api } from "~/utils/api";
import { Chart } from "react-google-charts";

export default function Dashboard() {
  const { data } = api.block.getLatest.useQuery();

  if (!data) {
    return null;
  }

  function getHoursBetweenDates(date1: Date, date2: Date) {
    return (date2.getTime() - date1.getTime()) / 1000 / 60 / 60;
  }

  const numberFormatter = new Intl.NumberFormat(undefined, {
    style: "decimal",
    maximumFractionDigits: 2,
  });

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const blockCount = data.length;
  const totalTime = data.reduce(
    (acc, block) => acc + getHoursBetweenDates(block.timeStart, block.timeEnd),
    0,
  );
  const totalMilage = data.reduce(
    (acc, block) => acc + (block.milageEnd - block.milageStart),
    0,
  );
  const totalPay = data.reduce((acc, block) => acc + block.pay, 0);

  const avgTime = totalTime / data.length;
  const avgMilage = totalMilage / data.length;
  const avgPay = totalPay / data.length;

  const pickupLocationCount = data.reduce(
    (acc, block) => {
      if (!acc[block.pickupLocation]) {
        acc[block.pickupLocation] = 0;
      }
      acc[block.pickupLocation]++;
      return acc;
    },
    {} as Record<string, number>,
  );

  const pieChartData = [
    ["Location", "Count"],
    ...Object.entries(pickupLocationCount),
  ];

  const pieChartOptions = {
    title: "Pickup Location Breakdown",
    fontName: "Ember, sans-serif",
    titleTextStyle: {
      fontSize: 32,
      bold: false,
    },
    legend: {
      position: "bottom",
      textStyle: { fontSize: 16 },
    },
    height: 400,
    width: 600,
  };

  return (
    <div className="min-h-svh  bg-slate-100 ">
      <div className="flex w-full flex-wrap justify-center gap-4 py-8">
        <div className="text-nowrap rounded bg-white p-4 shadow-lg">
          <h2 className="text-bold text-3xl">Totals</h2>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xl">
            <span>Time:</span>
            <span>{numberFormatter.format(totalTime)} hours</span>
            <span>Milage:</span>
            <span>{totalMilage} miles</span>
            <span>Pay:</span>
            <span>{currencyFormatter.format(totalPay)}</span>
            <span>Block Count:</span>
            <span>{blockCount}</span>
          </div>
        </div>
        <div className="text-nowrap rounded bg-white p-4 shadow-lg">
          <h2 className="text-bold text-3xl">Averages (Per Block)</h2>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xl">
            <span>Average time:</span>
            <span>{numberFormatter.format(avgTime)} hours</span>
            <span>Average milage:</span>
            <span>{numberFormatter.format(avgMilage)} miles</span>
            <span>Average pay:</span>
            <span>{currencyFormatter.format(avgPay)}</span>
          </div>
        </div>
        <div className="rounded bg-white p-4 shadow-lg">
          <Chart
            chartType="PieChart"
            data={pieChartData}
            options={pieChartOptions}
          />
        </div>
      </div>
    </div>
  );
}
