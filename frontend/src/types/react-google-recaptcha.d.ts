declare module 'react-google-recaptcha' {
  import * as React from 'react';

  export interface ReCAPTCHAProps {
    sitekey: string;
    onChange?: (token: string | null) => void;
    onExpired?: () => void;
    onErrored?: () => void;
    theme?: 'light' | 'dark';
    size?: 'normal' | 'compact' | 'invisible';
    badge?: 'bottomright' | 'bottomleft' | 'inline';
    type?: 'image' | 'audio';
    tabindex?: number;
    hl?: string;
    id?: string;
    className?: string;
    style?: React.CSSProperties;
  }

  export default class ReCAPTCHA extends React.Component<ReCAPTCHAProps> {
    reset(): void;
    execute(): void;
    getValue(): string | null;
  }
}
