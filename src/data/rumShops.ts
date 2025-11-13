import { faker } from '@faker-js/faker';

export interface RumShop {
  id: string;
  name: string;
  address: string;
  licenseNumber: string;
  owner: string;
  phone: string;
  rating: number;
}

export const createRandomRumShop = (): RumShop => {
  return {
    id: faker.string.uuid(),
    name: `${faker.person.lastName()}'s Rum Shack`,
    address: faker.location.streetAddress(),
    licenseNumber: `RL-${faker.string.alphanumeric(6).toUpperCase()}`,
    owner: faker.person.fullName(),
    phone: faker.phone.number(),
    rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
  };
};

export const RUM_SHOPS = Array.from({ length: 250 }, createRandomRumShop);
