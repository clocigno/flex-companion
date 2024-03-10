import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import type { UseFormRegister, Control, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CurrencyInput from "react-currency-input-field";
import { api } from "~/utils/api";
import { useRef, useState, useEffect } from "react";
import { isInt, isISO8601, isTime, isFloat } from "validator";
import { Toaster, toast } from "react-hot-toast";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "~/server/api/root";
import { FaRegTrashCan } from "react-icons/fa6";
import { IconContext } from "react-icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback } from "react";

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

type InputFieldProps = {
  label: string;
  id: keyof FieldValues;
  type?: string;
  register: UseFormRegister<FieldValues>;
  control?: Control<FieldValues>;
  isCurrency?: boolean;
};

type DataCellProps = {
  label: string;
  value: string | number;
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

  const { data: sessionData } = useSession();
  const router = useRouter();

  const handleRedirect = useCallback(() => {
    if (!sessionData) {
      void router.replace("/");
    }
  }, [sessionData, router]);

  useEffect(() => {
    void handleRedirect();
  }, [handleRedirect]);

  if (!sessionData) {
    return null;
  }

  return (
    <div className="min-h-svh bg-slate-100">
      <div className="mt-24 flex justify-center gap-8 p-8">
        <div>
          <button
            className="focus:shadow-outline sticky top-32 rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 focus:outline-none"
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
    </div>
  );
}

function BlockForm(props: BlockFormProps) {
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

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const ctx = api.useUtils();

  const onSuccessfulSubmit = () => {
    props.formRef.current?.close();
    reset();
    void ctx.block.getLatest.invalidate();
  };

  const onFailedSubmit = (e: TRPCClientErrorLike<AppRouter>) => {
    const errorMessage = e.data?.zodError?.fieldErrors.content;
    if (errorMessage?.[0]) {
      toast.error(errorMessage[0]);
    } else {
      toast.error("Failed to post! Please try again later.");
    }
  };

  const { mutate: create, isLoading: isCreating } =
    api.block.create.useMutation({
      onSuccess: onSuccessfulSubmit,
      onError: onFailedSubmit,
    });

  const { mutate: update, isLoading: isEditing } = api.block.update.useMutation(
    {
      onSuccess: onSuccessfulSubmit,
      onError: onFailedSubmit,
    },
  );

  const onSubmit = (data: z.infer<typeof schema>) => {
    const submissionObject = {
      pickupLocation: data.pickupLocation,
      scheduledTimeStart: new Date(data.date + "T" + data.scheduledTimeStart),
      scheduledTimeEnd: new Date(data.date + "T" + data.scheduledTimeEnd),
      pay: parseFloat(data.pay),
      timeStart: new Date(data.date + "T" + data.timeStart),
      timeEnd: new Date(data.date + "T" + data.timeEnd),
      milageStart: parseInt(data.milageStart),
      milageEnd: parseInt(data.milageEnd),
      city: data.city,
    };
    if (props.defaultValues) {
      update({
        id: props.defaultValues.id,
        ...submissionObject,
      });
    } else {
      create(submissionObject);
    }
  };

  const onClose = () => {
    toast.dismiss();
    props.formRef.current?.close();
  };

  useEffect(() => {
    const setValues = (defaultValues: Block | undefined) => {
      const fields = [
        {
          key: "id",
          value: defaultValues ? defaultValues.id.toString() : undefined,
        },
        {
          key: "pickupLocation",
          value: defaultValues ? defaultValues.pickupLocation : "",
        },
        {
          key: "date",
          value: defaultValues
            ? new Date(
                defaultValues.scheduledTimeStart.getTime() -
                  defaultValues.scheduledTimeStart.getTimezoneOffset() *
                    60 *
                    1000,
              )
                .toISOString()
                .split("T")[0]
            : "",
        },
        {
          key: "scheduledTimeStart",
          value: defaultValues
            ? defaultValues.scheduledTimeStart
                .toTimeString()
                .split(" ")[0]
                ?.slice(0, -3)
            : "",
        },
        {
          key: "scheduledTimeEnd",
          value: defaultValues
            ? defaultValues.scheduledTimeEnd
                .toTimeString()
                .split(" ")[0]
                ?.slice(0, -3)
            : "",
        },
        {
          key: "pay",
          value: defaultValues ? defaultValues.pay.toString() : "",
        },
        {
          key: "timeStart",
          value: defaultValues
            ? defaultValues.timeStart.toTimeString().split(" ")[0]?.slice(0, -3)
            : "",
        },
        {
          key: "timeEnd",
          value: defaultValues
            ? defaultValues.timeEnd.toTimeString().split(" ")[0]?.slice(0, -3)
            : "",
        },
        {
          key: "milageStart",
          value: defaultValues ? defaultValues.milageStart.toString() : "",
        },
        {
          key: "milageEnd",
          value: defaultValues ? defaultValues.milageEnd.toString() : "",
        },
        { key: "city", value: defaultValues ? defaultValues.city : "" },
      ];

      fields.forEach(({ key, value }) => setValue(key, value));
    };

    if (props.defaultValues) {
      setValues(props.defaultValues);
    } else {
      setValues(undefined);
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
      {props.defaultValues && <input type="hidden" {...register("id")} />}
      <InputField
        label="Pickup Location"
        id="pickupLocation"
        type="text"
        register={register}
      />
      <InputField label="Date" id="date" type="date" register={register} />
      <InputField
        label="Scheduled Time Start"
        id="scheduledTimeStart"
        type="time"
        register={register}
      />
      <InputField
        label="Scheduled Time End"
        id="scheduledTimeEnd"
        type="time"
        register={register}
      />
      <InputField
        label="Pay"
        id="pay"
        isCurrency
        control={control}
        register={register}
      />
      <InputField
        label="Time Start"
        id="timeStart"
        type="time"
        register={register}
      />
      <InputField
        label="Time End"
        id="timeEnd"
        type="time"
        register={register}
      />
      <InputField
        label="Starting Milage"
        id="milageStart"
        type="number"
        register={register}
      />
      <InputField
        label="Ending Milage"
        id="milageEnd"
        type="number"
        register={register}
      />
      <InputField label="City" id="city" type="text" register={register} />
      <div className="flex gap-2">
        <button
          className="focus:shadow-outline sticky top-8 rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 focus:outline-none"
          type="submit"
          disabled={isCreating || isEditing}
        >
          Submit
        </button>
        <button
          className="focus:shadow-outline rounded bg-slate-500 px-4 py-2 font-bold text-white hover:bg-slate-700 focus:outline-none"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>
    </form>
  );
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  type,
  register,
  control,
  isCurrency,
}) => {
  return (
    <div className="flex gap-4 p-4">
      <label className="font-bold" htmlFor={id}>
        {label}
      </label>
      {isCurrency ? (
        <Controller
          name={id}
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
      ) : (
        <input
          {...register(id)}
          className={`focus:shadow-outline ${type === "number" ? "no-spinner" : ""} rounded border px-2 text-gray-700 shadow focus:outline-none`}
          id={id}
          type={type}
        />
      )}
    </div>
  );
};

function BlocksFeed(props: BlockFeedProps) {
  const { data } = api.block.getLatest.useQuery();
  const ctx = api.useUtils();

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

  const handleRemoveBlock = (id: number) => {
    remove(id);
  };

  if (data.length === 0) {
    return (
      <div className="min-h-svh ">
        <div className="sticky top-32 text-3xl text-orange-500">
          &larr; Start by adding a block here
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((block) => (
        <div
          key={block.id}
          className="grid grid-cols-2 gap-3 rounded bg-white p-4 shadow-lg"
        >
          <DataCell label="Pickup Location" value={block.pickupLocation} />
          <DataCell
            label="Date"
            value={dateFormatter.format(block.scheduledTimeStart)}
          />
          <DataCell
            label="Scheduled Time Start"
            value={timeFormatter.format(block.scheduledTimeStart)}
          />
          <DataCell
            label="Scheduled Time End"
            value={timeFormatter.format(block.scheduledTimeEnd)}
          />
          <DataCell
            label="Time Start"
            value={timeFormatter.format(block.timeStart)}
          />
          <DataCell
            label="Time End"
            value={timeFormatter.format(block.timeEnd)}
          />
          <DataCell label="Milage Start" value={block.milageStart} />
          <DataCell label="Milage End" value={block.milageEnd} />
          <DataCell label="Pay" value={currencyFormatter.format(block.pay)} />
          <DataCell label="City" value={block.city} />
          <DataCell
            label="Estimated Hourly Rate"
            value={`${currencyFormatter.format(calcHourlyRate(block.scheduledTimeStart, block.scheduledTimeEnd, block.pay))} / hour`}
          />
          <DataCell
            label="Actual Hourly Rate"
            value={`${currencyFormatter.format(calcHourlyRate(block.timeStart, block.timeEnd, block.pay))} / hour`}
          />
          <DataCell
            label="Total Milage"
            value={`${calcTotalMilage(block.milageStart, block.milageEnd)} miles`}
          />
          <div className="flex gap-6">
            <button
              className="focus:shadow-outline sticky top-8 rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 focus:outline-none"
              onClick={() => handleEditBlock(block)}
            >
              Edit
            </button>
            <button onClick={() => handleRemoveBlock(block.id)}>
              <IconContext.Provider
                value={{
                  className: "size-full text-orange-500 hover:text-orange-600",
                }}
              >
                <FaRegTrashCan />
              </IconContext.Provider>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const DataCell: React.FC<DataCellProps> = ({ label, value }) => (
  <div>
    <span className="font-bold">{label}:</span> {value}
  </div>
);
