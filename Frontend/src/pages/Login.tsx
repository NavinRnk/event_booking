import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import { Input, Button, Alert } from '../components/common';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ user_email_id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form.user_email_id, form.password);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card--form auth-page">
      <h2>Login</h2>

      <Alert type="error" message={error} />

      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="user_email_id"
          type="email"
          value={form.user_email_id}
          onChange={handleChange}
          placeholder="user@example.com"
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />

        <Button type="submit" block loading={loading} loadingText="Logging in...">
          Login
        </Button>
      </form>

      <p className="auth-page__footer">
        No account yet? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
};

export default Login;
