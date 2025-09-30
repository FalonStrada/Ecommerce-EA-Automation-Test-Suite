export interface TestUser {
  name: string;
  email: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address1: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
}

/**
 * Generates a unique email based on a base email by appending a timestamp.
 * Keep data generation outside of Page Objects (POM best practice).
 */
export function makeUniqueEmail(baseEmail: string): string {
  const [local, domain] = baseEmail.split('@');
  const stamp = Date.now();
  return `${local}_${stamp}@${domain}`;
}

/**
 * Creates a TestUser with sensible defaults, allowing overrides.
 * Example:
 *   const user = makeUser({ email: makeUniqueEmail('tester@example.com') });
 */
export function makeUser(overrides?: Partial<TestUser>): TestUser {
  const defaults: TestUser = {
    name: 'Test User',
    email: 'testuser@example.com',
  };
  return { ...defaults, ...overrides };
}

/**
 * Creates complete signup data by combining base user data with detailed signup information.
 * Example:
 *   const signupData = makeSignupData(TestData.validUser, TestData.signupDetails.user1);
 */
export function makeSignupData(baseUser: any, detailsUser: any): SignupData {
  return {
    name: baseUser.name,
    email: makeUniqueEmail(baseUser.emailAddress),
    password: baseUser.password,
    firstName: detailsUser.firstName,
    lastName: detailsUser.lastName,
    address1: detailsUser.address1,
    country: detailsUser.country,
    state: detailsUser.state,
    city: detailsUser.city,
    zipcode: detailsUser.zipcode,
    mobileNumber: detailsUser.mobileNumber
  };
}
