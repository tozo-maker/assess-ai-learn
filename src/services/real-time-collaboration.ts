import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface CollaborationSession {
  id: string;
  type: 'assessment' | 'goal_setting' | 'progress_review' | 'parent_conference';
  title: string;
  description: string;
  participants: Array<{
    userId: string;
    role: 'teacher' | 'student' | 'parent' | 'admin';
    name: string;
    status: 'online' | 'offline' | 'away';
    joinedAt?: string;
  }>;
  studentId?: string;
  assessmentId?: string;
  goalId?: string;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  metadata: any;
}

export interface LiveAssessmentSession {
  id: string;
  assessmentId: string;
  studentId: string;
  teacherId: string;
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'submitted';
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number; // in seconds
  responses: Array<{
    questionId: string;
    response: any;
    timestamp: string;
    timeSpent: number;
  }>;
  liveMetrics: {
    accuracy: number;
    pace: number; // questions per minute
    strugglingQuestions: string[];
    confidenceLevel: number;
  };
  teacherNotes: Array<{
    timestamp: string;
    note: string;
    type: 'observation' | 'intervention' | 'encouragement';
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CollaborativeGoal {
  id: string;
  title: string;
  description: string;
  studentId: string;
  collaborators: Array<{
    userId: string;
    role: 'teacher' | 'student' | 'parent';
    permissions: string[];
  }>;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: string;
    status: 'not_started' | 'in_progress' | 'completed';
    assignedTo: string[];
    progress: number;
    comments: Array<{
      userId: string;
      message: string;
      timestamp: string;
    }>;
  }>;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ProgressUpdate {
  id: string;
  studentId: string;
  type: 'assessment_completed' | 'goal_progress' | 'milestone_achieved' | 'skill_mastered';
  title: string;
  description: string;
  data: any;
  visibility: 'teacher_only' | 'student_teacher' | 'all_stakeholders';
  timestamp: string;
  reactions: Array<{
    userId: string;
    type: 'like' | 'celebrate' | 'concern' | 'question';
    timestamp: string;
  }>;
  comments: Array<{
    userId: string;
    message: string;
    timestamp: string;
  }>;
}

class RealTimeCollaborationService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private activeSessions: Map<string, CollaborationSession> = new Map();
  private liveAssessments: Map<string, LiveAssessmentSession> = new Map();
  private collaborativeGoals: Map<string, CollaborativeGoal> = new Map();
  private progressUpdates: ProgressUpdate[] = [];

  // Initialize real-time collaboration
  async initialize(): Promise<void> {
    try {
      console.log('Initializing real-time collaboration service');
      
      // Set up global collaboration channel
      await this.setupGlobalChannel();
      
      console.log('Real-time collaboration service initialized');
    } catch (error) {
      console.error('Error initializing collaboration service:', error);
      throw error;
    }
  }

  // Create a new collaboration session
  async createCollaborationSession(
    type: CollaborationSession['type'],
    title: string,
    description: string,
    participants: CollaborationSession['participants'],
    metadata: any = {}
  ): Promise<CollaborationSession> {
    try {
      const session: CollaborationSession = {
        id: `session-${Date.now()}-${Math.random()}`,
        type,
        title,
        description,
        participants: participants.map(p => ({ ...p, status: 'offline' })),
        status: 'waiting',
        createdAt: new Date().toISOString(),
        metadata
      };

      this.activeSessions.set(session.id, session);

      // Create dedicated channel for this session
      await this.setupSessionChannel(session.id);

      // Notify participants
      await this.notifyParticipants(session, 'session_created');

      return session;
    } catch (error) {
      console.error('Error creating collaboration session:', error);
      throw error;
    }
  }

  // Start live assessment monitoring
  async startLiveAssessment(
    assessmentId: string,
    studentId: string,
    teacherId: string
  ): Promise<LiveAssessmentSession> {
    try {
      const session: LiveAssessmentSession = {
        id: `live-assessment-${Date.now()}`,
        assessmentId,
        studentId,
        teacherId,
        status: 'not_started',
        currentQuestion: 0,
        totalQuestions: 0,
        timeRemaining: 0,
        responses: [],
        liveMetrics: {
          accuracy: 0,
          pace: 0,
          strugglingQuestions: [],
          confidenceLevel: 0.5
        },
        teacherNotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.liveAssessments.set(session.id, session);

      // Set up real-time channel for this assessment
      await this.setupAssessmentChannel(session.id);

      return session;
    } catch (error) {
      console.error('Error starting live assessment:', error);
      throw error;
    }
  }

  // Update live assessment progress
  async updateLiveAssessment(
    sessionId: string,
    updates: Partial<LiveAssessmentSession>
  ): Promise<void> {
    try {
      const session = this.liveAssessments.get(sessionId);
      if (!session) throw new Error('Assessment session not found');

      // Update session
      Object.assign(session, updates, { updatedAt: new Date().toISOString() });
      this.liveAssessments.set(sessionId, session);

      // Broadcast update to channel
      const channel = this.channels.get(`assessment-${sessionId}`);
      if (channel) {
        await channel.send({
          type: 'broadcast',
          event: 'assessment_update',
          payload: { sessionId, updates }
        });
      }
    } catch (error) {
      console.error('Error updating live assessment:', error);
      throw error;
    }
  }

  // Create collaborative goal
  async createCollaborativeGoal(
    title: string,
    description: string,
    studentId: string,
    collaborators: CollaborativeGoal['collaborators'],
    milestones: Omit<CollaborativeGoal['milestones'][0], 'id' | 'comments'>[]
  ): Promise<CollaborativeGoal> {
    try {
      const goal: CollaborativeGoal = {
        id: `goal-${Date.now()}-${Math.random()}`,
        title,
        description,
        studentId,
        collaborators,
        milestones: milestones.map(m => ({
          ...m,
          id: `milestone-${Date.now()}-${Math.random()}`,
          comments: []
        })),
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.collaborativeGoals.set(goal.id, goal);

      // Set up real-time channel for this goal
      await this.setupGoalChannel(goal.id);

      // Notify collaborators
      await this.notifyCollaborators(goal, 'goal_created');

      return goal;
    } catch (error) {
      console.error('Error creating collaborative goal:', error);
      throw error;
    }
  }

  // Update collaborative goal
  async updateCollaborativeGoal(
    goalId: string,
    updates: Partial<CollaborativeGoal>
  ): Promise<void> {
    try {
      const goal = this.collaborativeGoals.get(goalId);
      if (!goal) throw new Error('Goal not found');

      Object.assign(goal, updates, { updatedAt: new Date().toISOString() });
      this.collaborativeGoals.set(goalId, goal);

      // Broadcast update
      const channel = this.channels.get(`goal-${goalId}`);
      if (channel) {
        await channel.send({
          type: 'broadcast',
          event: 'goal_update',
          payload: { goalId, updates }
        });
      }
    } catch (error) {
      console.error('Error updating collaborative goal:', error);
      throw error;
    }
  }

  // Add comment to goal milestone
  async addMilestoneComment(
    goalId: string,
    milestoneId: string,
    userId: string,
    message: string
  ): Promise<void> {
    try {
      const goal = this.collaborativeGoals.get(goalId);
      if (!goal) throw new Error('Goal not found');

      const milestone = goal.milestones.find(m => m.id === milestoneId);
      if (!milestone) throw new Error('Milestone not found');

      milestone.comments.push({
        userId,
        message,
        timestamp: new Date().toISOString()
      });

      goal.updatedAt = new Date().toISOString();
      this.collaborativeGoals.set(goalId, goal);

      // Broadcast comment
      const channel = this.channels.get(`goal-${goalId}`);
      if (channel) {
        await channel.send({
          type: 'broadcast',
          event: 'milestone_comment',
          payload: { goalId, milestoneId, userId, message }
        });
      }
    } catch (error) {
      console.error('Error adding milestone comment:', error);
      throw error;
    }
  }

  // Share progress update
  async shareProgressUpdate(
    studentId: string,
    type: ProgressUpdate['type'],
    title: string,
    description: string,
    data: any,
    visibility: ProgressUpdate['visibility']
  ): Promise<ProgressUpdate> {
    try {
      const update: ProgressUpdate = {
        id: `update-${Date.now()}-${Math.random()}`,
        studentId,
        type,
        title,
        description,
        data,
        visibility,
        timestamp: new Date().toISOString(),
        reactions: [],
        comments: []
      };

      this.progressUpdates.push(update);

      // Broadcast to appropriate channels based on visibility
      await this.broadcastProgressUpdate(update);

      return update;
    } catch (error) {
      console.error('Error sharing progress update:', error);
      throw error;
    }
  }

  // Add reaction to progress update
  async addProgressReaction(
    updateId: string,
    userId: string,
    type: ProgressUpdate['reactions'][0]['type']
  ): Promise<void> {
    try {
      const update = this.progressUpdates.find(u => u.id === updateId);
      if (!update) throw new Error('Progress update not found');

      // Remove existing reaction from this user
      update.reactions = update.reactions.filter(r => r.userId !== userId);

      // Add new reaction
      update.reactions.push({
        userId,
        type,
        timestamp: new Date().toISOString()
      });

      // Broadcast reaction
      await this.broadcastProgressUpdate(update);
    } catch (error) {
      console.error('Error adding progress reaction:', error);
      throw error;
    }
  }

  // Join collaboration session
  async joinSession(sessionId: string, userId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) throw new Error('Session not found');

      // Update participant status
      const participant = session.participants.find(p => p.userId === userId);
      if (participant) {
        participant.status = 'online';
        participant.joinedAt = new Date().toISOString();
      }

      // Broadcast join event
      const channel = this.channels.get(`session-${sessionId}`);
      if (channel) {
        await channel.send({
          type: 'broadcast',
          event: 'participant_joined',
          payload: { sessionId, userId }
        });
      }
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  }

  // Leave collaboration session
  async leaveSession(sessionId: string, userId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return;

      // Update participant status
      const participant = session.participants.find(p => p.userId === userId);
      if (participant) {
        participant.status = 'offline';
      }

      // Broadcast leave event
      const channel = this.channels.get(`session-${sessionId}`);
      if (channel) {
        await channel.send({
          type: 'broadcast',
          event: 'participant_left',
          payload: { sessionId, userId }
        });
      }
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  }

  // Private helper methods
  private async setupGlobalChannel(): Promise<void> {
    const channel = supabase.channel('global-collaboration');
    
    channel.on('broadcast', { event: 'global_update' }, (payload) => {
      console.log('Global collaboration update:', payload);
    });

    await channel.subscribe();
    this.channels.set('global', channel);
  }

  private async setupSessionChannel(sessionId: string): Promise<void> {
    const channel = supabase.channel(`session-${sessionId}`);
    
    channel.on('broadcast', { event: '*' }, (payload) => {
      console.log(`Session ${sessionId} update:`, payload);
    });

    await channel.subscribe();
    this.channels.set(`session-${sessionId}`, channel);
  }

  private async setupAssessmentChannel(sessionId: string): Promise<void> {
    const channel = supabase.channel(`assessment-${sessionId}`);
    
    channel.on('broadcast', { event: '*' }, (payload) => {
      console.log(`Assessment ${sessionId} update:`, payload);
    });

    await channel.subscribe();
    this.channels.set(`assessment-${sessionId}`, channel);
  }

  private async setupGoalChannel(goalId: string): Promise<void> {
    const channel = supabase.channel(`goal-${goalId}`);
    
    channel.on('broadcast', { event: '*' }, (payload) => {
      console.log(`Goal ${goalId} update:`, payload);
    });

    await channel.subscribe();
    this.channels.set(`goal-${goalId}`, channel);
  }

  private async notifyParticipants(session: CollaborationSession, event: string): Promise<void> {
    // Implementation would send notifications to participants
    console.log(`Notifying participants of ${event}:`, session.participants);
  }

  private async notifyCollaborators(goal: CollaborativeGoal, event: string): Promise<void> {
    // Implementation would send notifications to collaborators
    console.log(`Notifying collaborators of ${event}:`, goal.collaborators);
  }

  private async broadcastProgressUpdate(update: ProgressUpdate): Promise<void> {
    const channel = this.channels.get('global');
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'progress_update',
        payload: update
      });
    }
  }

  // Public getters
  getActiveSession(sessionId: string): CollaborationSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  getLiveAssessment(sessionId: string): LiveAssessmentSession | undefined {
    return this.liveAssessments.get(sessionId);
  }

  getCollaborativeGoal(goalId: string): CollaborativeGoal | undefined {
    return this.collaborativeGoals.get(goalId);
  }

  getProgressUpdates(studentId?: string): ProgressUpdate[] {
    if (studentId) {
      return this.progressUpdates.filter(u => u.studentId === studentId);
    }
    return this.progressUpdates;
  }

  // Cleanup
  async cleanup(): Promise<void> {
    for (const channel of this.channels.values()) {
      await channel.unsubscribe();
    }
    this.channels.clear();
  }
}

export const realTimeCollaborationService = new RealTimeCollaborationService(); 