import React, { useState } from 'react';
import { TextInput, TextInputProps, View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  isPassword?: boolean;
  variant?: 'default' | 'filled';
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  variant = 'default',
  fullWidth = true,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

  const handleFocus = () => {
    setIsFocused(true);
    if (rest.onFocus) {
      rest.onFocus({} as any);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (rest.onBlur) {
      rest.onBlur({} as any);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Gestisce l'icona a destra (può essere un'icona personalizzata o l'icona per mostrare/nascondere la password)
  const renderRightIcon = () => {
    if (isPassword) {
      return (
        <IconContainer onPress={togglePasswordVisibility}>
          <Ionicons
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={error ? 'error' : isFocused ? 'primary' : 'textSecondary'}
          />
        </IconContainer>
      );
    }

    if (rightIcon) {
      return (
        <IconContainer onPress={onRightIconPress}>
          <Ionicons
            name={rightIcon as any}
            size={20}
            color={error ? 'error' : isFocused ? 'primary' : 'textSecondary'}
          />
        </IconContainer>
      );
    }

    return null;
  };

  return (
    <Container fullWidth={fullWidth}>
      {label && <Label error={!!error}>{label}</Label>}
      <InputContainer
        variant={variant}
        isFocused={isFocused}
        hasError={!!error}
      >
        {leftIcon && (
          <LeftIconContainer>
            <Ionicons
              name={leftIcon as any}
              size={20}
              color={error ? 'error' : isFocused ? 'primary' : 'textSecondary'}
            />
          </LeftIconContainer>
        )}
        
        <StyledInput
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !isPasswordVisible}
          placeholderTextColor="textSecondary"
          hasLeftIcon={!!leftIcon}
          hasRightIcon={!!rightIcon || isPassword}
          {...rest}
        />
        
        {renderRightIcon()}
      </InputContainer>
      
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
}

const Container = styled.View<{ fullWidth: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const Label = styled.Text<{ error: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  color: ${({ theme, error }) =>
    error ? theme.colors.error : theme.colors.text};
`;

interface InputContainerProps {
  isFocused: boolean;
  hasError: boolean;
  variant: 'default' | 'filled';
}

const InputContainer = styled.View<InputContainerProps>`
  flex-direction: row;
  align-items: center;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  overflow: hidden;
  
  ${({ variant, theme }) =>
    variant === 'filled'
      ? `background-color: ${theme.colors.background};`
      : `
        background-color: transparent;
        border-width: 1px;
      `}
  
  ${({ isFocused, hasError, theme }) => {
    if (hasError) {
      return `border-color: ${theme.colors.error};`;
    }
    
    return isFocused
      ? `border-color: ${theme.colors.primary};`
      : `border-color: ${theme.colors.border};`;
  }}
  
  min-height: 48px;
`;

const LeftIconContainer = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
`;

const IconContainer = styled.TouchableOpacity`
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
`;

interface StyledInputProps {
  hasLeftIcon: boolean;
  hasRightIcon: boolean;
}

const StyledInput = styled.TextInput<StyledInputProps>`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  padding: ${({ theme }) => theme.spacing.sm}px;
  
  ${({ hasLeftIcon }) => hasLeftIcon && 'padding-left: 0;'}
  ${({ hasRightIcon }) => hasRightIcon && 'padding-right: 0;'}
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;