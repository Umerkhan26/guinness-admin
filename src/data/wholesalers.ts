import { faker } from '@faker-js/faker';

export interface Wholesaler {
  id: string;
  name: string;
  contactPerson: string;
  region: string;
  phone: string;
  email: string;
  address: string;
}

export const createRandomWholesaler = (): Wholesaler => {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    contactPerson: faker.person.fullName(),
    region: faker.location.state(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    address: faker.location.streetAddress(),
  };
};

export const WHOLESALERS = Array.from({ length: 120 }, createRandomWholesaler);
