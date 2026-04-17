import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import styles from './AuthPage.module.css';

const features = ['Free to get started', 'Secure cloud storage', 'Renewal reminders'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError('');
    try {
      const res = await register(form);
      // Backend returns { email, requiresVerification } — redirect to OTP page
      navigate(`/verify-email?email=${encodeURIComponent(res.data.email)}`);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            Join thousands who trust LifeEase to secure and organise their most important documents.
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
          <p className={styles.formEyebrow}>Get Started</p>
          <h2 className={styles.formTitle}>Create your account.</h2>
          <p className={styles.formSubtitle}>Start securing your documents today — it's free.</p>

          {apiError && <div className={styles.apiError}>{apiError}</div>}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <InputField
              label="Full name"
              id="reg-name"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={change('name')}
              error={errors.name}
              autoComplete="name"
            />
            <InputField
              label="Email address"
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={change('email')}
              error={errors.email}
              autoComplete="email"
            />
            <InputField
              label="Password"
              id="reg-password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={change('password')}
              error={errors.password}
              autoComplete="new-password"
            />
            <Button type="submit" loading={loading} fullWidth size="lg">
              Create Account
            </Button>
          </form>

          <p className={styles.switchLink}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
