import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { theme } from '../styles/theme';
import { loginAdmin, type LoginSuccessResponse } from '../api/userApi';

const LoginContainer = styled.div`
  display: flex;
  align-items: flex-start; /* Changed from center */
  justify-content: center;
  min-height: 100vh; /* Changed from height */
  width: 100%;
  background: ${({ theme }) => theme.gradient.header};
  padding-top: 15vh; /* Added padding to push card down */
`;

const LoginCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadow};
  padding: 3rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  color: ${theme.colors.primary};
  font-family: ${theme.font.display};
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Input = styled.input`
  background-color: ${theme.colors.cardAlt};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: ${theme.radii.sm};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primarySoft};
  }
`;

const Button = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.bg};
  border: none;
  padding: 0.85rem;
  border-radius: ${theme.radii.sm};
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: bold;
  margin-top: 1rem;

  &:hover {
    background-color: ${theme.colors.primaryBright};
  }
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
        <Title>Admin Login</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;
