import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CurrencyInput from "react-currency-input-field";
import { api } from "~/utils/api";

export default function Blocks() {
  return (
    <div className="flex flex-col items-center justify-center">
      <BlockForm />
      <BlocksFeed />
    </div>
  );
}

const dateValidation = (date: string) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) {
    return false;
  }

  const parsedDate = new Date(date);
  return parsedDate.toISOString().startsWith(date);
};

const timeValidation = (time: string) => {
  const regex = /^(?:[01]\d|2[0-3]):(?:[0-5]\d)(?::(?:[0-5]\d))?$/;
  return regex.test(time);
};

const schema = z.object({
  pickupLocation: z.string().min(1),
  date: z.string().refine(dateValidation, {
    message: "Invalid date format, expected YYYY-MM-DD",
  }),
  scheduledTimeStart: z.string().refine(timeValidation, {
    message: "Invalid time format, expected HH:mm or HH:mm:ss",
  }),
  scheduledTimeEnd: z.string().refine(timeValidation, {
    message: "Invalid time format, expected HH:mm or HH:mm:ss",
  }),
  pay: z
    .string()
    .transform((value) => parseFloat(value))
    .refine((value) => value > 0, "The amount must be greater than zero"),
  timeStart: z.string().refine(timeValidation, {
    message: "Invalid time format, expected HH:mm or HH:mm:ss",
  }),
  timeEnd: z.string().refine(timeValidation, {
    message: "Invalid time format, expected HH:mm or HH:mm:ss",
  }),
  milageStart: z
    .string()
    .transform((value) => parseFloat(value))
    .refine((value) => value > 0, "The amount must be greater than zero"),
  milageEnd: z
    .string()
    .transform((value) => parseFloat(value))
    .refine((value) => value > 0, "The amount must be greater than zero"),
  city: z.string().min(1),
});

function BlockForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const { mutate } = api.block.create.useMutation();

  const onSubmit = (data: z.infer<typeof schema>) => {
    try {
      mutate({
        pickupLocation: data.pickupLocation,
        scheduledTimeStart: new Date(data.date + "T" + data.scheduledTimeStart),
        scheduledTimeEnd: new Date(data.date + "T" + data.scheduledTimeEnd),
        pay: data.pay,
        timeStart: new Date(data.date + "T" + data.timeStart),
        timeEnd: new Date(data.date + "T" + data.timeEnd),
        milageStart: data.milageStart,
        milageEnd: data.milageEnd,
        city: data.city,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit((d) => onSubmit(d as z.infer<typeof schema>))}
      className="flex flex-col p-8"
    >
      <div className="flex gap-4 p-4">
        <label className="font-bold" htmlFor="pickupLocation">
          Pickup Location
        </label>
        <input
          {...register("pickupLocation")}
          className="focus:shadow-outline rounded border px-2 text-gray-700 shadow focus:outline-none"
          id="pickupLocation"
          type="text"
          placeholder="Pickup Location"
        />
      </div>
      <div className="flex gap-4 p-4">
        <label className="font-bold" htmlFor="date">
          Date
        </label>
        <input
          {...register("date")}
          className="focus:shadow-outline rounded border px-2 text-gray-700 shadow focus:outline-none"
          id="date"
          type="date"
        />
      </div>
      <div className="flex gap-4 p-4">
        <label className="font-bold" htmlFor="scheduledTimeStart">
          Scheduled Time Start
        </label>
        <input
          {...register("scheduledTimeStart")}
          className="focus:shadow-outline rounded border px-2 text-gray-700 shadow focus:outline-none"
          id="scheduledTimeStart"
          type="time"
        />
      </div>
      <div className="flex gap-4 p-4">
        <label className="font-bold" htmlFor="scheduledTimeEnd">
          Scheduled Time End
        </label>
        <input
          {...register("scheduledTimeEnd")}
          className="focus:shadow-outline rounded border px-2 text-gray-700 shadow focus:outline-none"
          id="scheduledTimeEnd"
          type="time"
        />
      </div>
      <div className="flex gap-4 p-4">
        <label className="font-bold" htmlFor="pay">
          Pay
        </label>
        <Controller
          name="pay"
          control={control}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <CurrencyInput
              id="currency-input"
              name="currency"
              placeholder="Enter amount"
              defaultValue={value as number}
              decimalsLimit={2}
              onValueChange={(value) => onChange(value)}
              onBlur={onBlur}
              ref={ref}
              prefix={"$"}
              className="focus:shadow-outline rounded border px-2 text-gray-700 shadow focus:outline-none"
            />
          )}
        />
      </div>
      <div className="flex gap-4 p-4">
        <label className="font-bold" htmlFor="timeStart">
          Time Start
        </label>
        <input
          {...register("timeStart")}
          className="focus:shadow-outline rounded border px-2 text-gray-700 shadow focus:outline-none"
          id="timeStart"
          type="time"
        />
      </div>
      <div className="flex gap-4 p-4">
        <label className="font-bold" htmlFor="timeEnd">
          Time End
        </label>
        <input
          {...register("timeEnd")}
          className="focus:shadow-outline rounded border px-2 text-gray-700 shadow focus:outline-none"
          id="timeEnd"
          type="time"
        />
      </div>
      <div className="flex gap-4 p-4">
        <label className="font-bold" htmlFor="milageStart">
          Milage Start
        </label>
        <input
          {...register("milageStart")}
          className="focus:shadow-outline rounded border px-2 text-gray-700 shadow focus:outline-none"
          id="milageStart"
          type="number"
        />
      </div>
      <div className="flex gap-4 p-4">
        <label className="font-bold" htmlFor="milageEnd">
          Milage End
        </label>
        <input
          {...register("milageEnd")}
          className="focus:shadow-outline rounded border px-2 text-gray-700 shadow focus:outline-none"
          id="milageEnd"
          type="number"
        />
      </div>
      <div className="flex gap-4 p-4">
        <label className="font-bold" htmlFor="city">
          City
        </label>
        <input
          {...register("city")}
          className="focus:shadow-outline rounded border px-2 text-gray-700 shadow focus:outline-none"
          id="city"
          type="text"
          placeholder="City"
        />
      </div>
      <button
        className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
        type="submit"
      >
        Submit
      </button>
    </form>
  );
}

function BlocksFeed() {
  const { data } = api.block.getLatest.useQuery();

  if (!data) {
    return null;
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  function calcHourlyRate(time1: Date, time2: Date, pay: number) {
    const hours = (time2.getTime() - time1.getTime()) / 1000 / 60 / 60;
    return pay / hours;
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((block) => (
        <div key={block.id} className="flex flex-col rounded bg-gray-100 p-4">
          <div>
            <span className="font-bold">Pickup Location:</span>{" "}
            {block.pickupLocation}
          </div>
          <div>
            <span className="font-bold">Date:</span>{" "}
            {dateFormatter.format(block.scheduledTimeStart)}
          </div>
          <div>
            <span className="font-bold">Scheduled Time Start:</span>{" "}
            {timeFormatter.format(block.scheduledTimeStart)}
          </div>
          <div>
            <span className="font-bold">Scheduled Time End:</span>{" "}
            {timeFormatter.format(block.scheduledTimeEnd)}
          </div>
          <div>
            <span className="font-bold">Pay:</span>{" "}
            {currencyFormatter.format(block.pay)}
          </div>
          <div>
            <span className="font-bold">Time Start:</span>{" "}
            {timeFormatter.format(block.timeStart)}
          </div>
          <div>
            <span className="font-bold">Time End:</span>{" "}
            {timeFormatter.format(block.timeEnd)}
          </div>
          <div>
            <span className="font-bold">Milage Start:</span> {block.milageStart}
          </div>
          <div>
            <span className="font-bold">Milage End:</span> {block.milageEnd}
          </div>
          <div>
            <span className="font-bold">City:</span> {block.city}
          </div>
          <div>
            <span className="font-bold">Estimated Hourly Rate:</span>{" "}
            {calcHourlyRate(
              block.scheduledTimeStart,
              block.scheduledTimeEnd,
              block.pay,
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
