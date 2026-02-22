import { User, Student, News, Event, Program, Contact, Volunteer, Album, Achievement, FAQ } from '../models';
import { ROLES } from '../constants';

interface DashboardStats {
  users: {
    total: number;
    admins: number;
    editors: number;
    students: number;
    active: number;
    inactive: number;
  };
  students: {
    total: number;
    byUniversity: Record<string, number>[];
    byNationality: Record<string, number>[];
  };
  news: {
    total: number;
    published: number;
    drafts: number;
    totalViews: number;
  };
  events: {
    total: number;
    published: number;
    upcoming: number;
    past: number;
    totalAttendees: number;
  };
  programs: {
    total: number;
    published: number;
    upcoming: number;
    ongoing: number;
    completed: number;
  };
  contacts: {
    total: number;
    newCount: number;
    read: number;
    replied: number;
  };
  volunteers: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  gallery: {
    totalAlbums: number;
    totalPhotos: number;
  };
  content: {
    achievements: number;
    faqs: number;
  };
}

class DashboardService {
  /**
   * Get full dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const [users, students, news, events, programs, contacts, volunteers, gallery, content] =
      await Promise.all([
        this.getUserStats(),
        this.getStudentStats(),
        this.getNewsStats(),
        this.getEventStats(),
        this.getProgramStats(),
        this.getContactStats(),
        this.getVolunteerStats(),
        this.getGalleryStats(),
        this.getContentStats(),
      ]);

    return { users, students, news, events, programs, contacts, volunteers, gallery, content };
  }

  private async getUserStats(): Promise<DashboardStats['users']> {
    const [total, admins, editors, students, active] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: [ROLES.SUPER_ADMIN, ROLES.ADMIN] } }),
      User.countDocuments({ role: ROLES.EDITOR }),
      User.countDocuments({ role: ROLES.STUDENT }),
      User.countDocuments({ isActive: true }),
    ]);

    return {
      total,
      admins,
      editors,
      students,
      active,
      inactive: total - active,
    };
  }

  private async getStudentStats(): Promise<DashboardStats['students']> {
    const [total, byUniversity, byNationality] = await Promise.all([
      Student.countDocuments(),
      Student.aggregate([
        { $group: { _id: '$university', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Student.aggregate([
        { $group: { _id: '$nationality', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return { total, byUniversity, byNationality };
  }

  private async getNewsStats(): Promise<DashboardStats['news']> {
    const [total, published, viewsResult] = await Promise.all([
      News.countDocuments(),
      News.countDocuments({ isPublished: true }),
      News.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } },
      ]),
    ]);

    return {
      total,
      published,
      drafts: total - published,
      totalViews: viewsResult[0]?.totalViews || 0,
    };
  }

  private async getEventStats(): Promise<DashboardStats['events']> {
    const now = new Date();
    const [total, published, upcoming, attendeesResult] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ isPublished: true }),
      Event.countDocuments({ startDate: { $gte: now }, isPublished: true }),
      Event.aggregate([
        { $project: { attendeeCount: { $size: '$attendees' } } },
        { $group: { _id: null, totalAttendees: { $sum: '$attendeeCount' } } },
      ]),
    ]);

    return {
      total,
      published,
      upcoming,
      past: published - upcoming,
      totalAttendees: attendeesResult[0]?.totalAttendees || 0,
    };
  }

  private async getProgramStats(): Promise<DashboardStats['programs']> {
    const [total, published, upcoming, ongoing, completed] = await Promise.all([
      Program.countDocuments(),
      Program.countDocuments({ isPublished: true }),
      Program.countDocuments({ status: 'upcoming' }),
      Program.countDocuments({ status: 'ongoing' }),
      Program.countDocuments({ status: 'completed' }),
    ]);

    return { total, published, upcoming, ongoing, completed };
  }

  private async getContactStats(): Promise<DashboardStats['contacts']> {
    const [total, newCount, read, replied] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      Contact.countDocuments({ status: 'read' }),
      Contact.countDocuments({ status: 'replied' }),
    ]);

    return { total, newCount, read, replied };
  }

  private async getVolunteerStats(): Promise<DashboardStats['volunteers']> {
    const [total, pending, accepted, rejected] = await Promise.all([
      Volunteer.countDocuments(),
      Volunteer.countDocuments({ status: 'pending' }),
      Volunteer.countDocuments({ status: 'accepted' }),
      Volunteer.countDocuments({ status: 'rejected' }),
    ]);

    return { total, pending, accepted, rejected };
  }

  private async getGalleryStats(): Promise<DashboardStats['gallery']> {
    const [totalAlbums, photosResult] = await Promise.all([
      Album.countDocuments(),
      Album.aggregate([
        { $project: { photoCount: { $size: '$photos' } } },
        { $group: { _id: null, totalPhotos: { $sum: '$photoCount' } } },
      ]),
    ]);

    return {
      totalAlbums,
      totalPhotos: photosResult[0]?.totalPhotos || 0,
    };
  }

  private async getContentStats(): Promise<DashboardStats['content']> {
    const [achievements, faqs] = await Promise.all([
      Achievement.countDocuments(),
      FAQ.countDocuments(),
    ]);

    return { achievements, faqs };
  }
}

export default new DashboardService();
