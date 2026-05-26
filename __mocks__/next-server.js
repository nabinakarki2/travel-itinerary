const NextResponse = {
  redirect: jest.fn().mockImplementation((url) => ({
    status: 307,
    headers: new Map([["Location", url.toString()]]),
  })),
  next: jest.fn().mockReturnValue(undefined),
  json: jest.fn().mockImplementation((body, init) => {
    const status = init?.status ?? 200;
    return {
      status,
      headers: new Map(),
      json: () => Promise.resolve(body),
    };
  }),
};

module.exports = { NextResponse, NextRequest: jest.fn() };
