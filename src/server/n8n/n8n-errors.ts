export class N8nConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "N8nConfigError";
  }
}

export class N8nRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "N8nRequestError";
  }
}
