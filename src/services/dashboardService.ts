import { User, Student, News, Event, Program, Volunteer, Album, Achievement, FAQ, StudentAchievement, BoardMember } from '../models';
import Report from '../models/Report';
import { ROLES } from '../constants';

interface DashboardStats {
  users: {
    total: number;
    admins: number;
    editors: number;
    students: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
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
    byStatus: {
      upcoming: number;
      ongoing: number;
      completed: number;
    };
  };
  volunteers: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  gallery: {
    albums: number;
    photos: number;
  };
  content: {
    achievements: number;
    faqs: number;
    faqsPublished: number;
    faqCategories: number;
  };
  studentAchievements: {
    total: number;
    published: number;
  };
  boardMembers: {
    total: number;
    executive: number;
    organizational: number;
  };
  reports: {
    total: number;
  };
}

class DashboardService {
  /**
   * Get full dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    // ensure programs.byStatus included in type
    const [users, students, news, events, programs, volunteers, gallery, content, studentAchievements, boardMembers, reports] =
      await Promise.all([
        this.getUserStats(),
        this.getStudentStats(),
        this.getNewsStats(),
        this.getEventStats(),
        this.getProgramStats(),
        this.getVolunteerStats(),
        this.getGalleryStats(),
        this.getContentStats(),
        this.getStudentAchievementStats(),
        this.getBoardMemberStats(),
        this.getReportStats(),
      ]);

    return { users, students, news, events, programs, volunteers, gallery, content, studentAchievements, boardMembers, reports };
  }

  private async getUserStats(): Promise<DashboardStats['users']> {
    const [total, admins, editors, students, active] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $in: [ROLES.SUPER_ADMIN, ROLES.ADMIN] } }),
      User.countDocuments({ role: ROLES.EDITOR }),
      User.countDocuments({ role: ROLES.STUDENT }),
      User.countDocuments({ isActive: true }),
    ]);

    // also compute breakdown by each role value found in ROLES
    const roles = Object.values(ROLES);
    const byRole: Record<string, number> = {};
    await Promise.all(
      roles.map(async (r) => {
        byRole[r] = await User.countDocuments({ role: r });
      })
    );

    return {
      total,
      admins,
      editors,
      students,
      active,
      inactive: total - active,
      byRole,
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

    return {
      total,
      published,
      byStatus: { upcoming, ongoing, completed },
    } as any; // casting until interface updated below
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
      albums: totalAlbums,
      photos: photosResult[0]?.totalPhotos || 0,
    };
  }

  private async getContentStats(): Promise<DashboardStats['content']> {
    const [achievements, faqs, faqsPublished, categoriesResult] = await Promise.all([
      Achievement.countDocuments(),
      FAQ.countDocuments(),
      FAQ.countDocuments({ isPublished: true }),
      FAQ.distinct('category'),
    ]);

    return {
      achievements,
      faqs,
      faqsPublished,
      faqCategories: categoriesResult.length,
    };
  }

  private async getStudentAchievementStats(): Promise<DashboardStats['studentAchievements']> {
    const [total, published] = await Promise.all([
      StudentAchievement.countDocuments(),
      StudentAchievement.countDocuments({ isPublished: true }),
    ]);
    return { total, published };
  }

  private async getBoardMemberStats(): Promise<DashboardStats['boardMembers']> {
    const [total, executive, organizational] = await Promise.all([
      BoardMember.countDocuments(),
      BoardMember.countDocuments({ type: 'executive' }),
      BoardMember.countDocuments({ type: 'organizational' }),
    ]);
    return { total, executive, organizational };
  }

  private async getReportStats(): Promise<DashboardStats['reports']> {
    const total = await Report.countDocuments();
    return { total };
  }
}

export default new DashboardService();
