/**
 * Type stub for leanft/expect.
 * LeanFT's expect wraps Jasmine's expect and adds LeanFT-specific matchers.
 * We declare it as compatible with Jasmine's expect so @ts-check
 * resolves toBe / toContain / toBeTruthy / toEqual etc. correctly.
 */
declare module "leanft/expect" {
  const expect: typeof globalThis.expect;
  export = expect;
}
