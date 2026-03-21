import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const ParentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [activity, setActivity] = useState(null);
  const [reports, setReports] = useState([]);
  const [expandedReport, setExpandedReport] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [credentials, setCredentials] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });
  const [childImages, setChildImages] = useState({});

  useEffect(() => {
    if (user?.userId) fetchChildren();
  }, [user]);

  useEffect(() => {
    if (!selectedChild) return;
    fetchChildData();
    const intervalId = setInterval(fetchChildData, 15000);
    return () => clearInterval(intervalId);
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const res = await api.get(`/api/parent/profile?userId=${user.userId}`);
      const parentData = res.data.data;
      if (parentData?.parentId) {
        const childrenRes = await api.get(`/api/parent/children?parentId=${parentData.parentId}`);
        setChildren(childrenRes.data.data);
        
        // Fetch profile images for all children
        const images = {};
        for (const child of childrenRes.data.data) {
          try {
            const imgRes = await api.get(`/api/child/profile-image/${child.childId}`, { responseType: 'blob' });
            images[child.childId] = URL.createObjectURL(imgRes.data);
          } catch {
            images[child.childId] = null;
          }
        }
        setChildImages(images);
        
        if (childrenRes.data.data.length > 0 && !selectedChild) {
          selectChild(childrenRes.data.data[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const selectChild = (child) => {
    setSelectedChild(child);
    setCredentials(null);
  };

  const fetchChildData = async () => {
    if (!selectedChild) return;
    try {
      const [statsRes, perfRes, actRes, repRes, sessRes, rewRes] = await Promise.all([
        api.get(`/api/parent/child/${selectedChild.childId}/stats`),
        api.get(`/api/parent/child/${selectedChild.childId}/performance`),
        api.get(`/api/parent/child/${selectedChild.childId}/activity`),
        api.get(`/api/parent/child/${selectedChild.childId}/reports`),
        api.get(`/api/parent/child/${selectedChild.childId}/sessions`),
        api.get(`/api/parent/child/${selectedChild.childId}/rewards`)
      ]);
      setStats(statsRes.data.data);
      setPerformance(perfRes.data.data);
      setActivity(actRes.data.data);
      setReports(repRes.data.data || []);
      setSessions(sessRes.data.data || []);
      setRewards(rewRes.data.data || []);
    } catch (error) {
      // silently handle - some endpoints may not exist yet
    }
  };

  const fetchCredentials = async () => {
    try {
      const res = await api.get(`/api/parent/child/${selectedChild.childId}/credentials`);
      setCredentials(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch credentials');
    }
  };

  const handleViewReport = async (report) => {
    setExpandedReport(expandedReport === report.feedbackId ? null : report.feedbackId);
    if (!report.seen && selectedChild) {
      try {
        await api.post(`/api/parent/child/${selectedChild.childId}/report/${report.feedbackId}/seen`);
        setReports(prev => prev.map(r => r.feedbackId === report.feedbackId ? { ...r, seen: true } : r));
      } catch (error) {
        // silently fail
      }
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      const parentRes = await api.get(`/api/parent/profile?userId=${user.userId}`);
      const parentId = parentRes.data.data.parentId;
      await api.post(`/api/parent/feedback?parentId=${parentId}`, {
        rating: feedbackForm.rating,
        comment: feedbackForm.comment
      });
      toast.success('Feedback submitted!');
      setShowFeedback(false);
      setFeedbackForm({ rating: 5, comment: '' });
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const performanceChartData = {
    labels: (performance?.points || []).map((p, i) => `#${i + 1}`),
    datasets: [{
      label: 'Score',
      data: (performance?.points || []).map(p => p.score),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 5,
      pointBackgroundColor: '#6366f1',
    }]
  };

  const progressChartData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [stats?.completedAssignments || 0, Math.max(0, (stats?.totalAssignments || 0) - (stats?.completedAssignments || 0))],
      backgroundColor: ['#10b981', '#e5e7eb'],
      borderWidth: 0,
    }]
  };

  const getActivityIcon = (type) => {
    if (type === 'TASK_COMPLETED') return '✅';
    if (type === 'SESSION') return '📅';
    if (type === 'PRESCRIPTION') return '💊';
    if (type === 'REWARD') return '🏆';
    return '📌';
  };

  const getActivityColor = (type) => {
    if (type === 'TASK_COMPLETED') return 'bg-green-50 border-green-200';
    if (type === 'SESSION') return 'bg-blue-50 border-blue-200';
    if (type === 'PRESCRIPTION') return 'bg-amber-50 border-amber-200';
    if (type === 'REWARD') return 'bg-yellow-50 border-yellow-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="font-display font-bold text-xl">CogniCare+ <span className="text-gray-400 text-sm">Parent</span></span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowFeedback(true)} className="px-3 py-1.5 text-yellow-600 hover:text-yellow-700 text-sm font-medium border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-all" title="Give Feedback">💬 Feedback</button>
              <span className="text-gray-600">Welcome, {user?.firstName}</span>
              <button onClick={logout} className="text-gray-600 hover:text-red-600">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children.length > 0 && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {children.map((child) => (
              <button
                key={child.childId}
                onClick={() => selectChild(child)}
                className={`flex items-center gap-3 px-5 py-3 rounded-xl whitespace-nowrap transition-all shadow-sm ${
                  selectedChild?.childId === child.childId
                    ? 'bg-primary-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {childImages[child.childId] ? (
                    <img src={childImages[child.childId]} alt={child.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-lg font-bold">
                      {child.firstName?.[0] || '👤'}
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-semibold">{child.firstName} {child.lastName}</p>
                  <p className={`text-xs ${selectedChild?.childId === child.childId ? 'text-primary-100' : 'text-gray-400'}`}>Level {child.level}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedChild && (
          <>
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              {['overview', 'activity', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-1 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="card bg-gradient-to-br from-orange-400 to-orange-500 text-white">
                    <p className="text-3xl mb-1">🔥</p>
                    <p className="text-2xl font-bold">{stats?.currentStreak || 0}</p>
                    <p className="text-orange-100 text-sm">Day Streak</p>
                  </div>
                  <div className="card bg-gradient-to-br from-green-400 to-green-500 text-white">
                    <p className="text-3xl mb-1">⭐</p>
                    <p className="text-2xl font-bold">{stats?.totalScore || 0}</p>
                    <p className="text-green-100 text-sm">Total Points</p>
                  </div>
                  <div className="card bg-gradient-to-br from-blue-400 to-blue-500 text-white">
                    <p className="text-3xl mb-1">📈</p>
                    <p className="text-2xl font-bold">Level {stats?.level || 1}</p>
                    <p className="text-blue-100 text-sm">Current Level</p>
                  </div>
                  <div className="card bg-gradient-to-br from-purple-400 to-purple-500 text-white">
                    <p className="text-3xl mb-1">🏆</p>
                    <p className="text-2xl font-bold">{stats?.completedAssignments || 0}/{stats?.totalAssignments || 0}</p>
                    <p className="text-purple-100 text-sm">Tasks Done</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 card">
                    <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="text-xl">📈</span> Performance Over Time
                    </h3>
                    {performance?.points?.length ? (
                      <>
                        <p className="text-sm text-gray-500 mb-3">
                          {performance.completedGames} games completed | Avg Score: {performance.averageScore}
                        </p>
                        <Line
                          data={performanceChartData}
                          options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: {
                              y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                              x: { grid: { display: false } }
                            }
                          }}
                        />
                      </>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <p className="text-4xl mb-2">📊</p>
                        <p>No performance data yet</p>
                        <p className="text-sm">Complete assigned tasks to see growth</p>
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <h3 className="font-display font-semibold text-lg mb-4">Task Progress</h3>
                    {stats?.totalAssignments > 0 ? (
                      <div className="flex flex-col items-center">
                        <Doughnut
                          data={progressChartData}
                          options={{
                            plugins: { legend: { display: false } },
                            cutout: '70%',
                          }}
                        />
                        <div className="text-center mt-2">
                          <p className="text-2xl font-bold text-green-600">{Math.round((stats.completedAssignments / stats.totalAssignments) * 100)}%</p>
                          <p className="text-sm text-gray-500">Complete</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-gray-400 py-8">No tasks assigned yet</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="text-xl">📅</span> Upcoming Sessions
                    </h3>
                    {sessions.length === 0 ? (
                      <p className="text-gray-400 text-center py-6">No upcoming sessions</p>
                    ) : (
                      <div className="space-y-3">
                        {sessions.slice(0, 4).map((s) => (
                          <div key={s.sessionId} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                            <span className="text-2xl">🎥</span>
                            <div className="flex-1">
                              <p className="font-medium">{s.sessionTitle}</p>
                              <p className="text-sm text-gray-500">{new Date(s.scheduledAt).toLocaleString()}</p>
                            </div>
                            {s.googleMeetLink && (
                              <a href={s.googleMeetLink} target="_blank" rel="noreferrer"
                                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                                Join
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="text-xl">🏆</span> Rewards Earned
                    </h3>
                    {rewards.length === 0 ? (
                      <p className="text-gray-400 text-center py-6">No rewards yet — complete tasks!</p>
                    ) : (
                      <div className="space-y-3">
                        {rewards.slice(0, 4).map((r) => (
                          <div key={r.rewardId} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
                            <span className="text-2xl">
                              {r.badgeIcon === 'fire' ? '🔥' : r.badgeIcon === 'star' ? '⭐' : r.badgeIcon === 'trophy' ? '🏆' : '🎖️'}
                            </span>
                            <div>
                              <p className="font-medium">{r.badgeName}</p>
                              <p className="text-xs text-gray-500">{r.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <span className="text-xl">🔐</span> Child Login Details
                  </h3>
                  {credentials ? (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <p className="text-sm text-gray-600">Username: <span className="font-semibold">{credentials.username || '-'}</span></p>
                      {credentials.alreadyShown ? (
                        <p className="text-sm text-gray-400 italic">Password already shown once.</p>
                      ) : (
                        <p className="text-sm text-gray-600">Password: <span className="font-semibold text-green-600">{credentials.tempPassword || '-'}</span></p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Click to view login credentials (shown only once)</p>
                      <button onClick={fetchCredentials} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
                        Show Login
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="card bg-gradient-to-br from-emerald-400 to-emerald-500 text-white">
                    <p className="text-3xl mb-1">✅</p>
                    <p className="text-2xl font-bold">{activity?.tasksCompletedToday || 0}</p>
                    <p className="text-emerald-100 text-sm">Tasks Today</p>
                  </div>
                  <div className="card bg-gradient-to-br from-amber-400 to-amber-500 text-white">
                    <p className="text-3xl mb-1">⏳</p>
                    <p className="text-2xl font-bold">{activity?.tasksRemaining || 0}</p>
                    <p className="text-amber-100 text-sm">Remaining</p>
                  </div>
                  <div className="card bg-gradient-to-br from-violet-400 to-violet-500 text-white">
                    <p className="text-3xl mb-1">⭐</p>
                    <p className="text-2xl font-bold">{activity?.scoreEarnedToday || 0}</p>
                    <p className="text-violet-100 text-sm">Points Today</p>
                  </div>
                  <div className="card bg-gradient-to-br from-sky-400 to-sky-500 text-white">
                    <p className="text-3xl mb-1">📅</p>
                    <p className="text-2xl font-bold">{activity?.sessionsToday || 0}</p>
                    <p className="text-sky-100 text-sm">Sessions Today</p>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <span className="text-xl">🕒</span> Today's Activity
                    <span className="ml-2 text-sm text-gray-400 font-normal">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </h3>
                  {activity?.recentActivity?.length > 0 ? (
                    <div className="space-y-3">
                      {activity.recentActivity.map((item, idx) => (
                        <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl border ${getActivityColor(item.type)}`}>
                          <span className="text-2xl mt-0.5">{getActivityIcon(item.type)}</span>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-sm text-gray-600">{item.description}</p>
                              </div>
                              <div className="text-right">
                                {item.score > 0 && (
                                  <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    +{item.score} pts
                                  </span>
                                )}
                                {item.timestamp && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-4xl mb-2">📭</p>
                      <p>No activity today</p>
                      <p className="text-sm">Tasks and sessions will appear here as they happen</p>
                    </div>
                  )}
                </div>

                <div className="card">
                  <h3 className="font-display font-semibold text-lg mb-4">Overall Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-orange-50 rounded-xl">
                      <p className="text-3xl font-bold text-orange-600">🔥 {activity?.currentStreak || 0}</p>
                      <p className="text-sm text-gray-500">Current Streak</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <p className="text-3xl font-bold text-green-600">⭐ {activity?.totalScore || 0}</p>
                      <p className="text-sm text-gray-500">Total Score</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <p className="text-3xl font-bold text-blue-600">📈 {activity?.level || 1}</p>
                      <p className="text-sm text-gray-500">Current Level</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                    <span className="text-xl">📋</span> Doctor Reports
                    {reports.filter(r => !r.seen).length > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {reports.filter(r => !r.seen).length} New
                      </span>
                    )}
                    {reports.filter(r => r.seen).length > 0 && (
                      <span className="ml-2 bg-gray-200 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">
                        {reports.filter(r => r.seen).length} Read
                      </span>
                    )}
                  </h3>
                  {reports.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-5xl mb-3">📄</p>
                      <p className="text-lg font-medium">No reports from doctor yet</p>
                      <p className="text-sm mt-1">Doctor reports will appear here when available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reports.map((report) => (
                        <div key={report.feedbackId}
                          className={`border rounded-2xl p-5 transition-all cursor-pointer hover:shadow-md ${
                            !report.seen
                              ? 'border-blue-300 bg-gradient-to-br from-white to-blue-50 shadow-sm'
                              : 'border-gray-200 bg-white opacity-75'
                          }`}
                          onClick={() => handleViewReport(report)}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {!report.seen && (
                                <span className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 mt-1"></span>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-semibold text-lg ${!report.seen ? 'text-blue-900' : 'text-gray-700'}`}>
                                    {report.reportTitle || 'Progress Report'}
                                  </h4>
                                  {!report.seen && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">NEW</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  {report.doctorName} • {new Date(report.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {report.rating && (
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className={`text-sm ${star <= report.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                  ))}
                                </div>
                              )}
                              <span className={`text-lg ${expandedReport === report.feedbackId ? 'rotate-180' : ''} transition-transform`}>
                                ▼
                              </span>
                            </div>
                          </div>

                          {expandedReport === report.feedbackId && (
                            <div className="mt-4 pt-4 border-t border-blue-100">
                              <div className="bg-white border border-blue-100 rounded-xl p-5">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{report.reportContent}</p>
                              </div>
                              {report.seen ? (
                                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">✓ Already read</p>
                              ) : (
                                <p className="text-xs text-blue-500 mt-3 font-medium flex items-center gap-1">✓ Marked as read</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {sessions.length > 0 && (
                  <div className="card">
                    <h3 className="font-display font-semibold text-lg mb-4">Session History</h3>
                    <div className="space-y-3">
                      {sessions.map((s) => (
                        <div key={s.sessionId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <span className="text-xl">📅</span>
                          <div className="flex-1">
                            <p className="font-medium">{s.sessionTitle}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(s.scheduledAt).toLocaleDateString()} • {s.sessionType}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            s.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            s.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {s.status || 'SCHEDULED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!selectedChild && children.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">👨‍👩‍👧</p>
            <p className="text-xl font-semibold">No children linked to your account</p>
            <p className="text-sm mt-2">Contact support to link your child's account</p>
          </div>
        )}
      </div>

      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💬</span>
              <div>
                <h3 className="font-display text-xl font-semibold">Submit Feedback to Admin</h3>
                <p className="text-sm text-gray-500">Your feedback helps us improve the platform</p>
              </div>
            </div>
            <form onSubmit={submitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">How would you rate our service?</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setFeedbackForm({...feedbackForm, rating: star})}
                      className={`text-3xl transition-transform hover:scale-110 ${star <= feedbackForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Feedback / Suggestions</label>
                <textarea value={feedbackForm.comment} onChange={(e) => setFeedbackForm({...feedbackForm, comment: e.target.value})}
                  className="input-field" rows="5" placeholder="Share your thoughts, suggestions, or concerns about your child's therapy experience..." />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Submit to Admin</button>
                <button type="button" onClick={() => setShowFeedback(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
