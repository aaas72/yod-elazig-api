import { FilterQuery, Types } from 'mongoose';
import { Event } from '../models';
import { IEvent } from '../models/Event';
import { ApiError, createSlug } from '../utils';
import { HTTP_STATUS } from '../constants';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  category?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  upcoming?: boolean;
}

interface EventsPaginatedResult {
  events: IEvent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class EventService {
  /**
   * Create event
   */
  async create(
    data: Partial<IEvent> & { title: string; description: string; startDate: Date },
    organizerId: string,
  ): Promise<IEvent> {
    // معالجة coverImage ليكون فقط اسم الملف
    let coverImage = data.coverImage;
    if (coverImage && coverImage.includes('/')) {
      coverImage = coverImage.substring(coverImage.lastIndexOf('/') + 1);
    }
    const event = await Event.create({
      ...data,
      coverImage,
      organizer: organizerId,
    });
    return event.populate('organizer', 'name email');
  }

  /**
   * Get all events with filtering & pagination
   */
  async getAll(options: PaginationOptions): Promise<EventsPaginatedResult> {
    const {
      page = 1,
      limit = 10,
      sort = '-startDate',
      search,
      category,
      isPublished,
      isFeatured,
      upcoming,
    } = options;

    const filter: FilterQuery<IEvent> = {};

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }
    if (category) filter.category = category;
    if (isPublished !== undefined) filter.isPublished = isPublished;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured;
    if (upcoming) filter.startDate = { $gte: new Date() };

    const skip = (page - 1) * limit;
    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return {
      events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get published events (public)
   */
  async getPublished(options: PaginationOptions): Promise<EventsPaginatedResult> {
    return this.getAll({ ...options, isPublished: true });
  }

  /**
   * Get upcoming events (public)
   */
  async getUpcoming(options: PaginationOptions): Promise<EventsPaginatedResult> {
    return this.getAll({ ...options, isPublished: true, upcoming: true });
  }

  /**
   * Get event by ID
   */
  async getById(id: string): Promise<IEvent> {
    const event = await Event.findById(id).populate('organizer', 'name email');
    if (!event) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }
    return event;
  }

  /**
   * Get event by slug (public)
   */
  async getBySlug(slug: string): Promise<IEvent> {
    const event = await Event.findOne({ slug, isPublished: true }).populate(
      'organizer',
      'name email',
    );
    if (!event) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }
    return event;
  }

  /**
   * Update event
   */
  async update(id: string, data: Partial<IEvent>): Promise<IEvent> {
    const event = await Event.findById(id);
    if (!event) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    if (data.title && data.title !== event.title) {
      data.slug = createSlug(data.title);
    }

    Object.assign(event, data);
    await event.save();

    return event.populate('organizer', 'name email');
  }

  /**
   * Delete event
   */
  async delete(id: string): Promise<void> {
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }
  }

  /**
   * Register attendee for event
   */
  async registerAttendee(eventId: string, userId: string): Promise<IEvent> {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    if (!event.isPublished) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Event is not published');
    }

    if (event.registrationDeadline && event.registrationDeadline < new Date()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Registration deadline has passed');
    }

    if (event.capacity && event.attendees.length >= event.capacity) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Event is at full capacity');
    }

    const userObjectId = new Types.ObjectId(userId);
    const alreadyRegistered = event.attendees.some(
      (a) => a.toString() === userObjectId.toString(),
    );
    if (alreadyRegistered) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Already registered for this event');
    }

    event.attendees.push(userObjectId);
    await event.save();

    return event.populate('organizer', 'name email');
  }

  /**
   * Unregister attendee from event
   */
  async unregisterAttendee(eventId: string, userId: string): Promise<IEvent> {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const index = event.attendees.findIndex(
      (a) => a.toString() === userObjectId.toString(),
    );

    if (index === -1) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Not registered for this event');
    }

    event.attendees.splice(index, 1);
    await event.save();

    return event.populate('organizer', 'name email');
  }

  /**
   * Toggle publish status
   */
  async togglePublish(id: string): Promise<IEvent> {
    const event = await Event.findById(id);
    if (!event) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Event not found');
    }

    event.isPublished = !event.isPublished;
    await event.save();

    return event.populate('organizer', 'name email');
  }
}

export default new EventService();
