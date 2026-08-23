import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../api/client';
import { Input, TextArea, Button, Alert } from '../components/common';

const CreateEvent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    total_tickets: 10,
  });

  const [metadataText, setMetadataText] = useState(
    '{\n  "tags": ["music"],\n  "speakers": ["Ada Lovelace"]\n}'
  );

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    let metadata: Record<string, any> = {};
    if (metadataText.trim()) {
      try {
        metadata = JSON.parse(metadataText);
      } catch {
        setError('Metadata must be valid JSON.');
        return;
      }
    }

    setLoading(true);
    try {
      await api.post('/events', {
        ...form,
        total_tickets: Number(form.total_tickets),
        event_date: new Date(form.event_date).toISOString(),
        metadata,
      });
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card--form create-event-page">
      <h2>Create Event</h2>
      <p className="create-event-page__hint">Admin only. Fields marked * are required.</p>

      <Alert type="error" message={error} />

      <form onSubmit={handleSubmit}>
        <Input label="Title" name="title" value={form.title} onChange={handleChange} required />

        <TextArea
          label="Description"
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          helpText="At least 10 characters."
          required
        />

        <Input
          label="Date & time"
          name="event_date"
          type="datetime-local"
          value={form.event_date}
          onChange={handleChange}
          required
        />

        <Input
          label="Location"
          name="location"
          value={form.location}
          onChange={handleChange}
          required
        />

        <Input
          label="Total tickets"
          name="total_tickets"
          type="number"
          min={1}
          value={form.total_tickets}
          onChange={handleChange}
          required
        />

        <TextArea
          label="Metadata (JSON)"
          name="metadata"
          rows={6}
          className="create-event-page__json"
          value={metadataText}
          onChange={(e) => setMetadataText(e.target.value)}
          helpText="Any valid JSON - tags, speakers, seating chart URL, and so on."
        />

        <Button type="submit" block loading={loading} loadingText="Creating...">
          Create Event
        </Button>
      </form>
    </div>
  );
};

export default CreateEvent;
