import React from "react";
import { ActivityIndicator, TouchableOpacityProps, View } from "react-native";
import styled, { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = "primary",
  size = "medium",
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...rest
}: ButtonProps) {
  const theme = useTheme();

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 16;
      case "medium":
        return 20;
      case "large":
        return 24;
      default:
        return 20;
    }
  };

  return (
    <ButtonContainer
      variant={variant}
      size={size}
      disabled={isDisabled || isLoading}
      fullWidth={fullWidth}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "outline" || variant === "text"
              ? theme.colors.primary
              : theme.colors.surface
          }
        />
      ) : (
        <ButtonContent>
          {leftIcon && (
            <IconContainer position="left">
              <Ionicons
                name={leftIcon as any}
                size={getIconSize()}
                color={
                  variant === "outline" || variant === "text"
                    ? theme.colors.primary
                    : theme.colors.surface
                }
              />
            </IconContainer>
          )}
          <ButtonText variant={variant} size={size}>
            {title}
          </ButtonText>
          {rightIcon && (
            <IconContainer position="right">
              <Ionicons
                name={rightIcon as any}
                size={getIconSize()}
                color={
                  variant === "outline" || variant === "text"
                    ? theme.colors.primary
                    : theme.colors.surface
                }
              />
            </IconContainer>
          )}
        </ButtonContent>
      )}
    </ButtonContainer>
  );
}

interface StyledButtonProps {
  variant: "primary" | "secondary" | "outline" | "text";
  size: "small" | "medium" | "large";
  fullWidth: boolean;
}

const ButtonContainer = styled.TouchableOpacity<StyledButtonProps>`
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  justify-content: center;
  align-items: center;

  ${({ variant, theme }) => {
    switch (variant) {
      case "primary":
        return `
          background-color: ${theme.colors.primary};
          border: none;
        `;
      case "secondary":
        return `
          background-color: ${theme.colors.secondary};
          border: none;
        `;
      case "outline":
        return `
          background-color: transparent;
          border: 1px solid ${theme.colors.primary};
        `;
      case "text":
        return `
          background-color: transparent;
          border: none;
          padding: 0;
        `;
      default:
        return "";
    }
  }}

  ${({ size, theme, variant }) => {
    if (variant === "text") return "";

    switch (size) {
      case "small":
        return `
          padding: ${theme.spacing.xs}px ${theme.spacing.sm}px;
          min-height: 32px;
        `;
      case "medium":
        return `
          padding: ${theme.spacing.sm}px ${theme.spacing.md}px;
          min-height: 44px;
        `;
      case "large":
        return `
          padding: ${theme.spacing.md}px ${theme.spacing.lg}px;
          min-height: 56px;
        `;
      default:
        return "";
    }
  }}
  
  ${({ fullWidth }) => fullWidth && "width: 100%;"}
  
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const ButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

interface ButtonTextProps {
  variant: "primary" | "secondary" | "outline" | "text";
  size: "small" | "medium" | "large";
}

const ButtonText = styled.Text<ButtonTextProps>`
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  text-align: center;

  ${({ variant, theme }) => {
    switch (variant) {
      case "primary":
      case "secondary":
        return `color: ${theme.colors.surface};`;
      case "outline":
      case "text":
        return `color: ${theme.colors.primary};`;
      default:
        return "";
    }
  }}

  ${({ size, theme }) => {
    switch (size) {
      case "small":
        return `font-size: ${theme.typography.fontSizes.xs}px;`;
      case "medium":
        return `font-size: ${theme.typography.fontSizes.sm}px;`;
      case "large":
        return `font-size: ${theme.typography.fontSizes.md}px;`;
      default:
        return "";
    }
  }}
`;

interface IconContainerProps {
  position: "left" | "right";
}

const IconContainer = styled(View)<IconContainerProps>`
  ${({ position }) => position === "left" && "margin-right: 8px;"}
  ${({ position }) => position === "right" && "margin-left: 8px;"}
`;
