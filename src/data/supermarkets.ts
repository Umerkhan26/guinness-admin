import { faker } from '@faker-js/faker';

export interface Supermarket {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  chain: string;
  weeklySales: string;
}

export const createRandomSupermarket = (): Supermarket => {
  return {
    id: faker.string.uuid(),
    name: `${faker.company.name()} Supermarket`,
    address: faker.location.streetAddress(),
    manager: faker.person.fullName(),
    phone: faker.phone.number(),
    chain: faker.helpers.arrayElement(['MegaMart', 'ShopWell', 'FreshChoice', 'ValuePlus']),
    weeklySales: faker.finance.amount({ min: 5000, max: 25000, dec: 2, symbol: '$' }),
  };
};

export const SUPERMARKETS = Array.from({ length: 150 }, createRandomSupermarket);
