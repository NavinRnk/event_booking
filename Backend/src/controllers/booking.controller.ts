import { Request, Response } from 'express';
import { Op, literal } from 'sequelize';
import sequelize from '../database/database';
import { bookings, events } from '../models/index_models';
import { ApiError } from '../utils/ApiError';
import { writeLog } from '../utils/logger';

export const createBooking = async (req: Request, res: Response) => {
  const event_id = Number(req.body.event_id);
  const quantity: number = req.body.quantity || 1;
  const user_id = req.user!.user_id;

  const transaction = await sequelize.transaction();

  try {
    const event = await events.findOne({
      where: { event_id, is_deleted: false },
      transaction,
    });
    if (!event) {
      throw new ApiError(404, 'Event not found.');
    }
    if (new Date(event.event_date) <= new Date()) {
      throw new ApiError(400, 'This event has already taken place.');
    }

    const [affected_rows] = await events.update(
      { available_tickets: literal(`available_tickets - ${Number(quantity)}`) },
      {
        where: {
          event_id,
          is_deleted: false,
          available_tickets: { [Op.gte]: quantity },
        },
        transaction,
      }
    );

    if (affected_rows === 0) {
      throw new ApiError(
        409,
        `Not enough tickets available. Only ${event.available_tickets} left.`
      );
    }

    const booking = await bookings.create(
      {
        user_id,
        event_id: event.event_id,
        event_title: event.title,
        quantity,
        status: 'confirmed',
        last_actionby: user_id,
        last_action: 'CREATE',
        is_deleted: false,
      },
      { transaction }
    );

    await event.reload({ transaction });

    await transaction.commit();

    await writeLog({
      action: 'BOOKING_CREATED',
      message: `User ${user_id} booked ${quantity} ticket(s) for "${event.title}"`,
      user_id,
      details: {
        booking_id: booking.booking_id,
        event_id,
        quantity,
        tickets_left: event.available_tickets,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed.',
      data: {
        booking: {
          booking_id: booking.booking_id,
          event_id: booking.event_id,
          event_title: booking.event_title,
          quantity: booking.quantity,
          status: booking.status,
          createdAt: booking.createdAt,
        },
        tickets_left: event.available_tickets,
      },
    });
  } catch (err) {
    await transaction.rollback();

    if (err instanceof ApiError && err.statusCode === 409) {
      await writeLog({
        level: 'warn',
        action: 'BOOKING_SOLD_OUT',
        message: `User ${user_id} could not book ${quantity} ticket(s) for event ${event_id}`,
        user_id,
        details: { event_id, quantity },
      });
    }

    throw err;
  }
};

export const myBookings = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { rows: booking_list, count: total } = await bookings.findAndCountAll({
    where: { user_id: req.user!.user_id, is_deleted: false },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  const event_ids = [...new Set(booking_list.map((booking: any) => booking.event_id))];

  const event_list = event_ids.length
    ? await events.findAll({
        where: { event_id: { [Op.in]: event_ids } },
        attributes: ['event_id', 'title', 'event_date', 'location', 'metadata'],
      })
    : [];

  const event_map = new Map<number, any>();
  for (const event of event_list) {
    event_map.set(event.event_id, event);
  }

  const data = booking_list.map((booking: any) => {
    const event = event_map.get(booking.event_id);
    return {
      booking_id: booking.booking_id,
      quantity: booking.quantity,
      status: booking.status,
      booked_at: booking.createdAt,
      event_id: booking.event_id,
      event_title: event?.title || booking.event_title,
      event_date: event?.event_date || null,
      event_location: event?.location || null,
      event_metadata: event?.metadata || null,
    };
  });

  res.json({
    success: true,
    data: {
      bookings: data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit) || 1,
      },
    },
  });
};

export const cancelBooking = async (req: Request, res: Response) => {
  const booking_id = Number(req.params.id);
  const user_id = req.user!.user_id;

  const transaction = await sequelize.transaction();

  try {
    const booking = await bookings.findOne({
      where: { booking_id, user_id, is_deleted: false },
      transaction,
      lock: true,
    });

    if (!booking) {
      throw new ApiError(404, 'Booking not found.');
    }
    if (booking.status === 'cancelled') {
      throw new ApiError(409, 'This booking is already cancelled.');
    }

    await booking.update(
      {
        status: 'cancelled',
        last_actionby: user_id,
        last_action: 'CANCEL',
      },
      { transaction }
    );

    await events.update(
      { available_tickets: literal(`available_tickets + ${Number(booking.quantity)}`) },
      { where: { event_id: booking.event_id }, transaction }
    );

    await transaction.commit();

    await writeLog({
      action: 'BOOKING_CANCELLED',
      message: `User ${user_id} cancelled booking ${booking_id}`,
      user_id,
      details: { booking_id, event_id: booking.event_id, quantity: booking.quantity },
    });

    res.json({ success: true, message: 'Booking cancelled and tickets released.' });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
