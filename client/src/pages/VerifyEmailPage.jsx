import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import styles from './VerifyEmailPage.module.css';

const CODE_LENGTH = 6;

export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef([]);

  // Redirect if no email in query
  useEffect(() => {
    if (!email) navigate('/register', { replace: true });
  }, [email, navigate]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Only accept a single digit
    if (value && !/^\d$/.test(value)) return;

    const updated = [...digits];
    updated[index] = value;
    setDigits(updated);
    setError('');

    // Auto-advance to next input
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (value && index === CODE_LENGTH - 1 && updated.every(d => d)) {
      handleVerify(updated.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: clear current or go to previous
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const updated = [...digits];
        updated[index] = '';
        setDigits(updated);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const updated = [...digits];
        updated[index - 1] = '';
        setDigits(updated);
      }
      e.preventDefault();
    }

    // Arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;

    const updated = [...digits];
    for (let i = 0; i < CODE_LENGTH; i++) {
      updated[i] = pasted[i] || '';
    }
    setDigits(updated);
    setError('');

    // Focus the next empty input, or the last one
    const nextEmpty = updated.findIndex(d => !d);
    const focusIdx = nextEmpty === -1 ? CODE_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();

    // Auto-submit if all filled
    if (updated.every(d => d)) {
      handleVerify(updated.join(''));
    }
  };

  const handleVerify = async (code) => {
    const finalCode = code || digits.join('');
    if (finalCode.length !== CODE_LENGTH) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await verifyEmail({ email, code: finalCode });
      setSuccess('Email verified! Redirecting…');
      setTimeout(() => navigate('/dashboard', { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
      // Clear inputs on error so the user can retry
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setError('');
    setSuccess('');
    try {
      await authService.resendVerification({ email });
      setSuccess('A new code has been sent to your inbox.');
      setCooldown(60);
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // Mask email: show first 2 chars + domain
  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 5)) + c)
    : '';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <Icon name="shield" size={24} />
        </div>

        <h1 className={styles.title}>Verify your email</h1>
        <p className={styles.subtitle}>
          We sent a 6-digit code to <strong>{maskedEmail}</strong>.
          <br />Enter it below to activate your account.
        </p>

        {/* Messages */}
        {error && (
          <div className={styles.errorBox}>
            <Icon name="alertCircle" size={15} />
            {error}
          </div>
        )}
        {success && (
          <div className={styles.successBox}>
            <Icon name="checkCircle" size={15} />
            {success}
          </div>
        )}

        {/* OTP Inputs */}
        <div className={styles.otpRow} onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`${styles.otpInput} ${digit ? styles.filled : ''} ${error ? styles.hasError : ''}`}
              disabled={loading}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {/* Verify button */}
        <Button
          fullWidth
          size="lg"
          loading={loading}
          onClick={() => handleVerify()}
          disabled={digits.some(d => !d)}
        >
          Verify Email
        </Button>

        {/* Resend */}
        <div className={styles.resendRow}>
          <span className={styles.resendText}>Didn't receive the code?</span>
          <button
            className={styles.resendBtn}
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
          >
            {resending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
        </div>

        {/* Back link */}
        <p className={styles.backLink}>
          <Link to="/register">← Back to registration</Link>
        </p>
      </div>
    </div>
  );
}
