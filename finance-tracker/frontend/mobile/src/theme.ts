interface Theme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      error: string;
      success: string;
      warning: string;
      border: string;
      card: string;
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    borderRadius: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
    typography: {
      fontSizes: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
      };
      fontWeights: {
        regular: string;
        medium: string;
        bold: string;
      };
    };
  }
  
  export const lightTheme: Theme = {
    colors: {
      primary: '#5B73E7',
      secondary: '#8491EF',
      background: '#F5F5F5',
      surface: '#FFFFFF',
      text: '#2C2C2C',
      textSecondary: '#757575',
      error: '#E74C3C',
      success: '#2ECC71',
      warning: '#F1C40F',
      border: '#E0E0E0',
      card: '#FFFFFF',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 16,
      xl: 24,
    },
    typography: {
      fontSizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
      },
      fontWeights: {
        regular: '400',
        medium: '500',
        bold: '700',
      },
    },
  };
  
  export const darkTheme: Theme = {
    colors: {
      primary: '#6E86FF',
      secondary: '#9FA8FF',
      background: '#121212',
      surface: '#1E1E1E',
      text: '#F5F5F5',
      textSecondary: '#AAAAAA',
      error: '#F16056',
      success: '#57D9A3',
      warning: '#FFCE52',
      border: '#2C2C2C',
      card: '#1E1E1E',
    },
    spacing: lightTheme.spacing,
    borderRadius: lightTheme.borderRadius,
    typography: lightTheme.typography,
  };
  
  // Estendo il tema per Styled Components
  declare module 'styled-components/native' {
    export interface DefaultTheme extends Theme {}
  }