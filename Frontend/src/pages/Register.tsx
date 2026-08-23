import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import { Input, Dropdown, Button, Alert } from '../components/common';
import type { DropdownOption } from '../components/common';

const ROLE_OPTIONS: DropdownOption[] = [
  { label: 'User (book tickets)', value: 'user' },
  { label: 'Admin (create events)', value: 'admin' },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    user_name: '',
    user_email_id: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form.user_name, form.user_email_id, form.password, form.role);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card--form auth-page">
      <h2>Register</h2>

      <Alert type="error" message={error} />

      <form onSubmit={handleSubmit}>
        <Input
          label="Name"
          name="user_name"
          value={form.user_name}
          onChange={handleChange}
          required
        />

        <Input
          label="Email"
          name="user_email_id"
          type="email"
          value={form.user_email_id}
          onChange={handleChange}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          helpText="At least 8 characters, with one uppercase, one lowercase and one number."
          required
        />

        <Dropdown
          label="Account type"
          name="role"
          value={form.role}
          onChange={handleChange}
          options={ROLE_OPTIONS}
        />

        <Button type="submit" block loading={loading} loadingText="Creating account...">
          Register
        </Button>
      </form>

      <p className="auth-page__footer">
        Already registered? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;
