import { Router } from 'express';
import { storage } from '../storage';
import { ingestMeeting, summarizeMeeting } from '../services/transcripts';

const router = Router();

// List meetings
router.get('/', async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const meetings = await storage.getMeetings(userId);
  res.json({ meetings });
});

// Get meeting detail (with segments)
router.get('/:id', async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const meeting = await storage.getMeeting(req.params.id);
  if (!meeting || meeting.userId !== userId) return res.status(404).json({ error: 'not_found' });
  const segments = await storage.getMeetingSegments(meeting.id);
  res.json({ meeting, segments });
});

// Ingest raw transcript
router.post('/', async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const { title, source, transcript } = req.body || {};
  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ error: 'transcript_required' });
  }
  const meeting = await ingestMeeting({ userId, title, source, transcript });
  res.status(202).json({ meeting });
});

// Trigger summarization
router.post('/:id/summarize', async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  const meeting = await storage.getMeeting(req.params.id);
  if (!meeting || meeting.userId !== userId) return res.status(404).json({ error: 'not_found' });
  const updated = await summarizeMeeting(meeting);
  res.json({ meeting: updated });
});

export default router;
