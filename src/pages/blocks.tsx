import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CurrencyInput from "react-currency-input-field";

export default function Blocks() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <BlockForm />
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
  sceduledTimeStart: z.string().refine(timeValidation, {
    message: "Invalid time format, expected HH:mm or HH:mm:ss",
  }),
  sceduledTimeEnd: z.string().refine(timeValidation, {
    message: "Invalid time format, expected HH:mm or HH:mm:ss",
  }),
  pay: z
    .string()
    .transform((value) => parseFloat(value))
    .refine((value) => value > 0, "The amount must be greater than zero"),
  timeStart: z.date(),
  timeEnd: z.date(),
  milageStart: z.number().positive(),
  milageEnd: z.number().positive(),
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

  console.log("errors", errors);

  return (
    <form
      onSubmit={handleSubmit((d) => console.log(d))}
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
        <label className="font-bold" htmlFor="sceduledTimeStart">
          Scheduled Time Start
        </label>
        <input
          {...register("sceduledTimeStart")}
          className="focus:shadow-outline rounded border px-2 text-gray-700 shadow focus:outline-none"
          id="sceduledTimeStart"
          type="time"
        />
      </div>
      <div className="flex gap-4 p-4">
        <label className="font-bold" htmlFor="sceduledTimeEnd">
          Scheduled Time End
        </label>
        <input
          {...register("sceduledTimeEnd")}
          className="focus:shadow-outline rounded border px-2 text-gray-700 shadow focus:outline-none"
          id="sceduledTimeEnd"
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
      <button
        className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
        type="submit"
      >
        Submit
      </button>
    </form>
  );
}
