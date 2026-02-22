import { Request, Response } from 'express';
import { eventService } from '../services';
import { ApiResponse, asyncHandler } from '../utils';
import { HTTP_STATUS } from '../constants';

/**
 * @desc    Create an event
 * @route   POST /api/v1/events
 * @access  Private (admin, editor)
 */
export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.create(req.body, req.user!._id.toString());
  new ApiResponse(HTTP_STATUS.CREATED, 'Event created successfully', { event }).send(
    res,
  );
});

/**
 * @desc    Get all events (admin)
 * @route   GET /api/v1/events/admin
 * @access  Private (admin, editor)
 */
export const getAllEvents = asyncHandler(async (req: Request, res: Response) => {
  const result = await eventService.getAll(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Events retrieved', result).send(res);
});

/**
 * @desc    Get published events (public)
 * @route   GET /api/v1/events
 * @access  Public
 */
export const getPublishedEvents = asyncHandler(async (req: Request, res: Response) => {
  const result = await eventService.getPublished(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Events retrieved', result).send(res);
});

/**
 * @desc    Get upcoming events (public)
 * @route   GET /api/v1/events/upcoming
 * @access  Public
 */
export const getUpcomingEvents = asyncHandler(async (req: Request, res: Response) => {
  const result = await eventService.getUpcoming(req.query as any);
  new ApiResponse(HTTP_STATUS.OK, 'Upcoming events retrieved', result).send(res);
});

/**
 * @desc    Get event by ID
 * @route   GET /api/v1/events/:id
 * @access  Private (admin, editor)
 */
export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.getById(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Event retrieved', { event }).send(res);
});

/**
 * @desc    Get event by slug (public)
 * @route   GET /api/v1/events/slug/:slug
 * @access  Public
 */
export const getEventBySlug = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.getBySlug(req.params.slug as string);
  new ApiResponse(HTTP_STATUS.OK, 'Event retrieved', { event }).send(res);
});

/**
 * @desc    Update event
 * @route   PUT /api/v1/events/:id
 * @access  Private (admin, editor)
 */
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.update(req.params.id as string, req.body);
  new ApiResponse(HTTP_STATUS.OK, 'Event updated successfully', { event }).send(res);
});

/**
 * @desc    Delete event
 * @route   DELETE /api/v1/events/:id
 * @access  Private (admin)
 */
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  await eventService.delete(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Event deleted successfully').send(res);
});

/**
 * @desc    Register for event
 * @route   POST /api/v1/events/:id/register
 * @access  Private
 */
export const registerForEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.registerAttendee(
    req.params.id as string,
    req.user!._id.toString(),
  );
  new ApiResponse(HTTP_STATUS.OK, 'Registered for event successfully', {
    event,
  }).send(res);
});

/**
 * @desc    Unregister from event
 * @route   DELETE /api/v1/events/:id/register
 * @access  Private
 */
export const unregisterFromEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const event = await eventService.unregisterAttendee(
      req.params.id as string,
      req.user!._id.toString(),
    );
    new ApiResponse(HTTP_STATUS.OK, 'Unregistered from event', { event }).send(res);
  },
);

/**
 * @desc    Toggle event publish status
 * @route   PATCH /api/v1/events/:id/toggle-publish
 * @access  Private (admin, editor)
 */
export const togglePublish = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.togglePublish(req.params.id as string);
  new ApiResponse(HTTP_STATUS.OK, 'Publish status toggled', { event }).send(res);
});
