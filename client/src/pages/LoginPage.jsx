import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import styles from './AuthPage.module.css';

const features = ['Bank-level file encryption', 'Smart expiry reminders', '9 document categories'];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError('');
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      // If backend returns 403, user exists but email not verified — redirect to OTP page
      if (err.response?.status === 403) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
        return;
      }
      setApiError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const change = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.brandPanel}>
        <div className={styles.brandInner}>
          <div className={styles.brandLogo}>
            <Icon name="shield" size={22} />
          </div>
          <h1 className={styles.brandTitle}>LifeEase</h1>
          <p className={styles.brandDesc}>
            A secure, organised vault for every document that matters in your life.
          </p>
          <div className={styles.brandFeatures}>
            {features.map(f => (
              <div key={f} className={styles.brandFeature}>
                <span className={styles.featureCheck}>
                  <Icon name="check" size={10} />
                  
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <p className={styles.formEyebrow}>Secure Access</p>
          <h2 className={styles.formTitle}>Welcome back.</h2>
          <p className={styles.formSubtitle}>Sign in to access your document vault.</p>

          {apiError && <div className={styles.apiError}>{apiError}</div>}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <InputField
              label="Email address"
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={change('email')}
              error={errors.email}
              autoComplete="email"
            />
            <InputField
              label="Password"
              id="login-password"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={change('password')}
              error={errors.password}
              autoComplete="current-password"
            />
            <Button type="submit" loading={loading} fullWidth size="lg">
              Sign in
            </Button>
          </form>

          <p className={styles.switchLink}>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
