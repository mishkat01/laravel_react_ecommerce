/**
 * useTwoFactorAuth Custom Hook
 *
 * Demonstrates:
 * 1. Inertia v3 `useHttp()` Hook: Executing background API requests without triggering
 *    page navigation or changing the browser address bar.
 * 2. Integration with Laravel Fortify's two-factor authentication endpoints:
 *    - QR code SVG endpoint
 *    - Setup secret key endpoint
 *    - Recovery codes endpoint
 * 3. Asynchronous state orchestration with `Promise.all` and React `useCallback`.
 */

import { useHttp } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { qrCode, recoveryCodes, secretKey } from '@/routes/two-factor';

/**
 * Return type interface for `useTwoFactorAuth`.
 */
export type UseTwoFactorAuthReturn = {
    /** Raw SVG string representing the TOTP QR code */
    qrCodeSvg: string | null;
    /** Base32 plaintext secret key for manual entry */
    manualSetupKey: string | null;
    /** Array of 8-character emergency recovery codes */
    recoveryCodesList: string[];
    /** Whether both QR code and secret key are loaded and ready */
    hasSetupData: boolean;
    /** Error messages encountered during network calls */
    errors: string[];
    /** Resets the error array */
    clearErrors: () => void;
    /** Resets the temporary QR and secret key setup data */
    clearSetupData: () => void;
    /** Resets all setup data and recovery codes */
    clearTwoFactorAuthData: () => void;
    /** Fetches the SVG QR code from Laravel Fortify */
    fetchQrCode: () => Promise<void>;
    /** Fetches the manual secret key from Laravel Fortify */
    fetchSetupKey: () => Promise<void>;
    /** Fetches both QR code and setup key concurrently */
    fetchSetupData: () => Promise<void>;
    /** Fetches the account's emergency recovery codes */
    fetchRecoveryCodes: () => Promise<void>;
};

/** Default TOTP length standard (RFC 6238) */
export const OTP_MAX_LENGTH = 6;

/**
 * Custom React hook encapsulating state and network interactions
 * for Laravel Fortify 2FA management.
 */
export const useTwoFactorAuth = (): UseTwoFactorAuthReturn => {
    // Inertia v3 hook providing a lightweight HTTP fetch client with CSRF token support
    const { submit } = useHttp();

    // 2FA state values
    const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
    const [manualSetupKey, setManualSetupKey] = useState<string | null>(null);
    const [recoveryCodesList, setRecoveryCodesList] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    // Computed flag indicating if initial setup data has finished downloading
    const hasSetupData = qrCodeSvg !== null && manualSetupKey !== null;

    /**
     * Wipes any recorded error messages.
     */
    const clearErrors = useCallback((): void => {
        setErrors([]);
    }, []);

    /**
     * Resets temporary QR code and secret key upon completing or dismissing setup.
     */
    const clearSetupData = useCallback((): void => {
        setManualSetupKey(null);
        setQrCodeSvg(null);
        setErrors([]);
    }, []);

    /**
     * Complete wipe of all 2FA session data including recovery codes.
     */
    const clearTwoFactorAuthData = useCallback((): void => {
        setManualSetupKey(null);
        setQrCodeSvg(null);
        setErrors([]);
        setRecoveryCodesList([]);
    }, []);

    /**
     * Requests the SVG QR code from GET /user/two-factor-qr-code.
     */
    const fetchQrCode = useCallback(async (): Promise<void> => {
        try {
            const { svg } = (await submit(qrCode())) as {
                svg: string;
                url: string;
            };

            setQrCodeSvg(svg);
        } catch {
            setErrors((prev) => [...prev, 'Failed to fetch QR code']);
            setQrCodeSvg(null);
        }
    }, [submit]);

    /**
     * Requests the secret key string from GET /user/two-factor-secret-key.
     */
    const fetchSetupKey = useCallback(async (): Promise<void> => {
        try {
            const { secretKey: key } = (await submit(secretKey())) as {
                secretKey: string;
            };

            setManualSetupKey(key);
        } catch {
            setErrors((prev) => [...prev, 'Failed to fetch a setup key']);
            setManualSetupKey(null);
        }
    }, [submit]);

    /**
     * Requests the list of recovery codes from GET /user/two-factor-recovery-codes.
     */
    const fetchRecoveryCodes = useCallback(async (): Promise<void> => {
        try {
            setErrors([]);
            const codes = (await submit(recoveryCodes())) as string[];
            setRecoveryCodesList(codes);
        } catch {
            setErrors((prev) => [...prev, 'Failed to fetch recovery codes']);
            setRecoveryCodesList([]);
        }
    }, [submit]);

    /**
     * Fetches both the QR code and secret key simultaneously via Promise.all.
     */
    const fetchSetupData = useCallback(async (): Promise<void> => {
        try {
            setErrors([]);
            await Promise.all([fetchQrCode(), fetchSetupKey()]);
        } catch {
            setQrCodeSvg(null);
            setManualSetupKey(null);
        }
    }, [fetchQrCode, fetchSetupKey]);

    return {
        qrCodeSvg,
        manualSetupKey,
        recoveryCodesList,
        hasSetupData,
        errors,
        clearErrors,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchQrCode,
        fetchSetupKey,
        fetchSetupData,
        fetchRecoveryCodes,
    };
};

