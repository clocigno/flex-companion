import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const blockRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        pickupLocation: z.string().min(1),
        sceduledTimeStart: z.date(),
        sceduledTimeEnd: z.date(),
        pay: z.number().positive(),
        timeStart: z.date(),
        timeEnd: z.date(),
        milageStart: z.number().positive(),
        milageEnd: z.number().positive(),
        city: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.block.create({
        data: {
          pickupLocation: input.pickupLocation,
          createdBy: { connect: { id: ctx.session.user.id } },
          sceduledTimeStart: input.sceduledTimeStart,
          sceduledTimeEnd: input.sceduledTimeEnd,
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
});
