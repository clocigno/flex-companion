import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const schema = z.object({
  pickupLocation: z.string().min(1),
  scheduledTimeStart: z.date(),
  scheduledTimeEnd: z.date(),
  pay: z.number().positive(),
  timeStart: z.date(),
  timeEnd: z.date(),
  milageStart: z.number().positive(),
  milageEnd: z.number().positive(),
  city: z.string().min(1),
});

export const blockRouter = createTRPCRouter({
  create: protectedProcedure.input(schema).mutation(async ({ ctx, input }) => {
    return ctx.db.block.create({
      data: {
        pickupLocation: input.pickupLocation,
        createdBy: { connect: { id: ctx.session.user.id } },
        scheduledTimeStart: input.scheduledTimeStart,
        scheduledTimeEnd: input.scheduledTimeEnd,
        pay: input.pay,
        timeStart: input.timeStart,
        timeEnd: input.timeEnd,
        milageStart: input.milageStart,
        milageEnd: input.milageEnd,
        city: input.city,
      },
    });
  }),

  getLatest: protectedProcedure.query(({ ctx }) => {
    return ctx.db.block.findMany({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),

  update: protectedProcedure
    .input(schema.partial().extend({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.block.update({
        where: { id: input.id },
        data: {
          pickupLocation: input.pickupLocation,
          scheduledTimeStart: input.scheduledTimeStart,
          scheduledTimeEnd: input.scheduledTimeEnd,
          pay: input.pay,
          timeStart: input.timeStart,
          timeEnd: input.timeEnd,
          milageStart: input.milageStart,
          milageEnd: input.milageEnd,
          city: input.city,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.block.delete({ where: { id: input } });
    }),
});
