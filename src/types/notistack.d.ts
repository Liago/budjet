declare module "notistack" {
  import * as React from "react";

  export type VariantType =
    | "default"
    | "error"
    | "success"
    | "warning"
    | "info";
  export type SnackbarKey = string | number;

  export interface SnackbarMessage {
    key?: SnackbarKey;
    message: React.ReactNode;
    variant?: VariantType;
    [key: string]: any;
  }

  export interface OptionsObject {
    key?: SnackbarKey;
    variant?: VariantType;
    autoHideDuration?: number | null;
    preventDuplicate?: boolean;
    anchorOrigin?: {
      horizontal: "left" | "center" | "right";
      vertical: "top" | "bottom";
    };
    action?: React.ReactNode | ((key: SnackbarKey) => React.ReactNode);
    [key: string]: any;
  }

  export interface SnackbarProviderProps {
    children: React.ReactNode;
    maxSnack?: number;
    anchorOrigin?: {
      horizontal: "left" | "center" | "right";
      vertical: "top" | "bottom";
    };
    dense?: boolean;
    hideIconVariant?: boolean;
    autoHideDuration?: number;
    variant?: VariantType;
    preventDuplicate?: boolean;
    action?: React.ReactNode | ((key: SnackbarKey) => React.ReactNode);
    disableWindowBlurListener?: boolean;
    transitionDuration?: number | { enter?: number; exit?: number };
    TransitionComponent?: React.ComponentType<any>;
    disableWindowBlurListener?: boolean;
    classes?: any;
    iconVariant?: Record<string, React.ReactNode>;
    [key: string]: any;
  }

  export interface SnackbarProviderComponent
    extends React.ComponentClass<SnackbarProviderProps> {}

  export interface SnackbarContextType {
    enqueueSnackbar: (
      message: React.ReactNode,
      options?: OptionsObject
    ) => SnackbarKey;
    closeSnackbar: (key?: SnackbarKey) => void;
  }

  export const SnackbarProvider: SnackbarProviderComponent;

  export function useSnackbar(): SnackbarContextType;

  export const withSnackbar: <P extends object>(
    component: React.ComponentType<P & SnackbarContextType>
  ) => React.ComponentType<P>;
}
