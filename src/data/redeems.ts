import { faker } from '@faker-js/faker';

export interface Redeem {
  id: string;
  user: string;
  item: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  transactionId: string;
  points: number;
}

export const createRandomRedeem = (): Redeem => {
  return {
    id: faker.string.uuid(),
    user: faker.person.fullName(),
    item: faker.commerce.productName(),
    date: faker.date.recent().toLocaleDateString(),
    status: faker.helpers.arrayElement(['Completed', 'Pending', 'Cancelled']),
    transactionId: faker.string.alphanumeric(10).toUpperCase(),
    points: faker.number.int({ min: 50, max: 500 }),
  };
};

export const REDEEMS = Array.from({ length: 350 }, createRandomRedeem);
