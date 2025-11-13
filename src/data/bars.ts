import { faker } from '@faker-js/faker';

export interface Bar {
  id: string;
  name: string;
  address: string;
  owner: string;
  phone: string;
  specialty: string;
  capacity: number;
}

export const createRandomBar = (): Bar => {
  return {
    id: faker.string.uuid(),
    name: `${faker.company.name()} Bar & Grill`,
    address: faker.location.streetAddress(),
    owner: faker.person.fullName(),
    phone: faker.phone.number(),
    specialty: faker.helpers.arrayElement(['Cocktails', 'Craft Beer', 'Wine', 'Live Music']),
    capacity: faker.number.int({ min: 20, max: 150 }),
  };
};

export const BARS = Array.from({ length: 180 }, createRandomBar);
