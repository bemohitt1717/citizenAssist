import { useEffect, useState, useRef } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Button } from '../../../../components/ui/button';
import { Spinner } from '../../../../components/ui/spinner';
import { Field, Panel, Panels, SaveRow } from '../../../../components/ui/DataKit/DataKit';
import { useAuth } from '../../../../context/authContext';
import { getProfile, linkGoogle, linkMobile, updateProfile } from '../../../auth/authApi';
import PinInput from '../../../auth/components/PinInput/PinInput';
import { GOOGLE_CLIENT_ID } from '../../../../config/google';
import './CitizenProfile.css';
import { SectionLoading } from '../../../../components/ui/LoadingStates/LoadingStates';

/**
 * Citizen profile - manage the stored user details in MongoDB.
 * Includes account linking for mobile ↔ Google.
 */
const CitizenProfileContent = () => {
  const { user, setUser } = useAuth();
  const googleButtonRef = useRef(null);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Link mobile states
  const [showLinkMobile, setShowLinkMobile] = useState(false);
  const [linkPhone, setLinkPhone] = useState('');
  const [linkPin, setLinkPin] = useState('');
  const [linkConfirmPin, setLinkConfirmPin] = useState('');
  const [linkStep, setLinkStep] = useState('phone'); // 'phone' | 'pin' | 'confirm'
  const [isLinkingMobile, setIsLinkingMobile] = useState(false);
  const [linkError, setLinkError] = useState('');

  // Link Google state
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [showGoogleButton, setShowGoogleButton] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile();
        const profile = response.data.profile;
        setName(profile.name || '');
        setEmail(profile.email || '');

        if (user) {
          setUser({ ...user, name: profile.name || '', email: profile.email || '' });
        }
      } catch (requestError) {
        console.error('[citizen] profile load failed', requestError);
        setError(requestError.response?.data?.message || 'Could not load your profile. Try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const save = async () => {
    if (isSaving) return;
    if (!name || name.trim() === '') {
      alert('Name cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      console.log('💾 [PROFILE] Updating citizen profile:', { name, email });
      const response = await updateProfile({ name: name.trim(), email: email.trim() });
      const updatedUser = response.data.user;

      setUser((current) => ({
        ...(current || {}),
        ...updatedUser,
      }));

      setName(updatedUser.name || '');
      setEmail(updatedUser.email || '');
      setIsSaved(true);
      setError('');
      setTimeout(() => setIsSaved(false), 2000);
    } catch (requestError) {
      console.error('[citizen] profile save failed', requestError);
      setError(requestError.response?.data?.message || 'Could not save your profile. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkMobile = async () => {
    if (linkStep === 'phone') {
      // Validate phone
      if (!/^[6-9]\d{9}$/.test(linkPhone)) {
        setLinkError('Enter a valid 10-digit mobile number');
        return;
      }
      setLinkError('');
      setLinkStep('pin');
    } else if (linkStep === 'pin') {
      // Validate PIN
      if (linkPin.length !== 4) {
        setLinkError('PIN must be 4 digits');
        return;
      }
      setLinkError('');
      setLinkStep('confirm');
    } else if (linkStep === 'confirm') {
      // Confirm and link
      if (linkConfirmPin !== linkPin) {
        setLinkError('PINs do not match');
        return;
      }

      try {
        setIsLinkingMobile(true);
        setLinkError('');
        console.log('📱 [LINK-MOBILE] Linking mobile number:', linkPhone);

        const response = await linkMobile(linkPhone, linkPin);
        const updatedUser = response.data.user;

        setUser((current) => ({
          ...(current || {}),
          ...updatedUser,
        }));

        console.log('✅ [LINK-MOBILE] Mobile linked successfully');
        alert('Mobile number linked successfully!');
        
        // Reset form
        setShowLinkMobile(false);
        setLinkPhone('');
        setLinkPin('');
        setLinkConfirmPin('');
        setLinkStep('phone');
      } catch (requestError) {
        console.error('❌ [LINK-MOBILE] Failed:', requestError);
        setLinkError(requestError.response?.data?.message || 'Could not add your phone number. Try again.');
      } finally {
        setIsLinkingMobile(false);
      }
    }
  };

  const handleLinkGoogleClick = () => {
    if (isLinkingGoogle) return;
    setIsLinkingGoogle(true);
    setShowGoogleButton(true);
    // Wait for next tick to ensure button is mounted
    setTimeout(() => {
      const googleButton = googleButtonRef.current?.querySelector('div[role="button"]');
      if (googleButton) {
        googleButton.click();
      }
    }, 100);
  };

  const handleGoogleLinkSuccess = async (credentialResponse) => {
    try {
      setIsLinkingGoogle(true);
      setError('');
      console.log('🔗 [LINK-GOOGLE] Received Google credential');

      const response = await linkGoogle(credentialResponse.credential);
      const updatedUser = response.data.user;

      setUser((current) => ({
        ...(current || {}),
        ...updatedUser,
      }));

      setEmail(updatedUser.email || '');
      console.log('✅ [LINK-GOOGLE] Google account linked successfully');
      alert('Google account linked successfully!');
      setShowGoogleButton(false); // Hide button after success
    } catch (requestError) {
      console.error('❌ [LINK-GOOGLE] Failed:', requestError);
      setError(requestError.response?.data?.message || 'Could not add Google sign-in. Try again.');
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handleGoogleLinkError = () => {
    console.error('❌ [LINK-GOOGLE] Google authentication failed');
    setError('Google sign-in failed. Try again.');
    setIsLinkingGoogle(false);
    setShowGoogleButton(false);
  };

  if (isLoading) {
    return <SectionLoading variant="profile" />;
  }

  return (
    <Panels split>
      <Panel title="Your account">
        <div className="ca-form">
          <Field
            id="citizen-name"
            label="Display name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsSaved(false);
            }}
            hint="Your name on this account."
          />

          <div className="ca-form__row">
            <Field
              id="citizen-mobile"
              label="Mobile number"
              value={user?.phone || 'Not set'}
              disabled
              hint="Used to sign in."
              data-numeric
            />

            <Field
              id="citizen-email"
              label="Email"
              value={email || 'Not set'}
              onChange={(e) => {
                setEmail(e.target.value);
                setIsSaved(false);
              }}
              hint="Optional. You can use it to sign in."
            />
          </div>

          {error && <p role="alert" style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</p>}

          <SaveRow onSave={save} isSaved={isSaved} isSaving={isSaving} />
        </div>
      </Panel>

      <Panel title="Sign-in methods">
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
          Add Google sign-in to your account.
        </p>

        {/* Hidden Google Login button - only mount when needed */}
        {showGoogleButton && (
          <div ref={googleButtonRef} style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}>
            <GoogleLogin
              onSuccess={handleGoogleLinkSuccess}
              onError={handleGoogleLinkError}
              useOneTap={false}
              auto_select={false}
            />
          </div>
        )}

        {/* Show Google linking if no Google account */}
        {!user?.googleId && !user?.email && (
          <Button
            type="button"
            className="ca-profile-link-button"
            variant="unstyled"
            onClick={handleLinkGoogleClick}
            disabled={isLinkingGoogle}
            aria-busy={isLinkingGoogle}
          >
            {isLinkingGoogle && <Spinner data-icon="inline-start" />}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {isLinkingGoogle ? 'Connecting…' : 'Add Google sign-in'}
          </Button>
        )}

        {/* Show Google linked status */}
        {(user?.googleId || user?.email) && (
          <div className="ca-profile-linked">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Google sign-in is on: {user?.email}</span>
          </div>
        )}

        {/* Show mobile linking if no mobile (Google-only account) */}
        {user?.googleId && !user?.phone && (
          <>
            <div style={{ height: '1rem' }} />
            <p style={{ marginBottom: '1rem', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
              Add a mobile number and PIN to sign in by phone and get text updates.
            </p>

            {!showLinkMobile ? (
              <Button
                type="button"
                className="ca-profile-link-button ca-profile-link-button--secondary"
                variant="unstyled"
                onClick={() => setShowLinkMobile(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                Add phone number
              </Button>
            ) : (
              <div className="ca-profile-link-form">
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem' }}>
                  {linkStep === 'phone' && 'Add your phone number'}
                  {linkStep === 'pin' && 'Create a 4-digit PIN'}
                  {linkStep === 'confirm' && 'Confirm your PIN'}
                </h4>

                {linkStep === 'phone' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                      Mobile number
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-ink-muted)' }}>+91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="98765 43210"
                        value={linkPhone}
                        onChange={(e) => {
                          setLinkPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                          setLinkError('');
                        }}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: '1px solid var(--color-line)',
                          borderRadius: '8px',
                          fontSize: '0.9375rem',
                        }}
                      />
                    </div>
                  </div>
                )}

                {linkStep === 'pin' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                      New PIN
                    </label>
                    <PinInput
                      id="link-pin"
                      value={linkPin}
                      onChange={(val) => {
                        setLinkPin(val);
                        setLinkError('');
                      }}
                      length={4}
                      masked={false}
                      status={linkPin.length === 4 ? 'valid' : 'idle'}
                    />
                  </div>
                )}

                {linkStep === 'confirm' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                      Confirm PIN
                    </label>
                    <PinInput
                      id="link-confirm-pin"
                      value={linkConfirmPin}
                      onChange={(val) => {
                        setLinkConfirmPin(val);
                        setLinkError('');
                      }}
                      length={4}
                      masked={false}
                      status={linkConfirmPin.length === 4 ? (linkConfirmPin === linkPin ? 'valid' : 'invalid') : 'idle'}
                    />
                  </div>
                )}

                {linkError && (
                  <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {linkError}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button
                    type="button"
                    className="ca-profile-link-button"
                    variant="unstyled"
                    onClick={handleLinkMobile}
                    disabled={isLinkingMobile || (linkStep === 'phone' && linkPhone.length !== 10) || (linkStep === 'pin' && linkPin.length !== 4) || (linkStep === 'confirm' && linkConfirmPin.length !== 4)}
                    aria-busy={isLinkingMobile}
                  >
                    {isLinkingMobile && <Spinner data-icon="inline-start" />}
                    {isLinkingMobile ? 'Adding…' : linkStep === 'confirm' ? 'Save phone number' : 'Continue'}
                  </Button>
                  <Button
                    type="button"
                    className="ca-profile-link-button ca-profile-link-button--secondary"
                    variant="unstyled"
                    onClick={() => {
                      setShowLinkMobile(false);
                      setLinkPhone('');
                      setLinkPin('');
                      setLinkConfirmPin('');
                      setLinkStep('phone');
                      setLinkError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>
    </Panels>
  );
};

const CitizenProfile = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <CitizenProfileContent />
  </GoogleOAuthProvider>
);

export default CitizenProfile;
