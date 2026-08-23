const BASE = process.env.API_URL || 'http://localhost:5000/api';
const TOTAL_TICKETS = 5;
const PARALLEL_REQUESTS = 20;

const post = async (path, body, token) => {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

const getToken = async (name, email, password, role) => {
  const reg = await post('/auth/register', { user_name: name, user_email_id: email, password, role });
  if (reg.status === 201) return reg.body.data.token;

  const login = await post('/auth/login', { user_email_id: email, password });
  if (login.status !== 200) {
    throw new Error(`Could not authenticate ${email}: ${JSON.stringify(login.body)}`);
  }
  return login.body.data.token;
};

const main = async () => {
  console.log('--- Concurrency test ---\n');

  const adminToken = await getToken('Race Admin', 'raceadmin@example.com', 'Admin@123', 'admin');
  const userToken = await getToken('Race User', 'raceuser@example.com', 'User@1234', 'user');

  const created = await post(
    '/events',
    {
      title: `Race Test Event ${Date.now()}`,
      description: 'Event created automatically by the concurrency test script.',
      event_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      location: 'Test Hall',
      total_tickets: TOTAL_TICKETS,
      metadata: { purpose: 'concurrency test' },
    },
    adminToken
  );

  if (created.status !== 201) {
    throw new Error('Could not create the event: ' + JSON.stringify(created.body));
  }

  const eventId = created.body.data.event.event_id;
  console.log(`Created event ${eventId} with ${TOTAL_TICKETS} tickets.`);
  console.log(`Firing ${PARALLEL_REQUESTS} booking requests at the same time...\n`);

  const requests = [];
  for (let i = 0; i < PARALLEL_REQUESTS; i++) {
    requests.push(post('/bookings', { event_id: eventId, quantity: 1 }, userToken));
  }
  const results = await Promise.all(requests);

  const succeeded = results.filter((r) => r.status === 201).length;
  const soldOut = results.filter((r) => r.status === 409).length;
  const other = results.length - succeeded - soldOut;

  const check = await fetch(`${BASE}/events/${eventId}`).then((r) => r.json());
  const left = check.data.event.available_tickets;

  console.log('Successful bookings :', succeeded);
  console.log('Rejected (sold out) :', soldOut);
  console.log('Other responses     :', other);
  console.log('Tickets left        :', left);

  const passed = succeeded === TOTAL_TICKETS && left === 0;
  console.log('\nRESULT:', passed ? 'PASS - no overselling' : 'FAIL - the counter is wrong');
  process.exit(passed ? 0 : 1);
};

main().catch((err) => {
  console.error('Test failed to run:', err.message);
  console.error('Is the API running on', BASE, '?');
  process.exit(1);
});
