import { faker } from '@faker-js/faker';

export type BusinessType = 'Wholesaler' | 'Rum Shop' | 'Supermarket' | 'Bar';

export interface Business {
  id: string;
  name: string;
  owner: string;
  location: string;
  phone: string;
  email: string;
  established: string;
  type: BusinessType;
}

export const createRandomBusiness = (): Business => {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    owner: faker.person.fullName(),
    location: faker.location.city() + ', ' + faker.location.country(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    established: faker.date.past({ years: 20 }).toLocaleDateString(),
    type: faker.helpers.arrayElement(['Wholesaler', 'Rum Shop', 'Supermarket', 'Bar']),
  };
};

export const BUSINESSES = Array.from({ length: 200 }, createRandomBusiness);
