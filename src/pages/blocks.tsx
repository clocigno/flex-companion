import { ZodError, z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CurrencyInput from "react-currency-input-field";
import { api } from "~/utils/api";
import { useRef, useState, useEffect, use } from "react";
import { isInt, isISO8601, isTime, isFloat } from "validator";
import { Toaster, toast } from "react-hot-toast";

type BlockFormProps = {
  formRef: React.RefObject<HTMLDialogElement>;
  defaultValues: Block | undefined;
};

type BlockFeedProps = {
  formRef: React.RefObject<HTMLDialogElement>;
  setFormDefaultValues: React.Dispatch<React.SetStateAction<Block | undefined>>;
};

type Block = {
  id: number;
  pickupLocation: string;
  scheduledTimeStart: Date;
  scheduledTimeEnd: Date;
  pay: number;
  timeStart: Date;
  timeEnd: Date;
  milageStart: number;
  milageEnd: number;
  city: string;
};

export default function Blocks() {
  const formRef = useRef<HTMLDialogElement>(null);
  const [formDefaultValues, setFormDefaultValues] = useState<Block | undefined>(
    undefined,
  );

  const handleAddBlock = () => {
    setFormDefaultValues(undefined);
    formRef.current?.showModal();
  };

  return (
    <div className="flex gap-8 p-8">
      <div>
        <button
          className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
          onClick={handleAddBlock}
        >
          Add Block
        </button>
      </div>
      <dialog ref={formRef}>
        <BlockForm formRef={formRef} defaultValues={formDefaultValues} />
      </dialog>
      <BlocksFeed
        formRef={formRef}
        setFormDefaultValues={setFormDefaultValues}
      />
    </div>
  );
}

const schema = z.object({
  id: z
    .string()
    .refine((val) => isInt(val))
    .optional(),
  pickupLocation: z.string().min(1, "Pickup location is required"),
  date: z.string().refine((val) => isISO8601(val), "Date is required"),
  scheduledTimeStart: z
    .string()
    .refine((val) => isTime(val), "Scheduled starting time is required"),
  scheduledTimeEnd: z
    .string()
    .refine((val) => isTime(val), "Scheduled ending time is required"),
  pay: z
    .string({
      required_error: "Pay amount is required",
    })
    .refine((val) => isFloat(val), "Pay amount is required"),
  timeStart: z
    .string()
    .refine((val) => isTime(val), "Starting time is required"),
  timeEnd: z.string().refine((val) => isTime(val), "Ending time is required"),
  milageStart: z
    .string()
    .refine((val) => isInt(val), "Starting milage is required"),
  milageEnd: z
    .string()
    .refine((val) => isInt(val), "Ending milage is required"),
  city: z.string().min(1, "City is required"),
});

function BlockForm(props: BlockFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const ctx = api.useContext();

  const onSuccessfulSubmit = () => {
    props.formRef.current?.close();
    void ctx.block.getLatest.invalidate();
  };

  const { mutate: create, isLoading: isCreating } =
    api.block.create.useMutation({
      onSuccess: onSuccessfulSubmit,
    });
  const { mutate: update, isLoading: isEditing } = api.block.update.useMutation(
    {
      onSuccess: onSuccessfulSubmit,
    },
  );

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (props.defaultValues) {
      update({
        id: props.defaultValues.id,
        pickupLocation: data.pickupLocation,
        scheduledTimeStart: new Date(data.date + "T" + data.scheduledTimeStart),
        scheduledTimeEnd: new Date(data.date + "T" + data.scheduledTimeEnd),
        pay: parseFloat(data.pay),
        timeStart: new Date(data.date + "T" + data.timeStart),
        timeEnd: new Date(data.date + "T" + data.timeEnd),
        milageStart: parseInt(data.milageStart),
        milageEnd: parseInt(data.milageEnd),
        city: data.city,
      });
    } else {
      create({
        pickupLocation: data.pickupLocation,
        scheduledTimeStart: new Date(data.date + "T" + data.scheduledTimeStart),
        scheduledTimeEnd: new Date(data.date + "T" + data.scheduledTimeEnd),
        pay: parseFloat(data.pay),
        timeStart: new Date(data.date + "T" + data.timeStart),
        timeEnd: new Date(data.date + "T" + data.timeEnd),
        milageStart: parseInt(data.milageStart),
        milageEnd: parseInt(data.milageEnd),
        city: data.city,
      });
    }
  };

  useEffect(() => {
    if (props.defaultValues) {
      setValue("id", props.defaultValues.id.toString());
      setValue("pickupLocation", props.defaultValues.pickupLocation);
      setValue(
        "date",
        props.defaultValues.scheduledTimeStart.toISOString().split("T")[0],
      );
      setValue(
        "scheduledTimeStart",
        props.defaultValues.scheduledTimeStart
          .toISOString()
          .split("T")[1]
          ?.slice(0, -8),
      );
      setValue(
        "scheduledTimeEnd",
        props.defaultValues.scheduledTimeEnd
          .toISOString()
          .split("T")[1]
          ?.slice(0, -8),
      );
      setValue("pay", props.defaultValues.pay.toString());
      setValue(
        "timeStart",
        props.defaultValues.timeStart.toISOString().split("T")[1]?.slice(0, -8),
      );
      setValue(
        "timeEnd",
        props.defaultValues.timeEnd.toISOString().split("T")[1]?.slice(0, -8),
      );
      setValue("milageStart", props.defaultValues.milageStart.toString());
      setValue("milageEnd", props.defaultValues.milageEnd.toString());
      setValue("city", props.defaultValues.city);
    } else {
      setValue("id", undefined);
      setValue("pickupLocation", "");
      setValue("date", "");
      setValue("scheduledTimeStart", "");
      setValue("scheduledTimeEnd", "");
      setValue("pay", "");
      setValue("timeStart", "");
      setValue("timeEnd", "");
      setValue("milageStart", "");
      setValue("milageEnd", "");
      setValue("city", "");
    }
  }, [props.defaultValues, setValue]);

  useEffect(() => {
    for (const [, value] of Object.entries(errors)) {
      if (value?.message) {
        const errorMessage =
          typeof value.message === "object"
            ? "An error occurred."
            : value.message.toString();
        toast.error(errorMessage);
      }
    }
  }, [errors]);

  return (
    <form
      onSubmit={handleSubmit((d) => onSubmit(d as z.infer<typeof schema>))}
      className="flex flex-col p-8"
    >
      <Toaster position="bottom-center" />
      <div className="flex gap-4 p-4">
        {props.defaultValues && <input type="hidden" {...register("id")} />}
        <label className="font-bold" htmlFor="pickupLocation">
          Pickup Location
        </label>
        <input
          {...register("pickupLocation")}
          className="focus:shadow-outline rounded border px-2 text-gray-700 shadow focus:outline-none"
          id="pickupLocation"
          type="text"
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
          render={({ field: { value, onChange } }) => (
            <CurrencyInput
              id="currency-input"
              name="currency"
              prefix={"$"}
              value={value as string}
              onValueChange={onChange}
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
          Starting Milage
        </label>
        <input
          {...register("milageStart")}
          className="focus:shadow-outline no-spinner rounded border px-2 text-gray-700 shadow focus:outline-none"
          id="milageStart"
          type="number"
        />
      </div>
      <div className="flex gap-4 p-4">
        <label className="font-bold" htmlFor="milageEnd">
          Ending Milage
        </label>
        <input
          {...register("milageEnd")}
          className="focus:shadow-outline no-spinner rounded border px-2 text-gray-700 shadow focus:outline-none"
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
        />
      </div>
      <div className="flex gap-2">
        <button
          className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
          type="submit"
        >
          Submit
        </button>
        <button
          className="focus:shadow-outline rounded bg-slate-500 px-4 py-2 font-bold text-white hover:bg-slate-700 focus:outline-none"
          onClick={() => props.formRef.current?.close()}
          type="button"
        >
          Close
        </button>
      </div>
    </form>
  );
}

function BlocksFeed(props: BlockFeedProps) {
  const { data } = api.block.getLatest.useQuery();
  const ctx = api.useContext();

  const { mutate: remove } = api.block.delete.useMutation({
    onSuccess: () => {
      void ctx.block.getLatest.invalidate();
    },
  });

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

  function calcTotalMilage(milageStart: number, milageEnd: number) {
    return milageEnd - milageStart;
  }

  const handleEditBlock = (block: Block) => {
    props.setFormDefaultValues(block);
    props.formRef.current?.showModal();
  };

  const handleHemoveBlock = (id: number) => {
    remove(id);
  };

  return (
    <div className="flex flex-col gap-4">
      {data.map((block) => (
        <div
          key={block.id}
          className="grid grid-cols-2 gap-3 rounded bg-gray-100 p-4"
        >
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
            <span className="font-bold">Pay:</span>{" "}
            {currencyFormatter.format(block.pay)}
          </div>
          <div>
            <span className="font-bold">City:</span> {block.city}
          </div>
          <div>
            <span className="font-bold">Estimated Hourly Rate:</span>{" "}
            {currencyFormatter.format(
              calcHourlyRate(
                block.scheduledTimeStart,
                block.scheduledTimeEnd,
                block.pay,
              ),
            )}{" "}
            / hour
          </div>
          <div>
            <span className="font-bold">Actual Hourly Rate:</span>{" "}
            {currencyFormatter.format(
              calcHourlyRate(block.timeStart, block.timeEnd, block.pay),
            )}{" "}
            / hour
          </div>
          <div>
            <span className="font-bold">Total Milage:</span>{" "}
            {calcTotalMilage(block.milageStart, block.milageEnd)} miles
          </div>
          <div className="flex gap-4">
            <button
              className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
              onClick={() => handleEditBlock(block)}
            >
              Edit
            </button>
            <button
              className="focus:shadow-outline rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
              onClick={() => handleHemoveBlock(block.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
