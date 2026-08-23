import sequelize from './database/database';
import { users, events, bookings, logs } from './models/index_models';

export const seedDemoData = async (): Promise<boolean> => {
  const existing_users = await users.count();
  if (existing_users > 0) {
    console.log('[seed] Data already exists, skipping seed.');
    return false;
  }

  console.log('[seed] Tables are empty - inserting demo data...');

  const demo_users = [
    { user_name: 'Admin User', user_email_id: 'admin@example.com', password: 'Admin@123', role: 'admin' },
    { user_name: 'Normal User', user_email_id: 'user@example.com', password: 'User@1234', role: 'user' },
    { user_name: 'Bala Krishnan', user_email_id: 'bala@example.com', password: 'User@1234', role: 'user' },
    { user_name: 'Divya Shree', user_email_id: 'divya@example.com', password: 'User@1234', role: 'user' },
    { user_name: 'Karthik Raja', user_email_id: 'karthik@example.com', password: 'User@1234', role: 'user' },
  ];

  const created_users = [];
  for (const item of demo_users) {
    const user = await users.create({ ...item, last_action: 'CREATE', is_deleted: false });
    created_users.push(user);
  }
  const [admin, ...normal_users] = created_users;

  const demo_events = [
    {
      title: 'Node.js Conference 2026',
      description: 'A full day of talks about backend development with Node.js and TypeScript.',
      event_date: new Date('2026-11-20T09:00:00Z'),
      location: 'Chennai Trade Centre',
      total_tickets: 100,
      metadata: { tags: ['nodejs', 'backend'], speakers: ['Ada Lovelace', 'Alan Turing'] },
    },
    {
      title: 'Live Music Night',
      description: 'An evening of indie bands playing at the riverside amphitheatre.',
      event_date: new Date('2026-12-05T18:30:00Z'),
      location: 'Riverside Amphitheatre',
      total_tickets: 5,
      metadata: { tags: ['music'], age_limit: 18 },
    },
    {
      title: 'Startup Pitch Day',
      description: 'Ten early stage startups pitch to a panel of investors and the public.',
      event_date: new Date('2027-01-15T10:00:00Z'),
      location: 'Innovation Hub, Bangalore',
      total_tickets: 50,
      metadata: { tags: ['startup', 'business'], sponsors: ['Acme Corp'] },
    },
    {
      title: 'Food & Culture Festival',
      description: 'Street food stalls, live cooking demos and cultural performances all day.',
      event_date: new Date('2026-10-10T11:00:00Z'),
      location: 'Marina Grounds, Chennai',
      total_tickets: 200,
      metadata: { tags: ['food', 'culture'] },
    },
    {
      title: 'Marathon for a Cause',
      description: 'A 10K charity run through the city, proceeds go to local schools.',
      event_date: new Date('2026-09-28T06:00:00Z'),
      location: 'City Sports Complex',
      total_tickets: 300,
      metadata: { tags: ['sports', 'charity'] },
    },
  ];

  const created_events = [];
  for (const item of demo_events) {
    const event = await events.create({
      ...item,
      available_tickets: item.total_tickets,
      created_by: admin.user_id,
      last_actionby: admin.user_id,
      last_action: 'CREATE',
      is_deleted: false,
    });
    created_events.push(event);
  }

  for (let i = 0; i < 5; i++) {
    const booker = normal_users[i % normal_users.length];
    const event = created_events[i % created_events.length];
    const quantity = 1;

    await bookings.create({
      user_id: booker.user_id,
      event_id: event.event_id,
      event_title: event.title,
      quantity,
      status: 'confirmed',
      last_actionby: booker.user_id,
      last_action: 'CREATE',
      is_deleted: false,
    });

    event.available_tickets -= quantity;
    await event.save();
  }

  const demo_logs = [
    { level: 'info', action: 'SEED', message: 'Demo users created.', user_id: admin.user_id },
    { level: 'info', action: 'SEED', message: 'Demo events created.', user_id: admin.user_id },
    { level: 'info', action: 'SEED', message: 'Demo bookings created.', user_id: admin.user_id },
    { level: 'warn', action: 'SEED', message: 'Live Music Night has very limited tickets.', user_id: admin.user_id },
    { level: 'info', action: 'SEED', message: 'Seed completed successfully.', user_id: admin.user_id },
  ];

  for (const item of demo_logs) {
    await logs.create({ ...item, details: { source: 'seed.ts' } });
  }

  console.log('[seed] Done: 5 users, 5 events, 5 bookings, 5 logs inserted.');
  console.log('[seed]   admin -> admin@example.com / Admin@123');
  console.log('[seed]   user  -> user@example.com  / User@1234');
  return true;
};

if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log('Connected to MySQL.');
      await seedDemoData();
      await sequelize.close();
      process.exit(0);
    } catch (err) {
      console.error('Seed failed:', err);
      process.exit(1);
    }
  })();
}
