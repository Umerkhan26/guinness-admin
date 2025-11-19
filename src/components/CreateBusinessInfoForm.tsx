import React, { useState, useEffect, type FormEvent } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import {
  createBusinessInfo,
  updateBusinessInfo,
  type CreateBusinessInfoRequest,
  type UpdateBusinessInfoRequest,
} from '../api/businessInfoApi';
import { getBusinesses } from '../api/businessApi';
import { FiPlus, FiX } from 'react-icons/fi';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: min(500px, calc(100vw - 4rem));
  max-width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;
  box-sizing: border-box;
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
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
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
  width: 100%;
  box-sizing: border-box;
  min-width: 0;

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
  width: 100%;
  box-sizing: border-box;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const TextArea = styled.textarea`
  background-color: ${({ theme }) => theme.colors.cardAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.65rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.95rem;
  resize: vertical;
  min-height: 80px;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.cardAlt};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem;
  padding-top: 2.5rem;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.dangerBright};
  }
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryBright};
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SubmitButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryBright};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface Business {
  _id: string;
  name: string;
}

interface BusinessInfoInitialValues {
  id?: string;
  business?: string;
  title?: string;
  summaryStats?: Array<{ label: string; value: number }>;
  grandPrize?: {
    title?: string;
    description?: string;
    drawDate?: string;
    entryRule?: string;
  };
  earnPerPurchase?: Array<{
    productName: string;
    size: string;
    points: number;
    entries: number;
    bonusTip: string;
  }>;
  isActive?: boolean;
}

interface CreateBusinessInfoFormProps {
  mode?: 'create' | 'edit';
  initialValues?: BusinessInfoInitialValues;
  onCreated: () => void;
  onClose: () => void;
}

const CreateBusinessInfoForm: React.FC<CreateBusinessInfoFormProps> = ({
  mode = 'create',
  initialValues,
  onCreated,
  onClose,
}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [business, setBusiness] = useState(initialValues?.business || '');
  const [title, setTitle] = useState(initialValues?.title || '');
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [summaryStats, setSummaryStats] = useState<Array<{ label: string; value: number }>>(
    initialValues?.summaryStats && initialValues.summaryStats.length > 0
      ? initialValues.summaryStats
      : [{ label: '', value: 0 }],
  );
  const [grandPrize, setGrandPrize] = useState({
    title: initialValues?.grandPrize?.title || '',
    description: initialValues?.grandPrize?.description || '',
    drawDate: initialValues?.grandPrize?.drawDate || '',
    entryRule: initialValues?.grandPrize?.entryRule || '',
  });
  const [earnPerPurchase, setEarnPerPurchase] = useState<
    Array<{
      productName: string;
      size: string;
      points: number;
      entries: number;
      bonusTip: string;
    }>
  >(
    initialValues?.earnPerPurchase && initialValues.earnPerPurchase.length > 0
      ? initialValues.earnPerPurchase
      : [
          {
            productName: '',
            size: '',
            points: 0,
            entries: 0,
            bonusTip: '',
          },
        ],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await getBusinesses({ page: 1, limit: 100 });
        if (response.success && response.data) {
          setBusinesses(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      }
    };

    fetchBusinesses();
  }, []);

  const addSummaryStat = () => {
    setSummaryStats([...summaryStats, { label: '', value: 0 }]);
  };

  const removeSummaryStat = (index: number) => {
    if (summaryStats.length > 1) {
      setSummaryStats(summaryStats.filter((_, i) => i !== index));
    }
  };

  const updateSummaryStat = (index: number, field: 'label' | 'value', value: string | number) => {
    const updated = [...summaryStats];
    updated[index] = { ...updated[index], [field]: value };
    setSummaryStats(updated);
  };

  const addEarnPerPurchase = () => {
    setEarnPerPurchase([
      ...earnPerPurchase,
      {
        productName: '',
        size: '',
        points: 0,
        entries: 0,
        bonusTip: '',
      },
    ]);
  };

  const removeEarnPerPurchase = (index: number) => {
    if (earnPerPurchase.length > 1) {
      setEarnPerPurchase(earnPerPurchase.filter((_, i) => i !== index));
    }
  };

  const updateEarnPerPurchase = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const updated = [...earnPerPurchase];
    updated[index] = { ...updated[index], [field]: value };
    setEarnPerPurchase(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!business.trim()) {
      toast.error('Please select a business.');
      return;
    }

    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }

    // Validate summary stats
    const validSummaryStats = summaryStats.filter(
      (stat) => stat.label.trim() && stat.value >= 0,
    );
    if (validSummaryStats.length === 0) {
      toast.error('At least one valid summary stat is required.');
      return;
    }

    // Validate grand prize
    if (!grandPrize.title.trim()) {
      toast.error('Grand prize title is required.');
      return;
    }

    // Validate earn per purchase
    const validEarnPerPurchase = earnPerPurchase.filter(
      (item) => item.productName.trim() && item.points >= 0 && item.entries >= 0,
    );
    if (validEarnPerPurchase.length === 0) {
      toast.error('At least one valid earn per purchase item is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      let response;

      if (mode === 'edit') {
        // Validate we have ID
        if (!initialValues || !initialValues.id) {
          toast.error('Cannot update: Business info ID is missing.');
          setIsSubmitting(false);
          return;
        }

        const updatePayload: UpdateBusinessInfoRequest = {
          business: business.trim(),
          title: title.trim(),
          summaryStats: validSummaryStats,
          grandPrize: {
            title: grandPrize.title.trim(),
            description: grandPrize.description.trim(),
            drawDate: grandPrize.drawDate.trim(),
            entryRule: grandPrize.entryRule.trim(),
          },
          earnPerPurchase: validEarnPerPurchase,
          isActive,
        };

        response = await updateBusinessInfo(initialValues.id, updatePayload);
      } else {
        const createPayload: CreateBusinessInfoRequest = {
          business: business.trim(),
          title: title.trim(),
          summaryStats: validSummaryStats,
          grandPrize: {
            title: grandPrize.title.trim(),
            description: grandPrize.description.trim(),
            drawDate: grandPrize.drawDate.trim(),
            entryRule: grandPrize.entryRule.trim(),
          },
          earnPerPurchase: validEarnPerPurchase,
          isActive,
        };

        response = await createBusinessInfo(createPayload);
      }

      if (!response.success) {
        toast.error(response.message);
        setIsSubmitting(false);
        return;
      }

      toast.success(
        response.message ??
          (mode === 'edit' ? 'Business info updated successfully.' : 'Business info created successfully.'),
      );
      setIsSubmitting(false);
      onCreated();
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      toast.error(
        mode === 'edit'
          ? 'Failed to update business info. Please try again.'
          : 'Failed to create business info. Please try again.',
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormTitle>{mode === 'edit' ? 'Edit Business Info' : 'Create Business Info'}</FormTitle>

      <FieldGroup>
        <FieldLabel>Business *</FieldLabel>
        <Select value={business} onChange={(e) => setBusiness(e.target.value)} required>
          <option value="">Select a business</option>
          {businesses.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel>Title *</FieldLabel>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter campaign title"
          required
        />
      </FieldGroup>

      <Section>
        <SectionTitle>Summary Stats</SectionTitle>
        {summaryStats.map((stat, index) => (
          <ItemContainer key={index}>
            <RemoveButton
              type="button"
              onClick={() => removeSummaryStat(index)}
              disabled={summaryStats.length === 1}
              title={summaryStats.length === 1 ? 'At least one item is required' : 'Remove'}
            >
              <FiX />
            </RemoveButton>
            <Row>
              <FieldGroup>
                <FieldLabel>Label</FieldLabel>
                <Input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateSummaryStat(index, 'label', e.target.value)}
                  placeholder="e.g., Round Purchases"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Value</FieldLabel>
                <Input
                  type="number"
                  value={stat.value}
                  onChange={(e) => updateSummaryStat(index, 'value', Number(e.target.value))}
                  placeholder="0"
                  min="0"
                />
              </FieldGroup>
            </Row>
          </ItemContainer>
        ))}
        <AddButton type="button" onClick={addSummaryStat}>
          <FiPlus /> Add Summary Stat
        </AddButton>
      </Section>

      <Section>
        <SectionTitle>Grand Prize</SectionTitle>
        <FieldGroup>
          <FieldLabel>Title *</FieldLabel>
          <Input
            type="text"
            value={grandPrize.title}
            onChange={(e) => setGrandPrize({ ...grandPrize, title: e.target.value })}
            placeholder="Enter grand prize title"
            required
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Description</FieldLabel>
          <TextArea
            value={grandPrize.description}
            onChange={(e) => setGrandPrize({ ...grandPrize, description: e.target.value })}
            placeholder="Enter grand prize description"
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Draw Date</FieldLabel>
          <Input
            type="text"
            value={grandPrize.drawDate}
            onChange={(e) => setGrandPrize({ ...grandPrize, drawDate: e.target.value })}
            placeholder="e.g., January 2026"
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel>Entry Rule</FieldLabel>
          <Input
            type="text"
            value={grandPrize.entryRule}
            onChange={(e) => setGrandPrize({ ...grandPrize, entryRule: e.target.value })}
            placeholder="e.g., Each bottle purchase = 1 entry"
          />
        </FieldGroup>
      </Section>

      <Section>
        <SectionTitle>Earn Per Purchase</SectionTitle>
        {earnPerPurchase.map((item, index) => (
          <ItemContainer key={index}>
            <RemoveButton
              type="button"
              onClick={() => removeEarnPerPurchase(index)}
              disabled={earnPerPurchase.length === 1}
              title={earnPerPurchase.length === 1 ? 'At least one item is required' : 'Remove'}
            >
              <FiX />
            </RemoveButton>
            <FieldGroup>
              <FieldLabel>Product Name *</FieldLabel>
              <Input
                type="text"
                value={item.productName}
                onChange={(e) => updateEarnPerPurchase(index, 'productName', e.target.value)}
                placeholder="e.g., Single Guinness"
              />
            </FieldGroup>
            <FieldGroup>
              <FieldLabel>Size</FieldLabel>
              <Input
                type="text"
                value={item.size}
                onChange={(e) => updateEarnPerPurchase(index, 'size', e.target.value)}
                placeholder="e.g., 1 x 275ml bottle"
              />
            </FieldGroup>
            <Row>
              <FieldGroup>
                <FieldLabel>Points</FieldLabel>
                <Input
                  type="number"
                  value={item.points}
                  onChange={(e) => updateEarnPerPurchase(index, 'points', Number(e.target.value))}
                  placeholder="0"
                  min="0"
                />
              </FieldGroup>
              <FieldGroup>
                <FieldLabel>Entries</FieldLabel>
                <Input
                  type="number"
                  value={item.entries}
                  onChange={(e) => updateEarnPerPurchase(index, 'entries', Number(e.target.value))}
                  placeholder="0"
                  min="0"
                />
              </FieldGroup>
            </Row>
            <FieldGroup>
              <FieldLabel>Bonus Tip</FieldLabel>
              <TextArea
                value={item.bonusTip}
                onChange={(e) => updateEarnPerPurchase(index, 'bonusTip', e.target.value)}
                placeholder="Enter bonus tip"
                rows={2}
              />
            </FieldGroup>
          </ItemContainer>
        ))}
        <AddButton type="button" onClick={addEarnPerPurchase}>
          <FiPlus /> Add Product
        </AddButton>
      </Section>

      <FieldGroup>
        <CheckboxGroup>
          <Checkbox
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            id="isActive"
          />
          <FieldLabel htmlFor="isActive" style={{ textTransform: 'none', cursor: 'pointer' }}>
            Active
          </FieldLabel>
        </CheckboxGroup>
      </FieldGroup>

      <SubmitButton type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? mode === 'edit'
            ? 'Updating...'
            : 'Creating...'
          : mode === 'edit'
            ? 'Update Business Info'
            : 'Create Business Info'}
      </SubmitButton>
    </Form>
  );
};

export default CreateBusinessInfoForm;

