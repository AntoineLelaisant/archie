import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
