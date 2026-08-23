import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Alert, Loader, Pagination } from '../components/common';

interface EventItem {
  event_id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  total_tickets: number;
  available_tickets: number;
  metadata: Record<string, any>;
}

interface PaginationState {
  page: number;
  total_pages: number;
  total: number;
}

const Events = () => {
  const { isLoggedIn } = useAuth();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    total_pages: 1,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/events', {
        params: { page, limit: 6, search: search || undefined },
      });
      setEvents(res.data.data.events);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [page]);

  const getQuantity = (event_id: number, max: number) => {
    return Math.min(quantities[event_id] ?? 1, max);
  };

  const setQuantity = (event_id: number, value: number, max: number) => {
    const clamped = Math.max(1, Math.min(value, Math.min(max, 10)));
    setQuantities((prev) => ({ ...prev, [event_id]: clamped }));
  };

  const handleBook = async (event_id: number) => {
    setMessage('');
    setError('');
    const quantity = getQuantity(event_id, 10);
    try {
      const res = await api.post('/bookings', { event_id, quantity });
      setMessage(`Booked ${quantity} ticket(s)! Tickets left: ${res.data.data.tickets_left}`);
      loadEvents();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadEvents();
  };

  return (
    <div className="events-page">
      <div className="events-page__header">
        <h2>Upcoming Events</h2>
      </div>

      <form className="form-inline" onSubmit={handleSearch}>
        <Input
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or location..."
        />
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>

      <Alert type="success" message={message} />
      <Alert type="error" message={error} />

      {loading ? (
        <Loader text="Loading events..." />
      ) : events.length === 0 ? (
        <div className="events-page__empty">No events found.</div>
      ) : (
        <div className="grid">
          {events.map((event) => {
            const soldOut = event.available_tickets === 0;

            return (
              <div className="card" key={event.event_id}>
                <h3 className="card__title">{event.title}</h3>
                <p className="card__meta">{new Date(event.event_date).toLocaleString()}</p>
                <p className="card__meta">{event.location}</p>
                <p>{event.description}</p>

                <p className={`events-page__tickets ${soldOut ? 'events-page__tickets--out' : ''}`}>
                  {event.available_tickets} / {event.total_tickets} tickets left
                </p>

                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <ul className="events-page__meta-list">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong>{' '}
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="card__footer">
                  {isLoggedIn ? (
                    soldOut ? (
                      <Button block disabled>
                        Sold Out
                      </Button>
                    ) : (
                      <div className="form-inline">
                        <Input
                          type="number"
                          name={`quantity-${event.event_id}`}
                          value={getQuantity(event.event_id, event.available_tickets)}
                          min={1}
                          max={Math.min(event.available_tickets, 10)}
                          onChange={(e) =>
                            setQuantity(event.event_id, Number(e.target.value), event.available_tickets)
                          }
                        />
                        <Button onClick={() => handleBook(event.event_id)}>
                          Book {getQuantity(event.event_id, event.available_tickets)} Ticket
                          {getQuantity(event.event_id, event.available_tickets) > 1 ? 's' : ''}
                        </Button>
                      </div>
                    )
                  ) : (
                    <p className="text-muted">Login to book a ticket.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        page={pagination.page}
        totalPages={pagination.total_pages}
        total={pagination.total}
        itemLabel="events"
        onPageChange={setPage}
      />
    </div>
  );
};

export default Events;
