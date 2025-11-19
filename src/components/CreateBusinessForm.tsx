import React, { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import {
  createBusiness,
  updateBusiness,
  type CreateBusinessRequest,
  type UpdateBusinessRequest,
} from '../api/businessApi';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: min(460px, 100%);
`;

const FormTitle = styled.h2`
  margin: 0;
  font-size: 1.6rem;
  text-align: center;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const FieldLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.subtle};
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const Input = styled.input`
  background-color: ${({ theme }) => theme.colors.cardAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.65rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.95rem;

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
  padding: 0.65rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.95rem;

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
  onCreated: () => void;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialValues?: {
    id?: string;
    name?: string;
    description?: string;
    earnPointsType?: string;
    earnPointsValue?: number;
    method?: string;
    isActive?: boolean;
  };
}


const TextArea = styled.textarea`
  background-color: ${({ theme }) => theme.colors.cardAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.65rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.95rem;
  min-height: 110px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const InlineFields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SwitchRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.85rem;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
`;

const earnOptions = [
  { label: 'Per 4 Packs', value: 'per_4_packs' },
  { label: 'Per Transaction', value: 'per_transaction' },
  { label: 'Per Currency', value: 'per_currency' },
];

const methodOptions = [
  { label: 'Upload Receipt', value: 'upload_receipt' },
  { label: 'Manual Entry', value: 'manual_entry' },
];

const BUSINESS_NAME_OPTIONS = [
  'Supermarket',
  'Rumshop/Small Store',
  'Wholesaler',
  'Bar/Restaurant',
];

const CreateBusinessForm: React.FC<CreateBusinessFormProps> = ({
  onCreated,
  onClose,
  mode = 'create',
  initialValues,
}) => {
  const [name, setName] = useState<string>(initialValues?.name ?? BUSINESS_NAME_OPTIONS[0]);
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [earnType, setEarnType] = useState<string>(
    initialValues?.earnPointsType ?? earnOptions[0].value,
  );
  const [earnValue, setEarnValue] = useState<number>(initialValues?.earnPointsValue ?? 10);
  const [method, setMethod] = useState<string>(initialValues?.method ?? methodOptions[0].value);
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setName(initialValues?.name ?? BUSINESS_NAME_OPTIONS[0]);
    setDescription(initialValues?.description ?? '');
    setEarnType(initialValues?.earnPointsType ?? earnOptions[0].value);
    setEarnValue(initialValues?.earnPointsValue ?? 10);
    setMethod(initialValues?.method ?? methodOptions[0].value);
    setIsActive(initialValues?.isActive ?? true);
  }, [initialValues]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error('Business name is required.');
      return;
    }

    if (earnValue <= 0) {
      toast.error('Earn point value must be greater than zero.');
      return;
    }

    const payloadBase = {
      name: name.trim(),
      description: description.trim() || undefined,
      earnPoints: {
        type: earnType,
        value: earnValue,
      },
      method,
      isActive,
    } satisfies CreateBusinessRequest;

    setIsSubmitting(true);

    let response;
    if (mode === 'edit' && initialValues?.id) {
      const updatePayload: UpdateBusinessRequest = payloadBase;
      response = await updateBusiness(initialValues.id, updatePayload);
    } else {
      response = await createBusiness(payloadBase);
    }

    if (response.success) {
      toast.success(
        response.message ?? (mode === 'edit' ? 'Business updated successfully.' : 'Business created successfully.'),
      );
      onCreated();
      onClose();
    } else {
      toast.error(
        response.message ?? (mode === 'edit' ? 'Failed to update business.' : 'Failed to create business.'),
      );
    }

    setIsSubmitting(false);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FieldGroup>
        <FormTitle>{mode === 'edit' ? 'Edit Business' : 'Add New Business'}</FormTitle>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="business-name">Business Name</FieldLabel>
        <Select
          id="business-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        >
          {BUSINESS_NAME_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="business-description">Description</FieldLabel>
        <TextArea
          id="business-description"
          placeholder="Short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FieldGroup>

      <InlineFields>
        <FieldGroup>
          <FieldLabel htmlFor="earn-type">Earn Points Type</FieldLabel>
          <Select
            id="earn-type"
            value={earnType}
            onChange={(e) => setEarnType(e.target.value)}
          >
            {earnOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="earn-value">Points Value</FieldLabel>
          <Input
            id="earn-value"
            type="number"
            min={1}
            value={earnValue}
            onChange={(e) => setEarnValue(Number(e.target.value))}
            required
          />
        </FieldGroup>
      </InlineFields>

      <InlineFields>
        <FieldGroup>
          <FieldLabel htmlFor="method">Reward Method</FieldLabel>
          <Select id="method" value={method} onChange={(e) => setMethod(e.target.value)}>
            {methodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Status</FieldLabel>
          <SwitchRow>
            <Checkbox
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </SwitchRow>
        </FieldGroup>
      </InlineFields>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? mode === 'edit'
            ? 'Saving...'
            : 'Creating...'
          : mode === 'edit'
            ? 'Save Changes'
            : 'Create Business'}
      </Button>
    </Form>
  );
};

export default CreateBusinessForm;
