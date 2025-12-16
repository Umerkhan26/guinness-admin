import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { theme } from '../styles/theme';
import { loginAdmin, type LoginSuccessResponse } from '../api/userApi';

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  background: ${({ theme }) => theme.gradient.header};
  position: relative;
  overflow: hidden;

  /* Subtle animated background pattern */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 50%);
    animation: pulse 8s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }
`;

const LoginCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 
    ${({ theme }) => theme.shadow},
    0 0 40px rgba(245, 158, 11, 0.1);
  padding: 3.5rem 3rem;
  border-radius: ${({ theme }) => theme.radii.xl};
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      ${({ theme }) => theme.shadow},
      0 0 50px rgba(245, 158, 11, 0.15);
  }

  @media (max-width: 480px) {
    padding: 2.5rem 2rem;
    margin: 1rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2.5rem;
`;

const LogoText = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: ${theme.colors.primary};
  font-family: ${theme.font.display};
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
`;

const Subtitle = styled.p`
  color: ${theme.colors.subtle};
  font-size: 0.95rem;
  margin: 0;
  text-align: center;
  letter-spacing: 0.5px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    ${theme.colors.border},
    transparent
  );
  margin: 2rem 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1.25rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: ${theme.colors.muted};
  font-size: 1.1rem;
  z-index: 1;
  transition: color 0.2s ease;
`;

const Input = styled.input`
  background-color: ${theme.colors.cardAlt};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
  padding: 0.95rem 1rem 0.95rem 3rem;
  border-radius: ${theme.radii.sm};
  font-size: 1rem;
  width: 100%;
  transition: all 0.2s ease;

  &::placeholder {
    color: ${theme.colors.muted};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primarySoft};
    background-color: ${theme.colors.card};

    + ${InputIcon} {
      color: ${theme.colors.primary};
    }
  }

  &:hover {
    border-color: ${theme.colors.primary}66;
  }
`;

const Button = styled.button<{ $isLoading?: boolean }>`
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryBright});
  color: ${theme.colors.bg};
  border: none;
  padding: 1rem;
  border-radius: ${theme.radii.sm};
  font-size: 1rem;
  font-weight: 600;
  cursor: ${({ $isLoading }) => ($isLoading ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
    background: linear-gradient(135deg, ${theme.colors.primaryBright}, ${theme.colors.primary});

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const FooterText = styled.p`
  text-align: center;
  color: ${theme.colors.muted};
  font-size: 0.85rem;
  margin-top: 2rem;
  margin-bottom: 0;
`;

interface LoginPageProps {
  onLogin: (response: LoginSuccessResponse) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password.');
      return;
    }

    setIsLoading(true);

    const response = await loginAdmin({ email, password });

    if (response.success) {
      toast.success(response.message ?? 'Login successful.');
      onLogin(response);
    } else {
      toast.error(response.message ?? 'Login failed.');
    }

    setIsLoading(false);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <LogoContainer>
          <LogoText>GUINNESS</LogoText>
          <Subtitle>Admin Panel</Subtitle>
        </LogoContainer>
        <Divider />
        <Form onSubmit={handleSubmit}>
          <InputWrapper>
            <InputIcon>
              <FiMail />
            </InputIcon>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
          </InputWrapper>
          <InputWrapper>
            <InputIcon>
              <FiLock />
            </InputIcon>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </InputWrapper>
          <Button type="submit" disabled={isLoading} $isLoading={isLoading}>
            <FiLogIn />
            {isLoading ? 'Logging in...' : 'Sign In'}
          </Button>
        </Form>
        <FooterText>Secure Admin Access</FooterText>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
