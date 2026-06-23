import { getToken, setToken } from "./client";

describe("token storage", () => {
  beforeEach(() => localStorage.clear());

  test("stores and retrieves a token", () => {
    setToken("abc123");
    expect(getToken()).toBe("abc123");
  });

  test("clears the token when set to a falsy value", () => {
    setToken("abc123");
    setToken(null);
    expect(getToken()).toBeNull();
  });

  test("returns null when no token is set", () => {
    expect(getToken()).toBeNull();
  });
});
