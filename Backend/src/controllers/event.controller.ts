import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { events, bookings } from '../models/index_models';
import { ApiError } from '../utils/ApiError';
import { writeLog } from '../utils/logger';

export const createEvent = async (req: Request, res: Response) => {
  const { title, description, event_date, location, total_tickets, metadata } = req.body;

  const event = await events.create({
    title,
    description,
    event_date: new Date(event_date),
    location,
    total_tickets,
    available_tickets: total_tickets,
    metadata: metadata || {},
    created_by: req.user!.user_id,
    last_actionby: req.user!.user_id,
    last_action: 'CREATE',
    is_deleted: false,
  });

  await writeLog({
    action: 'EVENT_CREATED',
    message: `Event "${event.title}" created`,
    user_id: req.user!.user_id,
    details: { event_id: event.event_id, total_tickets },
  });

  res.status(201).json({
    success: true,
    message: 'Event created successfully.',
    data: { event },
  });
};

export const listEvents = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const where: Record<string, any> = { is_deleted: false };

  if (req.query.search) {
    const term = `%${String(req.query.search)}%`;
    where[Op.or as any] = [
      { title: { [Op.like]: term } },
      { location: { [Op.like]: term } },
    ];
  }

  if (req.query.upcomingOnly === 'true') {
    where.event_date = { [Op.gte]: new Date() };
  }

  const { rows: event_list, count: total } = await events.findAndCountAll({
    where,
    order: [['event_date', 'ASC']],
    limit,
    offset,
  });

  res.json({
    success: true,
    data: {
      events: event_list,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 1,
        has_next_page: page * limit < total,
      },
    },
  });
};

export const getEvent = async (req: Request, res: Response) => {
  const event = await events.findOne({
    where: { event_id: Number(req.params.id), is_deleted: false },
  });
  if (!event) {
    throw new ApiError(404, 'Event not found.');
  }

  res.json({ success: true, data: { event } });
};

export const updateEvent = async (req: Request, res: Response) => {
  const allowed_fields = ['title', 'description', 'event_date', 'location', 'metadata'] as const;

  const updates: Record<string, any> = {};
  for (const field of allowed_fields) {
    if (req.body[field] !== undefined) {
      updates[field] = field === 'event_date' ? new Date(req.body[field]) : req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No updatable fields were provided.');
  }

  const event = await events.findOne({
    where: { event_id: Number(req.params.id), is_deleted: false },
  });
  if (!event) {
    throw new ApiError(404, 'Event not found.');
  }

  updates.last_actionby = req.user!.user_id;
  updates.last_action = 'UPDATE';

  await event.update(updates);

  await writeLog({
    action: 'EVENT_UPDATED',
    message: `Event "${event.title}" updated`,
    user_id: req.user!.user_id,
    details: { event_id: event.event_id, updated_fields: Object.keys(updates) },
  });

  res.json({ success: true, message: 'Event updated.', data: { event } });
};

export const deleteEvent = async (req: Request, res: Response) => {
  const event_id = Number(req.params.id);

  const event = await events.findOne({
    where: { event_id, is_deleted: false },
  });
  if (!event) {
    throw new ApiError(404, 'Event not found.');
  }

  const booking_count = await bookings.count({
    where: { event_id, is_deleted: false, status: 'confirmed' },
  });
  if (booking_count > 0) {
    throw new ApiError(409, `Cannot delete: this event already has ${booking_count} booking(s).`);
  }

  await event.update({
    is_deleted: true,
    last_actionby: req.user!.user_id,
    last_action: 'DELETE',
  });

  await writeLog({
    level: 'warn',
    action: 'EVENT_DELETED',
    message: `Event "${event.title}" deleted`,
    user_id: req.user!.user_id,
    details: { event_id },
  });

  res.json({ success: true, message: 'Event deleted.' });
};
