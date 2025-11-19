import React, { useState, useEffect, type FormEvent } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { createReward, updateReward, type CreateRewardRequest, type UpdateRewardRequest } from '../api/rewardsApi';
import { getBusinesses } from '../api/businessApi';

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

const FileInput = styled.input`
  background-color: ${({ theme }) => theme.colors.cardAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.65rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.95rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }

  &::file-selector-button {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.bg};
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: ${({ theme }) => theme.radii.sm};
    margin-right: 0.75rem;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.85rem;

    &:hover {
      background-color: ${({ theme }) => theme.colors.primaryBright};
    }
  }
`;

const FilePreview = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.colors.cardAlt};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.subtle};
`;

const ImagePreview = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.sm};
  margin-top: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface CreateRewardFormProps {
  onCreated: () => void;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialValues?: {
    id?: string;
    rewardName?: string;
    business?: string;
    pointsRequired?: number;
    rewardType?: string;
    image?: string;
    isActive?: boolean;
  };
}

interface BusinessOption {
  id: string;
  name: string;
}

const CreateRewardForm: React.FC<CreateRewardFormProps> = ({
  onCreated,
  onClose,
  mode = 'create',
  initialValues,
}) => {
  const [rewardName, setRewardName] = useState(initialValues?.rewardName ?? '');
  const [business, setBusiness] = useState(initialValues?.business ?? '');
  const [pointsRequired, setPointsRequired] = useState<number>(initialValues?.pointsRequired ?? 0);
  const [rewardType, setRewardType] = useState(initialValues?.rewardType ?? '');
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState<string | undefined>(initialValues?.image);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setIsLoadingBusinesses(true);
      const response = await getBusinesses({
        page: 1,
        limit: 100, // Get all businesses
      });

      if (response.success) {
        const businessOptions: BusinessOption[] = response.data.map((b) => ({
          id: b._id,
          name: b.name,
        }));
        setBusinesses(businessOptions);
      } else {
        toast.error(response.message ?? 'Failed to load businesses.');
      }
      setIsLoadingBusinesses(false);
    };

    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (initialValues) {
      setRewardName(initialValues.rewardName ?? '');
      setBusiness(initialValues.business ?? '');
      setPointsRequired(initialValues.pointsRequired ?? 0);
      setRewardType(initialValues.rewardType ?? '');
      setExistingImageUrl(initialValues.image);
    }
  }, [initialValues]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setExistingImageUrl(undefined); // Clear existing image preview when new file is selected
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!rewardName.trim()) {
      toast.error('Reward name is required.');
      return;
    }

    if (!business.trim()) {
      toast.error('Business is required.');
      return;
    }

    if (pointsRequired <= 0 || !Number.isInteger(pointsRequired)) {
      toast.error('Points required must be a positive integer.');
      return;
    }

    if (!rewardType.trim()) {
      toast.error('Reward type is required.');
      return;
    }

    // Image is required only in create mode
    if (mode === 'create' && !image) {
      toast.error('Image is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      let response: any;
      
      // CRITICAL: Check mode explicitly - this determines which API to call
      if (mode === 'edit') {
        // EDIT MODE - Call update API
        if (!initialValues || !initialValues.id) {
          toast.error('Cannot update: Reward ID is missing.');
          setIsSubmitting(false);
          return;
        }

        const updatePayload: UpdateRewardRequest = {
          rewardName: rewardName.trim(),
          business: business.trim(),
          pointsRequired: Number(pointsRequired),
          rewardType: rewardType.trim(),
          isActive: initialValues.isActive,
        };
        
        if (image) {
          updatePayload.image = image;
        }
        
        // Call updateReward - this makes PUT request to /updateReward/:rewardId
        response = await updateReward(initialValues.id, updatePayload);
      } else {
        // CREATE MODE - Call create API
        if (!image) {
          toast.error('Image is required for creating a reward.');
          setIsSubmitting(false);
          return;
        }
        
        const createPayload: CreateRewardRequest = {
          rewardName: rewardName.trim(),
          business: business.trim(),
          pointsRequired: Number(pointsRequired),
          rewardType: rewardType.trim(),
          image: image,
        };
        
        response = await createReward(createPayload);
      }

      if (response.success) {
        toast.success(
          response.message ?? (mode === 'edit' ? 'Reward updated successfully.' : 'Reward created successfully.')
        );
        // Reset form first
        setRewardName('');
        setBusiness('');
        setPointsRequired(0);
        setRewardType('');
        setImage(null);
        setExistingImageUrl(undefined);
        setIsSubmitting(false);
        // Close modal
        onClose();
        // Trigger refresh after closing to ensure UI updates
        onCreated();
      } else {
        toast.error(
          response.message ?? (mode === 'edit' ? 'Failed to update reward.' : 'Failed to create reward.')
        );
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error(mode === 'edit' ? 'Failed to update reward. Please try again.' : 'Failed to create reward. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FieldGroup>
        <FormTitle>{mode === 'edit' ? 'Edit Reward' : 'Add New Reward'}</FormTitle>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="reward-name">Reward Name</FieldLabel>
        <Input
          id="reward-name"
          type="text"
          value={rewardName}
          onChange={(e) => setRewardName(e.target.value)}
          placeholder="Enter reward name"
          required
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="business">Business</FieldLabel>
        <Select
          id="business"
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          disabled={isLoadingBusinesses}
          required
        >
          {isLoadingBusinesses ? (
            <option value="">Loading businesses...</option>
          ) : businesses.length === 0 ? (
            <option value="">No businesses available</option>
          ) : (
            <>
              <option value="">Select a business</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </>
          )}
        </Select>
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="points-required">Points Required</FieldLabel>
        <Input
          id="points-required"
          type="number"
          min={1}
          value={pointsRequired || ''}
          onChange={(e) => setPointsRequired(Number(e.target.value))}
          placeholder="e.g., 120"
          required
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="reward-type">Reward Type</FieldLabel>
        <Input
          id="reward-type"
          type="text"
          value={rewardType}
          onChange={(e) => setRewardType(e.target.value)}
          placeholder="Enter reward type"
          required
        />
      </FieldGroup>

      <FieldGroup>
        <FieldLabel htmlFor="image">Image {mode === 'edit' && '(Optional)'}</FieldLabel>
        {mode === 'edit' && existingImageUrl && !image && (
          <div>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'inherit' }}>
              Current image:
            </div>
            <ImagePreview src={existingImageUrl} alt="Current reward image" />
          </div>
        )}
        <FileInput
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required={mode === 'create'}
        />
        {image && (
          <FilePreview>
            Selected: {image.name} ({(image.size / 1024).toFixed(2)} KB)
          </FilePreview>
        )}
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? mode === 'edit'
            ? 'Saving...'
            : 'Creating...'
          : mode === 'edit'
            ? 'Save Changes'
            : 'Create Reward'}
      </Button>
    </Form>
  );
};

export default CreateRewardForm;

