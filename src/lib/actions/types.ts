export type FieldErrors = Record<string, string[] | undefined>;

export type ActionState<T = undefined> =
  { ok: true; data: T } | { ok: false; error: string; fieldErrors?: FieldErrors };

export const idle: ActionState<never> = { ok: false, error: "" };

export const fail = (error: string, fieldErrors?: FieldErrors): ActionState<never> => ({
  ok: false,
  error,
  fieldErrors,
});

export const succeed = <T>(data: T): ActionState<T> => ({ ok: true, data });
