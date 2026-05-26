const NextResponse = {
  redirect: jest.fn().mockImplementation((url: string) => ({
    status: 307,
    headers: new Map([["Location", url.toString()]]),
  })),
  next: jest.fn().mockReturnValue({ status: undefined }),
  json: jest.fn().mockImplementation((body: unknown, init?: ResponseInit) => {
    const response = new Response(JSON.stringify(body), init);
    response.json = async () => body;
    return response;
  }),
};

const NextRequest = jest.fn().mockImplementation((url: string) => ({
  url,
  nextUrl: new URL(url),
  cookies: {
    get: jest.fn().mockReturnValue(null),
  },
}));

module.exports = { NextResponse, NextRequest };
