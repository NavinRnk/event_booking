import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api/client';
import { Button, Alert, Loader } from '../components/common';

interface BookingItem {
  booking_id: number;
  quantity: number;
  status: 'confirmed' | 'cancelled';
  booked_at: string;
  event_id: number;
  event_title: string;
  event_date: string | null;
  event_location: string | null;
}

const MyTickets = () => {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings/my', { params: { page: 1, limit: 50 } });
      setBookings(res.data.data.bookings);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (booking_id: number) => {
    if (!window.confirm('Cancel this booking?')) return;

    setMessage('');
    setError('');
    try {
      await api.delete(`/bookings/${booking_id}`);
      setMessage('Booking cancelled.');
      loadBookings();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="my-tickets-page">
      <h2>My Tickets</h2>

      <Alert type="success" message={message} />
      <Alert type="error" message={error} />

      {loading ? (
        <Loader text="Loading your bookings..." />
      ) : bookings.length === 0 ? (
        <div className="my-tickets-page__empty">You have not booked any tickets yet.</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Event</th>
                <th>Date</th>
                <th>Location</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Booked On</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>{booking.booking_id}</td>
                  <td>{booking.event_title}</td>
                  <td>
                    {booking.event_date ? new Date(booking.event_date).toLocaleString() : '-'}
                  </td>
                  <td>{booking.event_location || '-'}</td>
                  <td>{booking.quantity}</td>
                  <td>
                    <span
                      className={`badge ${
                        booking.status === 'confirmed' ? 'badge--ok' : 'badge--off'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td>{new Date(booking.booked_at).toLocaleDateString()}</td>
                  <td className="my-tickets-page__actions">
                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleCancel(booking.booking_id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
