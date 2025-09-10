import { z } from 'zod';
import { Status, type CreateTodoTaskDto, type UpdateTodoTaskDto } from '../types/todoTask';

const MESSAGES = {
  required: (p: string) => `${p} is required`,
  maxLen: (p: string, n: number) => `${p} must have a maximum length of ${n} characters`,
  duePast: 'DueDate cannot be in the past (UTC)',
};

const TitleSchema = z
  .string()
  .trim()
  .min(1, MESSAGES.required('Title'))
  .max(200, MESSAGES.maxLen('Title', 200));

const DescriptionSchema = z.preprocess(
  (v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    if (typeof v === 'string') {
      const t = v.trim();
      return t.length ? t : undefined;
    }
    return v;
  },
  z.string().max(4000, MESSAGES.maxLen('Description', 4000)).nullable().optional()
);

const WireDueDateSchema = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : v),
  z
    .string()
    .refine((s) => !Number.isNaN(new Date(s).getTime()), { message: 'Invalid date' })
    .refine((s) => new Date(s).getTime() >= Date.now(), { message: MESSAGES.duePast })
    .nullable()
    .optional()
);

export const CreateTodoTaskClientSchema = z
  .object({
    title: TitleSchema,
    description: DescriptionSchema,
    dueDate: WireDueDateSchema,
  })
  .strict();

export type CreateTodoTaskClient = z.infer<typeof CreateTodoTaskClientSchema> & Pick<CreateTodoTaskDto, 'title' | 'description' | 'dueDate'>;

export const UpdateTodoTaskClientSchema = z
  .object({
    id: z.number(),
    title: TitleSchema,
    description: DescriptionSchema,
    dueDate: WireDueDateSchema,
    status: z.nativeEnum(Status),
    createdAt: z.string(),
    completedAt: z.string().nullable().optional(),
  })
  .strict();

export type UpdateTodoTaskClient = z.infer<typeof UpdateTodoTaskClientSchema> & UpdateTodoTaskDto;

export function getFieldErrors(err: z.ZodError) {
  const map: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path?.toString() ?? 'form';
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}
