import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Flame, Trophy, Star, Target, Rocket, Heart, Zap, PartyPopper } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DIFFICULTY_CONFIG = {
  EASY: { rounds: 3, memoryPairs: 4, focusSeconds: 12, breathingSeconds: 20 },
  MEDIUM: { rounds: 4, memoryPairs: 6, focusSeconds: 18, breathingSeconds: 30 },
  HARD: { rounds: 5, memoryPairs: 8, focusSeconds: 25, breathingSeconds: 40 }
};

const SHAPES = [
  { name: 'Circle', symbol: '●' },
  { name: 'Square', symbol: '■' },
  { name: 'Triangle', symbol: '▲' },
  { name: 'Star', symbol: '★' },
  { name: 'Diamond', symbol: '◆' }
];

const EMOTIONS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😮', label: 'Surprised' },
  { emoji: '😨', label: 'Scared' },
  { emoji: '😌', label: 'Calm' }
];

const STORIES = [
  {
    prompt: 'Riya helped her friend pick up books that fell.',
    options: ['She was kind', 'She was angry', 'She was careless'],
    answer: 'She was kind'
  },
  {
    prompt: 'Arun forgot his umbrella and saw dark clouds.',
    options: ['It may rain', 'It is summer', 'He is hungry'],
    answer: 'It may rain'
  },
  {
    prompt: 'The class became quiet during the exam.',
    options: ['They are writing', 'They are dancing', 'They are sleeping'],
    answer: 'They are writing'
  },
  {
    prompt: 'Mila practiced daily and won the race.',
    options: ['Practice helps', 'Luck is bad', 'Racing is easy'],
    answer: 'Practice helps'
  }
];

const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);

const getDifficulty = (value) => DIFFICULTY_CONFIG[value] || DIFFICULTY_CONFIG.EASY;

const createNumberQuestion = (difficulty) => {
  const maxStep = difficulty === 'HARD' ? 7 : difficulty === 'MEDIUM' ? 5 : 3;
  const step = Math.floor(Math.random() * maxStep) + 2;
  const start = Math.floor(Math.random() * 20) + 1;
  const values = Array.from({ length: 5 }, (_, idx) => start + (idx * step));
  const missingIndex = Math.floor(Math.random() * 3) + 1;
  const answer = values[missingIndex];
  values[missingIndex] = '__';
  return { text: values.join(', '), answer };
};

const ChildDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [vrSessions, setVrSessions] = useState([]);
  const [vrVideoAssignments, setVrVideoAssignments] = useState([]);
  const [showVR, setShowVR] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: "Hi! 👋 I'm CogniBot. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [activeGameTask, setActiveGameTask] = useState(null);
  const [gameState, setGameState] = useState(null);
  const gameTimerRef = useRef(null);

  useEffect(() => {
    if (!user?.userId) return;
    fetchData();
    const intervalId = setInterval(fetchData, 15000);
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    if (!activeGameTask || !gameState?.started || !gameState?.remainingSeconds) return;
    if (gameState.type !== 'focus' && gameState.type !== 'breathing') return;

    gameTimerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev) return prev;
        const nextRemaining = prev.remainingSeconds - 1;
        if (nextRemaining <= 0) {
          clearInterval(gameTimerRef.current);
          gameTimerRef.current = null;
          completeTask(activeGameTask.assignmentId, 100);
          setActiveGameTask(null);
          toast.success('Great focus! Task completed.');
          return null;
        }
        if (prev.type === 'breathing') {
          const cyclePos = nextRemaining % 8;
          const phase = cyclePos >= 4 ? 'Inhale' : 'Exhale';
          return { ...prev, remainingSeconds: nextRemaining, phase };
        }
        return { ...prev, remainingSeconds: nextRemaining };
      });
    }, 1000);

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
        gameTimerRef.current = null;
      }
    };
  }, [activeGameTask, gameState]);

  const fetchData = async () => {
    try {
      const profileRes = await api.get(`/api/child/profile?userId=${user.userId}`);
      const profileData = profileRes.data.data;
      setProfile(profileData);
      const childId = profileData?.childId;
      const [tasksRes, rewardsRes, sessionsRes, prescriptionsRes, vrSessionsRes, vrVideoRes, leaderboardRes, performanceRes] = await Promise.all([
        api.get(`/api/child/tasks?childId=${childId}`),
        api.get(`/api/child/rewards?childId=${childId}`),
        api.get(`/api/child/sessions?childId=${childId}`),
        api.get(`/api/child/prescriptions?childId=${childId}`),
        api.get(`/api/child/vr-sessions?childId=${childId}`),
        api.get(`/api/child/vr/videos?childId=${childId}`),
        api.get('/api/public/leaderboard'),
        api.get(`/api/public/child-performance/${childId}`)
      ]);
      setTasks(tasksRes.data.data);
      setRewards(rewardsRes.data.data);
      setSessions(sessionsRes.data.data);
      setPrescriptions(prescriptionsRes.data.data);
      setVrSessions(vrSessionsRes.data.data || []);
      setVrVideoAssignments(vrVideoRes.data.data || []);
      setLeaderboard(leaderboardRes.data.data || []);
      setPerformance(performanceRes.data.data);
      
      // Fetch profile image
      if (childId) {
        try {
          const imgRes = await api.get(`/api/child/profile-image/${childId}`, { responseType: 'blob' });
          const url = URL.createObjectURL(imgRes.data);
          setProfileImage(url);
        } catch {
          setProfileImage(null);
        }
      }
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const completeTask = async (assignmentId, score = 100) => {
    try {
      await api.post(`/api/child/activity?childId=${profile.childId}`, { assignmentId, score });
      toast.success(`Great job! +${score} points!`);
      await api.post(`/api/child/streak?childId=${profile.childId}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/api/child/profile-image?childId=${profile.childId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Profile image updated!');
      fetchData();
    } catch (error) {
      toast.error('Failed to upload profile image');
    }
  };

  const closeGameModal = () => {
    setActiveGameTask(null);
    setGameState(null);
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
  };

  const startTaskGame = (task) => {
    const difficulty = task.difficultyLevel || 'EASY';
    const config = getDifficulty(difficulty);
    const name = (task.moduleName || '').toLowerCase();

    if (name.includes('memory')) {
      const symbols = shuffle(['🍎', '🚗', '🐶', '🌟', '🎈', '🍉', '🚀', '🎵']).slice(0, config.memoryPairs);
      const cards = shuffle([...symbols, ...symbols]);
      setGameState({ type: 'memory', cards, flipped: [], matched: [], moves: 0 });
    } else if (name.includes('color')) {
      const colors = shuffle([
        { color: 'Red', group: 'Warm' },
        { color: 'Orange', group: 'Warm' },
        { color: 'Yellow', group: 'Warm' },
        { color: 'Blue', group: 'Cool' },
        { color: 'Green', group: 'Cool' },
        { color: 'Purple', group: 'Cool' },
        { color: 'White', group: 'Neutral' },
        { color: 'Gray', group: 'Neutral' }
      ]).slice(0, config.rounds + 2);
      setGameState({ type: 'color', items: colors, index: 0, correct: 0 });
    } else if (name.includes('number')) {
      const questions = Array.from({ length: config.rounds }, () => createNumberQuestion(difficulty));
      setGameState({ type: 'number', questions, index: 0, answer: '', correct: 0 });
    } else if (name.includes('shape')) {
      const questions = Array.from({ length: config.rounds }, () => {
        const target = shuffle(SHAPES)[0];
        const options = shuffle([target, ...shuffle(SHAPES.filter((s) => s.name !== target.name)).slice(0, 2)]);
        return { target, options };
      });
      setGameState({ type: 'shape', questions, index: 0, correct: 0 });
    } else if (name.includes('breathing')) {
      setGameState({ type: 'breathing', started: false, phase: 'Inhale', remainingSeconds: config.breathingSeconds });
    } else if (name.includes('story')) {
      const questions = shuffle(STORIES).slice(0, config.rounds);
      setGameState({ type: 'story', questions, index: 0, correct: 0 });
    } else if (name.includes('focus')) {
      setGameState({ type: 'focus', started: false, remainingSeconds: config.focusSeconds });
    } else if (name.includes('emotion')) {
      const questions = shuffle(EMOTIONS).slice(0, config.rounds).map((item) => ({
        ...item,
        options: shuffle([item.label, ...shuffle(EMOTIONS.filter((e) => e.label !== item.label)).slice(0, 2).map((e) => e.label)])
      }));
      setGameState({ type: 'emotion', questions, index: 0, correct: 0 });
    } else {
      setGameState({ type: 'focus', started: false, remainingSeconds: config.focusSeconds });
    }

    setActiveGameTask(task);
  };

  const finishQuizGame = (correct, total) => {
    const percentage = Math.round((correct / total) * 100);
    const score = Math.max(60, percentage);
    completeTask(activeGameTask.assignmentId, score);
    closeGameModal();
  };

  const handleMemoryFlip = (index) => {
    if (!gameState || gameState.type !== 'memory') return;
    if (gameState.flipped.includes(index) || gameState.matched.includes(index)) return;

    const nextFlipped = [...gameState.flipped, index];
    if (nextFlipped.length < 2) {
      setGameState({ ...gameState, flipped: nextFlipped });
      return;
    }

    const [a, b] = nextFlipped;
    const isMatch = gameState.cards[a] === gameState.cards[b];
    const nextMoves = gameState.moves + 1;

    if (isMatch) {
      const nextMatched = [...gameState.matched, a, b];
      if (nextMatched.length === gameState.cards.length) {
        const score = Math.max(65, 100 - nextMoves * 3);
        completeTask(activeGameTask.assignmentId, score);
        closeGameModal();
        return;
      }
      setGameState({ ...gameState, flipped: [], matched: nextMatched, moves: nextMoves });
      return;
    }

    setGameState({ ...gameState, flipped: nextFlipped, moves: nextMoves });
    setTimeout(() => {
      setGameState((prev) => (prev && prev.type === 'memory' ? { ...prev, flipped: [] } : prev));
    }, 700);
  };

  const submitColorChoice = (choice) => {
    if (!gameState || gameState.type !== 'color') return;
    const item = gameState.items[gameState.index];
    const nextCorrect = gameState.correct + (item.group === choice ? 1 : 0);
    const nextIndex = gameState.index + 1;
    if (nextIndex >= gameState.items.length) {
      finishQuizGame(nextCorrect, gameState.items.length);
      return;
    }
    setGameState({ ...gameState, index: nextIndex, correct: nextCorrect });
  };

  const submitNumberAnswer = () => {
    if (!gameState || gameState.type !== 'number') return;
    const current = gameState.questions[gameState.index];
    const isCorrect = Number(gameState.answer) === current.answer;
    const nextCorrect = gameState.correct + (isCorrect ? 1 : 0);
    const nextIndex = gameState.index + 1;
    if (nextIndex >= gameState.questions.length) {
      finishQuizGame(nextCorrect, gameState.questions.length);
      return;
    }
    setGameState({ ...gameState, index: nextIndex, correct: nextCorrect, answer: '' });
  };

  const submitOptionGame = (selected) => {
    if (!gameState) return;
    if (!['shape', 'story', 'emotion'].includes(gameState.type)) return;

    const current = gameState.questions[gameState.index];
    const answer = gameState.type === 'shape' ? current.target.name : gameState.type === 'emotion' ? current.label : current.answer;
    const nextCorrect = gameState.correct + (selected === answer ? 1 : 0);
    const nextIndex = gameState.index + 1;

    if (nextIndex >= gameState.questions.length) {
      finishQuizGame(nextCorrect, gameState.questions.length);
      return;
    }
    setGameState({ ...gameState, index: nextIndex, correct: nextCorrect });
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/child/feedback?childId=${profile.childId}`, { ...feedbackForm, feedbackType: 'GENERAL' });
      toast.success('Thanks for your feedback!');
      setShowFeedback(false);
      setFeedbackForm({ rating: 5, comment: '' });
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const downloadPrescription = async (p) => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Medical Prescription - ${p.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Open+Sans:wght@400;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Open Sans', sans-serif; color: #1a1a1a; padding: 0; }
    .page { width: 800px; margin: 0 auto; padding: 40px 50px; border: 2px solid #1e3a5f; min-height: 1100px; position: relative; background: #fff; }
    .header { text-align: center; border-bottom: 3px double #1e3a5f; padding-bottom: 20px; margin-bottom: 30px; }
    .hospital-name { font-family: 'Merriweather', serif; font-size: 28px; font-weight: 700; color: #1e3a5f; letter-spacing: 1px; }
    .hospital-tagline { font-size: 12px; color: #555; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; }
    .clinic-info { font-size: 11px; color: #666; margin-top: 6px; }
    .prescription-title { text-align: center; margin: 20px 0; }
    .prescription-title span { font-family: 'Merriweather', serif; font-size: 22px; font-style: italic; color: #1e3a5f; border-top: 2px solid #1e3a5f; border-bottom: 2px solid #1e3a5f; padding: 8px 40px; display: inline-block; }
    .rx-symbol { font-size: 60px; color: #c0392b; font-weight: bold; position: absolute; right: 50px; top: 130px; line-height: 1; }
    .patient-info { background: #f0f4f8; border: 1px solid #c0d0e0; border-radius: 4px; padding: 15px 20px; margin-bottom: 25px; }
    .patient-info h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #1e3a5f; margin-bottom: 8px; }
    .patient-info p { font-size: 14px; line-height: 1.6; }
    .info-row { display: flex; gap: 30px; }
    .medicine-section { margin-bottom: 30px; }
    .medicine-item { border: 1px solid #ddd; border-radius: 6px; padding: 18px 22px; margin-bottom: 15px; background: #fafafa; page-break-inside: avoid; }
    .medicine-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .medicine-name { font-family: 'Merriweather', serif; font-size: 17px; font-weight: 700; color: #1e3a5f; }
    .medicine-badge { background: #1e3a5f; color: white; font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 600; }
    .medicine-details { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .detail-item { }
    .detail-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 2px; }
    .detail-value { font-size: 14px; font-weight: 600; color: #333; }
    .instructions { background: #fff8e1; border-left: 4px solid #f39c12; padding: 12px 16px; margin-top: 10px; border-radius: 0 4px 4px 0; }
    .instructions p { font-size: 13px; color: #5d4037; font-style: italic; line-height: 1.5; }
    .doctor-section { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
    .doctor-info { margin-bottom: 10px; }
    .doctor-name { font-family: 'Merriweather', serif; font-size: 18px; font-weight: 700; color: #1e3a5f; }
    .doctor-spec { font-size: 13px; color: #666; margin-top: 2px; }
    .signature-area { margin-top: 40px; display: flex; justify-content: flex-end; }
    .signature-box { width: 220px; border-top: 1px solid #333; text-align: center; padding-top: 8px; }
    .signature-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .signature-dr { font-family: 'Merriweather', serif; font-size: 16px; font-style: italic; color: #1e3a5f; margin-top: 5px; }
    .footer { position: absolute; bottom: 20px; left: 50px; right: 50px; text-align: center; border-top: 1px solid #ddd; padding-top: 10px; }
    .footer p { font-size: 10px; color: #999; line-height: 1.6; }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 100px; color: rgba(0,0,0,0.03); font-weight: bold; pointer-events: none; z-index: 0; white-space: nowrap; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { border: 2px solid #1e3a5f !important; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="watermark">COGNICARE+</div>
  <div class="header">
    <div class="hospital-name">🏥 CogniCare+ Clinic</div>
    <div class="hospital-tagline">Pediatric Therapy &amp; Wellness Center</div>
    <div class="clinic-info">123 Wellness Avenue, Health City, HC 12345 | Tel: (555) 123-4567</div>
  </div>

  <div class="prescription-title">
    <span>📋 Medical Prescription</span>
  </div>

  <div class="rx-symbol">℞</div>

  <div class="patient-info">
    <h4>Patient Information</h4>
    <div class="info-row">
      <p><strong>Name:</strong> ${p.childName || 'N/A'}</p>
      <p><strong>Date:</strong> ${p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString()}</p>
    </div>
  </div>

  <div class="medicine-section">
    <div class="medicine-item">
      <div class="medicine-header">
        <div class="medicine-name">${p.title || 'Prescribed Medicine'}</div>
        <div class="medicine-badge">Rx</div>
      </div>
      <div class="medicine-details">
        <div class="detail-item">
          <div class="detail-label">Dosage</div>
          <div class="detail-value">${p.dosage || 'As directed'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Frequency</div>
          <div class="detail-value">${p.frequency || 'As prescribed'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Duration</div>
          <div class="detail-value">${p.startDate && p.endDate ? formatDate(p.startDate) + ' to ' + formatDate(p.endDate) : 'As directed'}</div>
        </div>
      </div>
      ${p.description ? `
      <div class="instructions">
        <p><strong>📝 Instructions:</strong> ${p.description}</p>
      </div>` : ''}
    </div>
  </div>

  <div class="doctor-section">
    <div class="doctor-info">
      <div class="doctor-name">${p.doctorName || 'Dr. Unknown'}</div>
      <div class="doctor-spec">${p.doctorSpecialization || 'Pediatric Specialist'}</div>
    </div>
    <div class="signature-area">
      <div class="signature-box">
        <div class="signature-label">Doctor's Signature</div>
        <div class="signature-dr">${p.doctorName || 'Dr. Unknown'}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>This prescription is valid for 30 days from the date of issue. | CogniCare+ Clinic | © ${new Date().getFullYear()}</p>
    <p>Keep this document for your records. Present to pharmacist with valid ID.</p>
  </div>
</div>
<script>
  function formatDate(d) {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  window.onload = function() { window.print(); }
</script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleAttendSession = async (sessionId) => {
    try {
      await api.post(`/api/child/session/${sessionId}/attend?childId=${profile.childId}`);
      toast.success('Session marked as attended');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark session attended');
    }
  };

  const getChatResponse = (input) => {
    const lower = input.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return "Hello there! 😊 How can I help you today?";
    if (lower.includes('task') || lower.includes('homework')) return "Check your dashboard — you have tasks assigned by your doctor! Complete them to earn points. 🎯";
    if (lower.includes('score') || lower.includes('point')) return `You have ${profile?.totalScore || 0} points! Keep completing tasks to earn more. ⭐`;
    if (lower.includes('streak') || lower.includes('day')) return `Your current streak is ${profile?.currentStreak || 0} days! Keep it up! 🔥`;
    if (lower.includes('level')) return `You're at Level ${profile?.level || 1}! Complete more tasks to level up. 📈`;
    if (lower.includes('vr') || lower.includes('video')) return "Check the VR Sessions section in the sidebar for videos your doctor assigned!";
    if (lower.includes('session') || lower.includes('doctor')) return "Your doctor schedules sessions for you. Check the Sessions section in your sidebar!";
    if (lower.includes('prescription') || lower.includes('medicine') || lower.includes('medicine')) return "Check Prescriptions in your sidebar for medicine details. You can download them as PDFs! 💊";
    if (lower.includes('reward') || lower.includes('badge')) return "Complete tasks to earn badges and rewards! Check the Rewards section to see what you've earned. 🏆";
    if (lower.includes('help')) return "I can help you with: tasks, scores, streaks, sessions, VR videos, prescriptions, and rewards. Just ask! 🤗";
    return "I'm not sure about that. Try asking about tasks, scores, streaks, sessions, or rewards! 🤔";
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { from: 'user', text: chatInput.trim() };
    const botMsg = { from: 'bot', text: getChatResponse(chatInput) };
    setChatMessages(prev => [...prev, userMsg, botMsg]);
    setChatInput('');
  };

  const handleMarkVideoWatched = async (assignmentId) => {
    try {
      await api.delete(`/api/child/vr/video/${assignmentId}?childId=${profile.childId}`);
      toast.success('Video marked as watched!');
      setShowVR(false);
      setSelectedVideo(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark video watched');
    }
  };

  const motivationalMessages = [
    "You're doing amazing! Keep going!",
    "Every step forward counts!",
    "You're a superstar!",
    "Believe in yourself!",
    "Great effort today!"
  ];
  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  const myPerformanceChartData = {
    labels: (performance?.points || []).map((point, idx) => `${idx + 1}. ${point.moduleName}`),
    datasets: [{
      label: 'My Score',
      data: (performance?.points || []).map((point) => point.score),
      borderColor: 'rgba(139, 92, 246, 1)',
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgba(249, 115, 22, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    }]
  };

  const triggerConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050714] text-white">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-10 w-72 h-72 bg-gradient-to-br from-orange-400/30 to-pink-500/20 blur-[120px] rounded-full animate-float" />
        <div className="absolute top-40 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-cyan-500/20 blur-[140px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/30 to-indigo-500/20 blur-[130px] rounded-full animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-gradient-to-br from-green-400/20 to-emerald-500/20 blur-[110px] rounded-full animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Glass Navbar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 mx-4 mt-4 px-6 py-4 glass-nav flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-glow">
            <span className="text-white font-black text-xl">🎮</span>
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-white">CogniCare+</p>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/60">My Quest Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFeedback(true)} 
            className="px-4 py-2 rounded-xl bg-white/10 text-white/80 hover:text-white flex items-center gap-2"
          >
            <Star className="w-4 h-4 text-yellow-300" /> Rate
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout} 
            className="px-4 py-2 rounded-xl bg-white/10 text-white/80 hover:text-white hover:bg-red-500/30 transition-colors"
          >
            Logout
          </motion.button>
        </div>
      </motion.nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Profile Section */}
        {profile && (
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative glass-card p-6 sm:p-8 overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 blur-[80px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-500/20 blur-[60px] rounded-full" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              {/* Avatar with progress ring */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 p-1 shadow-glow cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#050714] flex items-center justify-center group relative">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">{profile.firstName?.[0] || '🦸'}</span>
                    )}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <span className="text-white text-xs font-semibold">📷 Change</span>
                    </div>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfileImageUpload} className="hidden" />
                {/* Level badge */}
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-lg border-4 border-[#050714]"
                >
                  {profile.level || 1}
                </motion.div>
              </div>

              {/* Greeting & Info */}
              <div className="flex-1 text-center md:text-left">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-4xl font-black"
                >
                  Hey, <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">{profile.firstName}</span>! <Sparkles className="inline w-8 h-8 text-yellow-300" />
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-white/70 mt-2"
                >
                  {randomMessage}
                </motion.p>

                {/* Quick Stats Pills */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap justify-center md:justify-start gap-3 mt-5"
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/30 to-red-500/30 border border-orange-400/40">
                    <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                    <span className="font-bold text-orange-200">{profile.currentStreak || 0} Day Streak</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/40">
                    <Star className="w-5 h-5 text-purple-300" />
                    <span className="font-bold text-purple-200">Level {profile.level || 1}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/40">
                    <Trophy className="w-5 h-5 text-green-400" />
                    <span className="font-bold text-green-200">{profile.totalScore || 0} XP</span>
                  </div>
                </motion.div>
              </div>

              {/* Motivation Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.03 }}
                className="hidden lg:flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 min-w-[200px]"
              >
                <PartyPopper className="w-10 h-10 text-yellow-300 mb-3" />
                <p className="text-sm font-semibold text-center text-white/80">Keep going!</p>
                <p className="text-xs text-white/50 text-center mt-1">You're doing amazing</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={triggerConfetti}
                  className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold shadow-glow"
                >
                  🎉 Celebrate!
                </motion.button>
              </motion.div>
            </div>
          </motion.section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Tasks - Game Cards */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black">Today's Quests</h2>
              </div>
              
              {tasks.length === 0 ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="glass-card text-center py-12"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <p className="text-xl font-bold text-white">All quests completed!</p>
                  <p className="text-white/60 mt-2">You're a superstar! Keep resting.</p>
                </motion.div>
              ) : (
                <div className="grid gap-4">
                  {tasks.map((task, index) => (
                    <motion.div
                      key={task.assignmentId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="glass-card p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 group"
                    >
                      {/* Task Icon */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-glow transition-shadow">
                        <span className="text-3xl">
                          {task.moduleIcon === 'brain' ? '🧠' :
                           task.moduleIcon === 'palette' ? '🎨' :
                           task.moduleIcon === 'book' ? '📚' : '🎮'}
                        </span>
                      </div>
                      
                      {/* Task Info */}
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-bold">{task.moduleName || 'Activity'}</h3>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                            {task.moduleDurationMinutes || 0} min
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            task.difficultyLevel === 'HARD' ? 'bg-red-500/20 text-red-300' :
                            task.difficultyLevel === 'MEDIUM' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {task.difficultyLevel}
                          </span>
                        </div>
                      </div>
                      
                      {/* Start Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startTaskGame(task)}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold shadow-lg hover:shadow-glow transition-shadow flex items-center gap-2"
                      >
                        <Rocket className="w-4 h-4" /> Start!
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>

            {/* Performance Chart */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black">My Power Graph</h2>
              </div>
              <div className="glass-card p-6">
                {performance?.points?.length ? (
                  <>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm font-semibold">
                        Completed: {performance.completedGames}/{performance.totalGames}
                      </div>
                      <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-semibold">
                        Avg Score: {performance.averageScore}
                      </div>
                    </div>
                    <Line data={myPerformanceChartData} options={{ 
                      responsive: true, 
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'rgba(255,255,255,0.7)' } },
                        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.7)' } }
                      }
                    }} />
                  </>
                ) : (
                  <div className="text-center py-8 text-white/50">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Finish quests to build your power graph!</p>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Upcoming Sessions */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black">Upcoming Sessions</h2>
              </div>
              {sessions.length === 0 ? (
                <div className="glass-card text-center py-8 text-white/50">
                  <p>No sessions scheduled yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sessions.map((session) => (
                    <motion.div
                      key={session.sessionId}
                      whileHover={{ scale: 1.02 }}
                      className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <h3 className="text-lg font-bold">{session.sessionTitle}</h3>
                        <p className="text-sm text-white/60 mt-1">
                          {new Date(session.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-white/40 mt-1">{session.sessionType}</p>
                      </div>
                      <div className="flex gap-2">
                        {session.googleMeetLink && (
                          <a href={session.googleMeetLink} target="_blank" rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm hover:shadow-glow transition-shadow">
                            Join
                          </a>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAttendSession(session.sessionId)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm"
                        >
                          ✓ Attended
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>

            {/* Prescriptions */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black">My Prescriptions</h2>
              </div>
              {prescriptions.length === 0 ? (
                <div className="glass-card text-center py-8 text-white/50">
                  <p>No prescriptions yet 💊</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {prescriptions.map((p) => (
                    <motion.div
                      key={p.prescriptionId}
                      whileHover={{ scale: 1.02 }}
                      className="glass-card p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💊</span>
                          <div>
                            <h3 className="font-bold">{p.title}</h3>
                            <p className="text-xs text-white/60">{p.doctorName}</p>
                          </div>
                        </div>
                        <span className="text-sm px-2 py-1 rounded-lg bg-pink-500/20 text-pink-300 font-semibold">Rx</span>
                      </div>
                      <div className="space-y-1 text-sm text-white/70 mb-4">
                        {p.dosage && <p>💉 {p.dosage}</p>}
                        {p.frequency && <p>⏰ {p.frequency}</p>}
                        {p.description && <p className="text-xs text-white/50 mt-2">{p.description}</p>}
                      </div>
                      <div className="flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => downloadPrescription(p)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold"
                        >
                          🖨️ Print / Save PDF
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* VR Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              className="relative overflow-hidden glass-card p-6 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/30"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full" />
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <span>🥽</span> VR Adventures
                {vrVideoAssignments.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {vrVideoAssignments.length} New
                  </span>
                )}
              </h2>
              <p className="text-white/70 text-sm mb-4">Explore calming VR content!</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVR(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-glow"
              >
                Enter VR Mode 🚀
              </motion.button>
            </motion.div>

            {/* Rewards Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" /> My Badges
              </h2>
              {rewards.length === 0 ? (
                <p className="text-white/50 text-center py-4 text-sm">Complete quests to earn badges!</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {rewards.slice(0, 6).map((reward) => (
                    <motion.div
                      key={reward.rewardId}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/20"
                    >
                      <span className="text-3xl mb-1">
                        {reward.badgeIcon === 'fire' ? '🔥' :
                         reward.badgeIcon === 'star' ? '⭐' :
                         reward.badgeIcon === 'trophy' ? '🏆' : '🎖️'}
                      </span>
                      <p className="text-xs font-bold text-center text-white/80">{reward.badgeName}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" /> Top Heroes
              </h2>
              {leaderboard.length === 0 ? (
                <p className="text-white/50 text-center py-4 text-sm">Leaderboard is empty</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((entry) => (
                    <motion.div
                      key={entry.childId}
                      whileHover={{ scale: 1.03 }}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        profile?.childId === entry.childId 
                          ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-400/30' 
                          : 'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-white/60">#{entry.rank}</span>
                        <div>
                          <p className="font-semibold text-sm">{entry.childName}</p>
                          <p className="text-[10px] text-white/50">Lv.{entry.level} • 🔥{entry.currentStreak}</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm text-yellow-300">{entry.totalScore} XP</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {showVR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-4xl"
          >
            <button onClick={() => { setShowVR(false); setSelectedVideo(null); }} className="absolute -top-12 right-0 text-white text-3xl hover:text-red-400">✕</button>
            
            {selectedVideo ? (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                  <iframe
                    src={selectedVideo}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {(() => {
                  const match = vrVideoAssignments.find(v => v.youtubeUrl && selectedVideo.includes(v.youtubeUrl.split('v=')[1]));
                  return match && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMarkVideoWatched(match.assignmentId)}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg"
                    >
                      ✓ Mark as Watched
                    </motion.button>
                  );
                })()}
              </div>
            ) : (
              <div className="glass-card p-6 max-h-[80vh] overflow-y-auto">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span>🥽</span> VR Adventures
                </h3>
                
                {vrVideoAssignments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {vrVideoAssignments.map((v) => {
                      const embedUrl = v.youtubeUrl ? v.youtubeUrl.replace('watch?v=', 'embed/') : null;
                      if (!embedUrl) return null;
                      return (
                        <motion.button
                          key={v.assignmentId}
                          whileHover={{ scale: 1.03, y: -4 }}
                          onClick={() => setSelectedVideo(embedUrl)}
                          className="p-5 rounded-2xl text-left bg-gradient-to-br from-indigo-500/40 to-purple-500/40 border border-indigo-400/30 hover:border-indigo-400/60 transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <span className="text-4xl">🎬</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-lg">{v.videoTitle}</p>
                              {v.description && <p className="text-sm text-white/60 mt-1">{v.description}</p>}
                              {v.durationMinutes && <p className="text-xs text-white/40 mt-2">{v.durationMinutes} min</p>}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/50">
                    <p className="text-5xl mb-4">🥽</p>
                    <p className="text-lg">No VR videos assigned yet</p>
                    <p className="text-sm mt-2">Your doctor will assign VR videos for you!</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {activeGameTask && gameState && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card p-6 max-w-xl w-full border border-white/20"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                  {activeGameTask.moduleName}
                </h3>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeGameTask.difficultyLevel === 'HARD' ? 'bg-red-500/20 text-red-300' :
                    activeGameTask.difficultyLevel === 'MEDIUM' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {activeGameTask.difficultyLevel}
                  </span>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeGameModal} 
                className="text-white/60 hover:text-white text-xl"
              >
                ✕
              </motion.button>
            </div>

            {gameState.type === 'memory' && (
              <div>
                <p className="text-white/70 text-center mb-4">Find matching card pairs!</p>
                <div className="grid grid-cols-4 gap-3">
                  {gameState.cards.map((card, idx) => {
                    const open = gameState.flipped.includes(idx) || gameState.matched.includes(idx);
                    const matched = gameState.matched.includes(idx);
                    return (
                      <motion.button
                        key={`${card}-${idx}`}
                        whileHover={{ scale: open ? 1 : 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMemoryFlip(idx)}
                        className={`h-20 rounded-2xl text-3xl flex items-center justify-center transition-all ${
                          matched ? 'bg-gradient-to-br from-green-400/40 to-emerald-500/40 border border-green-400/40' :
                          open ? 'bg-gradient-to-br from-blue-400/40 to-purple-500/40 border border-blue-400/40' :
                          'bg-white/10 hover:bg-white/20 border border-white/20'
                        }`}
                      >
                        {open ? card : '❓'}
                      </motion.button>
                    );
                  })}
                </div>
                <p className="text-center text-white/40 text-sm mt-4">Moves: {gameState.moves}</p>
              </div>
            )}

            {gameState.type === 'color' && (
              <div>
                <p className="text-white/70 text-center mb-4">Choose the color category!</p>
                <div className="text-center py-6">
                  <p className="text-4xl font-black mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {gameState.items[gameState.index].color}
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {['Warm', 'Cool', 'Neutral'].map((c) => (
                      <motion.button
                        key={c}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => submitColorChoice(c)}
                        className={`px-4 py-3 rounded-xl font-bold ${
                          c === 'Warm' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                          c === 'Cool' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                          'bg-gradient-to-r from-gray-500 to-slate-500 text-white'
                        }`}
                      >
                        {c}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {gameState.type === 'number' && (
              <div>
                <p className="text-white/70 text-center mb-4">Complete the number pattern!</p>
                <p className="text-3xl font-bold text-center mb-6 text-white">{gameState.questions[gameState.index].text}</p>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={gameState.answer}
                    onChange={(e) => setGameState({ ...gameState, answer: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white text-center text-xl font-bold placeholder-white/40 focus:outline-none focus:ring-4 focus:ring-blue-400/30"
                    placeholder="?"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={submitNumberAnswer} 
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold"
                  >
                    Submit
                  </motion.button>
                </div>
              </div>
            )}

            {gameState.type === 'shape' && (
              <div>
                <p className="text-white/70 text-center mb-4">Select the correct shape name!</p>
                <motion.div 
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-center text-8xl mb-6"
                >
                  {gameState.questions[gameState.index].target.symbol}
                </motion.div>
                <div className="grid grid-cols-3 gap-3">
                  {gameState.questions[gameState.index].options.map((opt) => (
                    <motion.button
                      key={opt.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => submitOptionGame(opt.name)}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold"
                    >
                      {opt.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {gameState.type === 'story' && (
              <div>
                <p className="text-white/70 text-center mb-4">Choose the best ending!</p>
                <div className="glass-card p-4 mb-6 bg-white/5">
                  <p className="text-lg font-medium text-center">{gameState.questions[gameState.index].prompt}</p>
                </div>
                <div className="space-y-3">
                  {gameState.questions[gameState.index].options.map((opt) => (
                    <motion.button
                      key={opt}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => submitOptionGame(opt)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-400/30 hover:border-amber-400/60 font-medium transition-all"
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {gameState.type === 'emotion' && (
              <div>
                <p className="text-white/70 text-center mb-4">Identify the emotion!</p>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-center text-8xl mb-6"
                >
                  {gameState.questions[gameState.index].emoji}
                </motion.div>
                <div className="grid grid-cols-3 gap-3">
                  {gameState.questions[gameState.index].options.map((opt) => (
                    <motion.button
                      key={opt}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => submitOptionGame(opt)}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold"
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {gameState.type === 'focus' && (
              <div className="text-center py-6">
                <p className="text-white/70 mb-6">Stay focused and keep watching the timer!</p>
                <motion.div 
                  animate={{ scale: gameState.started ? [1, 1.05, 1] : 1 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                >
                  {gameState.remainingSeconds}s
                </motion.div>
                {!gameState.started ? (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGameState({ ...gameState, started: true })} 
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg shadow-glow"
                  >
                    🎯 Start Focus Timer
                  </motion.button>
                ) : (
                  <p className="text-white/60 animate-pulse">Timer running... You got this!</p>
                )}
              </div>
            )}

            {gameState.type === 'breathing' && (
              <div className="text-center py-6">
                <p className="text-white/70 mb-6">Follow the breathing circle - inhale and exhale slowly.</p>
                <motion.div 
                  animate={{ 
                    scale: gameState.started ? (gameState.phase === 'Inhale' ? [1, 1.3] : [1.3, 1]) : 1 
                  }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-6 shadow-glow"
                >
                  <span className="text-2xl font-bold text-white">{gameState.phase}</span>
                </motion.div>
                <p className="text-4xl font-bold text-cyan-300 mb-6">{gameState.remainingSeconds}s</p>
                {!gameState.started ? (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGameState({ ...gameState, started: true })} 
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg shadow-glow"
                  >
                    🌬️ Start Breathing
                  </motion.button>
                ) : (
                  <p className="text-white/60">Keep breathing calmly...</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {showFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-md w-full"
          >
            <h3 className="text-2xl font-black mb-4 text-center">How was your experience?</h3>
            <form onSubmit={submitFeedback} className="space-y-6">
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFeedbackForm({...feedbackForm, rating: star})}
                    className={`text-5xl transition-colors ${star <= feedbackForm.rating ? 'text-yellow-400' : 'text-white/20'}`}
                  >
                    ★
                  </motion.button>
                ))}
              </div>
              <textarea 
                value={feedbackForm.comment} 
                onChange={(e) => setFeedbackForm({...feedbackForm, comment: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/40 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 resize-none" 
                rows="3" 
                placeholder="Tell us what you think..." 
              />
              <div className="flex gap-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-glow"
                >
                  Submit ⭐
                </motion.button>
                <button type="button" onClick={() => setShowFeedback(false)} className="px-6 py-3 rounded-xl bg-white/10 text-white/80">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Chatbot Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl shadow-xl shadow-purple-500/30 z-40"
        title="Chat with CogniBot"
      >
        🤖
      </motion.button>

      {/* Chatbot Panel */}
      {showChatbot && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-24 right-6 w-80 sm:w-96 glass-card border border-white/20 rounded-2xl shadow-2xl z-40 flex flex-col max-h-[70vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <span className="text-xl">🤖</span>
              <div>
                <p className="font-bold text-sm">CogniBot</p>
                <p className="text-xs opacity-75">Your friendly assistant</p>
              </div>
            </div>
            <button onClick={() => setShowChatbot(false)} className="text-white hover:text-red-200 text-lg">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px] bg-white/5">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                  msg.from === 'user' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-md' 
                    : 'bg-white/20 text-white rounded-bl-md'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendChat}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm"
              >
                Send
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ChildDashboard;
