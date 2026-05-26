if (typeof globalThis.Request === "undefined") {
  (globalThis as any).Request = class Request {
    url: string;
    method: string;
    body: string | null;
    headers: Headers;
    constructor(input: string | URL, init?: RequestInit) {
      this.url = typeof input === "string" ? input : input.toString();
      this.method = (init?.method ?? "GET").toUpperCase();
      this.body = (init?.body as string) ?? null;
      this.headers = new Headers(init?.headers);
    }
    async json() {
      return this.body ? JSON.parse(this.body) : {};
    }
  };
}
if (typeof globalThis.Response === "undefined") {
  (globalThis as any).Response = class Response {
    status: number;
    statusText: string;
    headers: Headers;
    private _body: string | null;
    constructor(body?: string | null, init?: ResponseInit) {
      this.status = init?.status ?? 200;
      this.statusText = init?.statusText ?? "";
      this.headers = new Headers(init?.headers);
      this._body = body ?? null;
    }
    async json() {
      return this._body ? JSON.parse(this._body) : {};
    }
  };
}
