import { 
  users, 
  repositories, 
  repositoryFiles, 
  commits, 
  queries,
  meetings,
  meetingSegments,
  type User, 
  type InsertUser,
  type Repository,
  type InsertRepository,
  type RepositoryFile,
  type Commit,
  type Query,
  type InsertQuery,
  type Meeting,
  type InsertMeeting,
  type MeetingSegment,
  type InsertMeetingSegment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  incrementQueryCount(userId: string): Promise<void>;

  // Repositories
  getRepositories(userId: string): Promise<Repository[]>;
  getRepository(id: string): Promise<Repository | undefined>;
  createRepository(repository: InsertRepository): Promise<Repository>;
  updateRepository(id: string, repository: Partial<Repository>): Promise<Repository>;
  deleteRepository(id: string): Promise<void>;

  // Repository Files
  getRepositoryFiles(repositoryId: string): Promise<RepositoryFile[]>;
  createRepositoryFile(file: Omit<RepositoryFile, "id" | "createdAt">): Promise<RepositoryFile>;
  deleteRepositoryFiles(repositoryId: string): Promise<void>;

  // Commits
  getRepositoryCommits(repositoryId: string): Promise<Commit[]>;
  getCommit(id: string): Promise<Commit | undefined>;
  createCommit(commit: Omit<Commit, "id" | "createdAt">): Promise<Commit>;
  updateCommit(id: string, commit: Partial<Commit>): Promise<Commit>;

  // Queries
  getQueries(userId: string, repositoryId?: string): Promise<Query[]>;
  createQuery(query: InsertQuery): Promise<Query>;
  updateQuery(id: string, query: Partial<Query>): Promise<Query>;

  // Meetings
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  getMeeting(id: string): Promise<Meeting | undefined>;
  getMeetings(userId: string): Promise<Meeting[]>;
  updateMeeting(id: string, meeting: Partial<Meeting>): Promise<Meeting>;
  createMeetingSegment(seg: InsertMeetingSegment): Promise<MeetingSegment>;
  getMeetingSegments(meetingId: string): Promise<MeetingSegment[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.githubId, githubId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async incrementQueryCount(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ queryCount: sql`${users.queryCount} + 1` })
      .where(eq(users.id, userId));
  }

  // Repositories
  async getRepositories(userId: string): Promise<Repository[]> {
    return await db
      .select()
      .from(repositories)
      .where(eq(repositories.userId, userId))
      .orderBy(desc(repositories.createdAt));
  }

  async getRepository(id: string): Promise<Repository | undefined> {
    const [repository] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.id, id));
    return repository || undefined;
  }

  async createRepository(repository: InsertRepository): Promise<Repository> {
    const [newRepository] = await db
      .insert(repositories)
      .values(repository)
      .returning();
    return newRepository;
  }

  async updateRepository(id: string, repository: Partial<Repository>): Promise<Repository> {
    const [updatedRepository] = await db
      .update(repositories)
      .set(repository)
      .where(eq(repositories.id, id))
      .returning();
    return updatedRepository;
  }

  async deleteRepository(id: string): Promise<void> {
    await db.delete(repositories).where(eq(repositories.id, id));
  }

  // Repository Files
  async getRepositoryFiles(repositoryId: string): Promise<RepositoryFile[]> {
    return await db
      .select()
      .from(repositoryFiles)
      .where(eq(repositoryFiles.repositoryId, repositoryId));
  }

  async createRepositoryFile(file: Omit<RepositoryFile, "id" | "createdAt">): Promise<RepositoryFile> {
    const [newFile] = await db
      .insert(repositoryFiles)
      .values(file)
      .returning();
    return newFile;
  }

  async deleteRepositoryFiles(repositoryId: string): Promise<void> {
    await db.delete(repositoryFiles).where(eq(repositoryFiles.repositoryId, repositoryId));
  }

  // Commits
  async getRepositoryCommits(repositoryId: string): Promise<Commit[]> {
    return await db
      .select()
      .from(commits)
      .where(eq(commits.repositoryId, repositoryId))
      .orderBy(desc(commits.date));
  }

  async getCommit(id: string): Promise<Commit | undefined> {
    const [commitRecord] = await db
      .select()
      .from(commits)
      .where(eq(commits.id, id));
    return commitRecord || undefined;
  }

  async createCommit(commit: Omit<Commit, "id" | "createdAt">): Promise<Commit> {
    const [newCommit] = await db
      .insert(commits)
      .values(commit)
      .returning();
    return newCommit;
  }

  async updateCommit(id: string, commit: Partial<Commit>): Promise<Commit> {
    const [updatedCommit] = await db
      .update(commits)
      .set(commit)
      .where(eq(commits.id, id))
      .returning();
    return updatedCommit;
  }

  // Queries
  async getQueries(userId: string, repositoryId?: string): Promise<Query[]> {
    const conditions = repositoryId 
      ? and(eq(queries.userId, userId), eq(queries.repositoryId, repositoryId))
      : eq(queries.userId, userId);

    return await db
      .select()
      .from(queries)
      .where(conditions)
      .orderBy(desc(queries.createdAt));
  }

  async createQuery(query: InsertQuery): Promise<Query> {
    const [newQuery] = await db
      .insert(queries)
      .values(query)
      .returning();
    return newQuery;
  }

  async updateQuery(id: string, query: Partial<Query>): Promise<Query> {
    const [updatedQuery] = await db
      .update(queries)
      .set(query)
      .where(eq(queries.id, id))
      .returning();
    return updatedQuery;
  }

  // Meetings
  async createMeeting(meeting: InsertMeeting): Promise<Meeting> {
    const [m] = await db.insert(meetings).values(meeting).returning();
    return m;
  }
  async getMeeting(id: string): Promise<Meeting | undefined> {
    const [m] = await db.select().from(meetings).where(eq(meetings.id, id));
    return m || undefined;
  }
  async getMeetings(userId: string): Promise<Meeting[]> {
    return await db.select().from(meetings).where(eq(meetings.userId, userId)).orderBy(desc(meetings.createdAt));
  }
  async updateMeeting(id: string, meeting: Partial<Meeting>): Promise<Meeting> {
    const [m] = await db.update(meetings).set(meeting).where(eq(meetings.id, id)).returning();
    return m;
  }
  async createMeetingSegment(seg: InsertMeetingSegment): Promise<MeetingSegment> {
    const [s] = await db.insert(meetingSegments).values(seg).returning();
    return s;
  }
  async getMeetingSegments(meetingId: string): Promise<MeetingSegment[]> {
    return await db.select().from(meetingSegments).where(eq(meetingSegments.meetingId, meetingId)).orderBy(meetingSegments.order);
  }
}

export const storage = new DatabaseStorage();
