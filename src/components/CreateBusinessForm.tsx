import React, { useState } from 'react';
import styled from 'styled-components';
import type { Business, BusinessType } from '../data/businesses';
import { faker } from '@faker-js/faker';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormTitle = styled.h2`
  margin-bottom: 1rem;
`;

const Input = styled.input`
  background-color: ${({ theme }) => theme.colors.cardAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const Select = styled.select`
  background-color: ${({ theme }) => theme.colors.cardAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  padding: 0.85rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: bold;
  margin-top: 1rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryBright};
  }
`;

interface CreateBusinessFormProps {
  onAddBusiness: (business: Business) => void;
  onClose: () => void;
}

const CreateBusinessForm: React.FC<CreateBusinessFormProps> = ({ onAddBusiness, onClose }) => {
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<BusinessType>('Supermarket');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBusiness: Business = {
      id: faker.string.uuid(),
      name,
      owner,
      location,
      type,
      phone: faker.phone.number(),
      email: faker.internet.email(),
      established: new Date().toLocaleDateString(),
    };
    onAddBusiness(newBusiness);
    onClose();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormTitle>Create New Business</FormTitle>
      <Select value={type} onChange={(e) => setType(e.target.value as BusinessType)}>
        <option value="Supermarket">Supermarket</option>
        <option value="Bar">Bar</option>
        <option value="Wholesaler">Wholesaler</option>
        <option value="Rum Shop">Rum Shop</option>
      </Select>
      <Input placeholder="Business Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input placeholder="Owner Name" value={owner} onChange={(e) => setOwner(e.target.value)} required />
      <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
      
      {/* TODO: Add more fields based on type */}

      <Button type="submit">Create Business</Button>
    </Form>
  );
};

export default CreateBusinessForm;
