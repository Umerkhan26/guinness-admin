import { faker } from '@faker-js/faker';

export interface Item {
  id: string;
  name: string;
  sku: string;
  price: string;
  inStock: number;
  category: string;
  supplier: string;
}

export const createRandomItem = (): Item => {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    sku: faker.string.alphanumeric(8).toUpperCase(),
    price: faker.commerce.price({ min: 10, max: 200, dec: 2, symbol: '$' }),
    inStock: faker.number.int({ min: 0, max: 100 }),
    category: faker.commerce.department(),
    supplier: faker.company.name(),
  };
};

export const ITEMS = Array.from({ length: 500 }, createRandomItem);
