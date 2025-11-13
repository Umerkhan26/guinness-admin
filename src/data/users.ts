import { faker } from '@faker-js/faker';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string;
    createdAt: string;
    company: string;
    status: 'active' | 'blocked';
  }

  
  export const createRandomUser = (): User => {
    return {
      id: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      jobTitle: faker.person.jobTitle(),
      createdAt: faker.date.past().toLocaleDateString(),
      company: faker.company.name(),
      status: faker.helpers.arrayElement(['active', 'blocked']),
    };
  };
  
  export const USERS: User[] = Array.from({ length: 1000 }, createRandomUser);
