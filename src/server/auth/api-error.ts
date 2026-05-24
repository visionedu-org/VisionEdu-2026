export function jsonError(
  status: number,
  code: string,
  message: string,
  details?: unknown
): Response {
  return Response.json(
    {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    { status }
  );
}
