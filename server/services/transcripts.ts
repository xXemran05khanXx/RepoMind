import { aiProvider } from './ai';
import type { Meeting, MeetingSegment } from '@shared/schema';
import { storage } from '../storage';

export interface IngestOptions {
  userId: string;
  title?: string;
  source?: string;
  transcript: string;
}

export async function ingestMeeting(opts: IngestOptions) {
  const meeting = await storage.createMeeting({
    userId: opts.userId,
    title: opts.title || 'Untitled Meeting',
    source: opts.source || 'upload',
    rawTranscript: opts.transcript,
    status: 'processing'
  });

  // Naive segmentation (split by blank lines)
  const segments = opts.transcript.split(/\n\s*\n/).slice(0, 50); // guard upper bound
  let order = 0;
  for (const seg of segments) {
    await storage.createMeetingSegment({
      meetingId: meeting.id,
      order: order++,
      content: seg,
      startTime: null,
      endTime: null,
      embedding: null,
    });
  }

  return meeting;
}

export async function summarizeMeeting(meeting: Meeting): Promise<Meeting> {
  if (!meeting.rawTranscript) return meeting;
  try {
    const segments = await storage.getMeetingSegments(meeting.id);
    const joined = segments.map(s => s.content).join('\n');
    const answer = await aiProvider.answer(
      'Provide a concise structured summary of this meeting transcript.',
      [{ path: 'transcript.txt', content: joined.slice(0, 8000) }],
      'Meeting Transcript'
    );
    return await storage.updateMeeting(meeting.id, { summary: answer.answer, status: 'ready', processedAt: new Date() });
  } catch (e) {
    return await storage.updateMeeting(meeting.id, { status: 'error' });
  }
}
