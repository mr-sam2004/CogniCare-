import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

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
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.25)',
      fill: true,
      tension: 0.3,
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="font-display font-bold text-xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                CogniCare+
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowFeedback(true)} className="text-yellow-500 hover:text-yellow-600 text-xl">⭐</button>
              <button onClick={logout} className="text-gray-600 hover:text-red-600">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profile && (
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl text-white shadow-xl overflow-hidden cursor-pointer group"
                   onClick={() => fileInputRef.current?.click()}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    {profile.firstName?.[0] || '👤'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <span className="text-white text-sm">📷 Upload</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
              />
            </div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
              Hey, {profile.firstName}! {profile.firstName?.[0] === 'A' ? '🎉' : '✨'}
            </h1>
            <p className="text-gray-600 text-lg mb-4">{randomMessage}</p>
            <div className="flex justify-center gap-4">
              <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold">
                🔥 {profile.currentStreak} Day Streak
              </div>
              <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold">
                ⭐ Level {profile.level}
              </div>
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                🏆 {profile.totalScore} Points
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span> Today's Tasks
              </h2>
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-4">🎉</p>
                  <p className="text-gray-600">All tasks completed! Great job!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.assignmentId} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">
                          {task.moduleIcon === 'brain' ? '🧠' :
                           task.moduleIcon === 'palette' ? '🎨' :
                           task.moduleIcon === 'book' ? '📚' : '🎮'}
                        </span>
                        <div>
                          <h3 className="font-semibold">{task.moduleName || 'Activity'}</h3>
                          <p className="text-sm text-gray-500">{task.moduleDurationMinutes || 0} minutes • {task.difficultyLevel}</p>
                        </div>
                      </div>
                      <button onClick={() => startTaskGame(task)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                        Start!
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card mb-6">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📈</span> My Game Performance
              </h2>
              {performance?.points?.length ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">Completed: {performance.completedGames}/{performance.totalGames} | Avg Score: {performance.averageScore}</p>
                  <Line data={myPerformanceChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </>
              ) : (
                <p className="text-gray-500 text-center py-4">Finish assigned modules to build your performance graph.</p>
              )}
            </div>

            <div className="card">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📹</span> Upcoming Sessions
              </h2>
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No sessions scheduled</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.sessionId} className="p-4 bg-blue-50 rounded-xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{session.sessionTitle}</h3>
                          <p className="text-sm text-gray-600">{new Date(session.scheduledAt).toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{session.sessionType}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {session.googleMeetLink && (
                            <a href={session.googleMeetLink} target="_blank" rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                              Join
                            </a>
                          )}
                          <button
                            onClick={() => handleAttendSession(session.sessionId)}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                          >
                            Attended
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card mt-6">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">💊</span> My Prescriptions
              </h2>
              {prescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">💊</p>
                  <p className="text-gray-500">No prescriptions yet</p>
                  <p className="text-sm text-gray-400">Your doctor will prescribe medicines here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prescriptions.map((p) => (
                    <div key={p.prescriptionId} className="border-2 border-dashed border-blue-200 rounded-2xl p-5 bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🏥</span>
                          <div>
                            <h3 className="font-display font-bold text-blue-900">{p.title}</h3>
                            <p className="text-xs text-blue-600">{p.doctorName} {p.doctorSpecialization ? `• ${p.doctorSpecialization}` : ''}</p>
                          </div>
                        </div>
                        <span className="text-3xl text-red-500 font-bold">℞</span>
                      </div>

                      <div className="space-y-2 mb-4">
                        {p.dosage && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-blue-400">💉</span>
                            <span className="text-gray-600"><span className="font-medium">Dosage:</span> {p.dosage}</span>
                          </div>
                        )}
                        {p.frequency && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-blue-400">⏰</span>
                            <span className="text-gray-600"><span className="font-medium">Frequency:</span> {p.frequency}</span>
                          </div>
                        )}
                        {p.startDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-blue-400">📅</span>
                            <span className="text-gray-600"><span className="font-medium">Duration:</span> {formatDate(p.startDate)} {p.endDate ? `to ${formatDate(p.endDate)}` : ''}</span>
                          </div>
                        )}
                        {p.description && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-800"><span className="font-semibold">📝 Note:</span> {p.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-blue-100">
                        <p className="text-xs text-gray-400">{p.createdAt ? formatDate(p.createdAt) : ''}</p>
                        <button
                          onClick={() => downloadPrescription(p)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium shadow-md hover:shadow-lg transition-all"
                        >
                          <span>🖨️</span> Print / Save PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="card mb-6 bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🥽</span> VR Sessions
                {vrVideoAssignments.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{vrVideoAssignments.length} New</span>
                )}
              </h2>
              <p className="text-purple-100 mb-4">Relax and explore calming VR content!</p>
              <button onClick={() => setShowVR(true)}
                className="w-full py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all">
                Enter VR Mode
              </button>
            </div>

            <div className="card">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🏆</span> My Rewards
              </h2>
              {rewards.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Complete tasks to earn rewards!</p>
              ) : (
                <div className="space-y-3">
                  {rewards.slice(0, 5).map((reward) => (
                    <div key={reward.rewardId} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
                      <span className="text-2xl">
                        {reward.badgeIcon === 'fire' ? '🔥' :
                         reward.badgeIcon === 'star' ? '⭐' :
                         reward.badgeIcon === 'trophy' ? '🏆' : '🎖️'}
                      </span>
                      <div>
                        <h4 className="font-semibold">{reward.badgeName}</h4>
                        <p className="text-xs text-gray-500">{reward.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card mt-6">
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🥇</span> Leaderboard
              </h2>
              {leaderboard.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Leaderboard is empty</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((entry) => (
                    <div key={entry.childId} className={`flex items-center justify-between p-3 rounded-xl ${profile?.childId === entry.childId ? 'bg-emerald-100' : 'bg-gray-50'}`}>
                      <div>
                        <p className="font-semibold">#{entry.rank} {entry.childName}</p>
                        <p className="text-xs text-gray-500">Level {entry.level} • Streak {entry.currentStreak}</p>
                      </div>
                      <p className="font-bold text-gray-700">{entry.totalScore} pts</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showVR && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="absolute top-4 right-4 z-10">
            <button onClick={() => { setShowVR(false); setSelectedVideo(null); }} className="text-white text-3xl hover:text-red-400">✕</button>
          </div>
          <div className="w-full max-w-4xl w-full px-4">
            {selectedVideo ? (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-xl overflow-hidden">
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
                    <button
                      onClick={() => handleMarkVideoWatched(match.assignmentId)}
                      className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
                    >
                      Mark as Watched
                    </button>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-6 max-h-[85vh] overflow-y-auto">
                {vrVideoAssignments.length > 0 && (
                  <div>
                    <h3 className="text-white font-display font-semibold text-lg mb-3">My VR Videos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {vrVideoAssignments.map((v) => {
                        const embedUrl = v.youtubeUrl ? v.youtubeUrl.replace('watch?v=', 'embed/') : null;
                        if (!embedUrl) return null;
                        return (
                          <button key={v.assignmentId}
                            onClick={() => setSelectedVideo(embedUrl)}
                            className="p-4 rounded-xl text-left transition-all bg-purple-600 hover:bg-purple-500 text-white">
                            <div className="flex items-start gap-3">
                              <span className="text-3xl">🎬</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold">{v.videoTitle}</p>
                                {v.description && <p className="text-sm opacity-75 mt-1">{v.description}</p>}
                                {v.durationMinutes && <p className="text-xs mt-1 opacity-60">{v.durationMinutes} min</p>}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {vrVideoAssignments.length === 0 && (
                  <div className="text-center text-white/60 py-12">
                    <p className="text-4xl mb-4">🥽</p>
                    <p>No VR videos assigned yet.</p>
                    <p className="text-sm mt-2">Your doctor will assign VR videos for you.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeGameTask && gameState && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-xl font-semibold">{activeGameTask.moduleName}</h3>
                <p className="text-sm text-gray-500">Difficulty: {activeGameTask.difficultyLevel}</p>
              </div>
              <button onClick={closeGameModal} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            {gameState.type === 'memory' && (
              <div>
                <p className="text-sm text-gray-600 mb-3">Find matching card pairs.</p>
                <div className="grid grid-cols-4 gap-2">
                  {gameState.cards.map((card, idx) => {
                    const open = gameState.flipped.includes(idx) || gameState.matched.includes(idx);
                    return (
                      <button
                        key={`${card}-${idx}`}
                        onClick={() => handleMemoryFlip(idx)}
                        className="h-16 rounded-lg border bg-gray-50 text-2xl hover:bg-gray-100"
                      >
                        {open ? card : '❓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {gameState.type === 'color' && (
              <div>
                <p className="text-sm text-gray-600 mb-3">Choose the color category.</p>
                <div className="text-center py-6">
                  <p className="text-3xl font-bold mb-4">{gameState.items[gameState.index].color}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['Warm', 'Cool', 'Neutral'].map((c) => (
                      <button key={c} onClick={() => submitColorChoice(c)} className="px-3 py-2 rounded-lg bg-sky-100 text-sky-800 hover:bg-sky-200">
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {gameState.type === 'number' && (
              <div>
                <p className="text-sm text-gray-600 mb-3">Complete the number pattern.</p>
                <p className="text-2xl font-semibold mb-4">{gameState.questions[gameState.index].text}</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={gameState.answer}
                    onChange={(e) => setGameState({ ...gameState, answer: e.target.value })}
                    className="input-field"
                    placeholder="Enter missing number"
                  />
                  <button onClick={submitNumberAnswer} className="btn-primary">Submit</button>
                </div>
              </div>
            )}

            {gameState.type === 'shape' && (
              <div>
                <p className="text-sm text-gray-600 mb-3">Select the correct shape name.</p>
                <div className="text-center text-6xl mb-4">{gameState.questions[gameState.index].target.symbol}</div>
                <div className="grid grid-cols-3 gap-2">
                  {gameState.questions[gameState.index].options.map((opt) => (
                    <button key={opt.name} onClick={() => submitOptionGame(opt.name)} className="px-3 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameState.type === 'story' && (
              <div>
                <p className="text-sm text-gray-600 mb-3">Choose the best ending.</p>
                <p className="font-medium mb-4">{gameState.questions[gameState.index].prompt}</p>
                <div className="space-y-2">
                  {gameState.questions[gameState.index].options.map((opt) => (
                    <button key={opt} onClick={() => submitOptionGame(opt)} className="w-full text-left px-3 py-2 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameState.type === 'emotion' && (
              <div>
                <p className="text-sm text-gray-600 mb-3">Identify the emotion.</p>
                <div className="text-center text-6xl mb-4">{gameState.questions[gameState.index].emoji}</div>
                <div className="grid grid-cols-3 gap-2">
                  {gameState.questions[gameState.index].options.map((opt) => (
                    <button key={opt} onClick={() => submitOptionGame(opt)} className="px-3 py-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameState.type === 'focus' && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-3">Stay focused and keep watching the timer.</p>
                <p className="text-5xl font-bold text-blue-700 mb-4">{gameState.remainingSeconds}s</p>
                {!gameState.started ? (
                  <button onClick={() => setGameState({ ...gameState, started: true })} className="btn-primary">Start Focus Timer</button>
                ) : (
                  <p className="text-sm text-gray-500">Timer running...</p>
                )}
              </div>
            )}

            {gameState.type === 'breathing' && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-3">Follow breathing: inhale and exhale slowly.</p>
                <div className="w-40 h-40 mx-auto rounded-full bg-cyan-100 flex items-center justify-center mb-4">
                  <span className="text-2xl font-semibold text-cyan-700">{gameState.phase}</span>
                </div>
                <p className="text-3xl font-bold text-cyan-700 mb-4">{gameState.remainingSeconds}s</p>
                {!gameState.started ? (
                  <button onClick={() => setGameState({ ...gameState, started: true })} className="btn-primary">Start Breathing</button>
                ) : (
                  <p className="text-sm text-gray-500">Keep breathing calmly...</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-display text-xl font-semibold mb-4">How was your experience?</h3>
            <form onSubmit={submitFeedback} className="space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setFeedbackForm({...feedbackForm, rating: star})}
                    className={`text-4xl ${star <= feedbackForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </button>
                ))}
              </div>
              <textarea value={feedbackForm.comment} onChange={(e) => setFeedbackForm({...feedbackForm, comment: e.target.value})}
                className="input-field" rows="3" placeholder="Tell us what you think..." />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Submit</button>
                <button type="button" onClick={() => setShowFeedback(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chatbot Floating Button */}
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all z-40"
        title="Chat with CogniBot"
      >
        🤖
      </button>

      {/* Chatbot Panel */}
      {showChatbot && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 flex flex-col max-h-[70vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <span className="text-xl">🤖</span>
              <div>
                <p className="font-semibold text-sm">CogniBot</p>
                <p className="text-xs opacity-75">Your friendly assistant</p>
              </div>
            </div>
            <button onClick={() => setShowChatbot(false)} className="text-white hover:text-red-200 text-lg">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.from === 'user' ? 'bg-indigo-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSendChat}
                className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 text-sm font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildDashboard;
