import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [children, setChildren] = useState([]);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vrVideos, setVrVideos] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedChildPerformance, setSelectedChildPerformance] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [activeTab, setActiveTab] = useState('patients');
  const [showAssign, setShowAssign] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showVrVideo, setShowVrVideo] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [assignForm, setAssignForm] = useState({ childId: '', moduleId: '', difficultyLevel: 'EASY' });
  const [sessionForm, setSessionForm] = useState({ childId: '', sessionTitle: '', sessionType: 'VIDEO', googleMeetLink: '', scheduledAt: '', durationMinutes: 30, notes: '' });
  const [prescriptionForm, setPrescriptionForm] = useState({ childId: '', title: '', description: '', dosage: '', frequency: '', startDate: '', endDate: '' });
  const [vrVideoForm, setVrVideoForm] = useState({ childId: '', videoTitle: '', youtubeUrl: '', description: '', durationMinutes: '' });
  const [reportForm, setReportForm] = useState({ childId: '', reportTitle: '', reportContent: '', rating: 5 });

  useEffect(() => {
    if (!user?.userId) return;
    fetchData();
    const intervalId = setInterval(fetchData, 15000);
    return () => clearInterval(intervalId);
  }, [user?.userId]);

  const moduleStats = useMemo(() => {
    const statsMap = new Map();
    assignments.forEach((item) => {
      const current = statsMap.get(item.moduleName) || {
        moduleName: item.moduleName,
        assigned: 0,
        completed: 0,
        totalScore: 0,
        scoredCount: 0
      };
      current.assigned += 1;
      if (item.isCompleted) current.completed += 1;
      if (typeof item.score === 'number' && item.score > 0) {
        current.totalScore += item.score;
        current.scoredCount += 1;
      }
      statsMap.set(item.moduleName, current);
    });

    return Array.from(statsMap.values()).map((entry) => ({
      ...entry,
      avgScore: entry.scoredCount > 0 ? Math.round(entry.totalScore / entry.scoredCount) : 0
    }));
  }, [assignments]);

  const performanceChartData = {
    labels: (selectedChildPerformance?.points || []).map((point, idx) => `${idx + 1}. ${point.moduleName}`),
    datasets: [{
      label: 'Score',
      data: (selectedChildPerformance?.points || []).map((point) => point.score),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      tension: 0.3,
      fill: true,
    }]
  };

  const fetchData = async () => {
    try {
      const doctorRes = await api.get(`/api/doctor/profile?userId=${user.userId}`);
      const doctorData = doctorRes.data.data;
      setDoctor(doctorData);
      const [childrenRes, modulesRes, assignmentsRes, sessionsRes, prescriptionsRes, vrVideosRes, leaderboardRes] = await Promise.all([
        api.get(`/api/doctor/children?doctorId=${doctorData.doctorId}`),
        api.get('/api/doctor/modules'),
        api.get(`/api/doctor/assignments?doctorId=${doctorData.doctorId}`),
        api.get(`/api/doctor/sessions?doctorId=${doctorData.doctorId}`),
        api.get(`/api/doctor/prescriptions?doctorId=${doctorData.doctorId}`),
        api.get(`/api/doctor/vr/videos?doctorId=${doctorData.doctorId}`),
        api.get('/api/public/leaderboard')
      ]);
      const childrenData = childrenRes.data.data || [];
      setChildren(childrenData);
      setModules(modulesRes.data.data);
      setAssignments(assignmentsRes.data.data);
      setSessions(sessionsRes.data.data);
      setPrescriptions(prescriptionsRes.data.data);
      setVrVideos(vrVideosRes.data.data || []);
      const leaderboardData = leaderboardRes.data.data || [];
      setLeaderboard(leaderboardData);

      if (childrenData.length > 0) {
        const defaultChildId = selectedChildId || String(childrenData[0].childId);
        setSelectedChildId(defaultChildId);
        await fetchChildPerformance(defaultChildId);
      } else {
        setSelectedChildId('');
        setSelectedChildPerformance(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    }
  };

  const fetchChildPerformance = async (childId) => {
    if (!childId) return;
    try {
      const res = await api.get(`/api/public/child-performance/${childId}`);
      setSelectedChildPerformance(res.data.data);
    } catch (error) {
      toast.error('Failed to load performance graph');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      if (!assignForm.childId) {
        toast.error('Select a child first');
        return;
      }
      await api.post(`/api/doctor/assign-module?doctorId=${doctor.doctorId}`, {
        ...assignForm,
        childId: Number(assignForm.childId),
        moduleId: Number(assignForm.moduleId)
      });
      toast.success('Module assigned successfully!');
      setShowAssign(false);
      setAssignForm({ childId: '', moduleId: '', difficultyLevel: 'EASY' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign module');
    }
  };

  const handleScheduleSession = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/doctor/session?doctorId=${doctor.doctorId}`, {
        ...sessionForm,
        childId: Number(sessionForm.childId),
        durationMinutes: sessionForm.durationMinutes ? Number(sessionForm.durationMinutes) : null
      });
      toast.success('Session scheduled!');
      setShowSession(false);
      setSessionForm({ childId: '', sessionTitle: '', sessionType: 'VIDEO', googleMeetLink: '', scheduledAt: '', durationMinutes: 30, notes: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule session');
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/doctor/prescription?doctorId=${doctor.doctorId}`, {
        ...prescriptionForm,
        childId: Number(prescriptionForm.childId),
        startDate: prescriptionForm.startDate || null,
        endDate: prescriptionForm.endDate || null
      });
      toast.success('Prescription created!');
      setShowPrescription(false);
      setPrescriptionForm({ childId: '', title: '', description: '', dosage: '', frequency: '', startDate: '', endDate: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.delete(`/api/doctor/session/${sessionId}?doctorId=${doctor.doctorId}`);
      toast.success('Session deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete session');
    }
  };

  const handleDeletePrescription = async (prescriptionId) => {
    try {
      await api.delete(`/api/doctor/prescription/${prescriptionId}?doctorId=${doctor.doctorId}`);
      toast.success('Prescription deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete prescription');
    }
  };

  const handleAssignVrVideo = async (e) => {
    e.preventDefault();
    try {
      if (!vrVideoForm.childId) {
        toast.error('Select a child first');
        return;
      }
      if (!vrVideoForm.youtubeUrl) {
        toast.error('Enter a YouTube URL');
        return;
      }
      await api.post(`/api/doctor/vr/assign?doctorId=${doctor.doctorId}`, {
        ...vrVideoForm,
        childId: Number(vrVideoForm.childId),
        durationMinutes: vrVideoForm.durationMinutes ? Number(vrVideoForm.durationMinutes) : null
      });
      toast.success('Video assigned to child!');
      setShowVrVideo(false);
      setVrVideoForm({ childId: '', videoTitle: '', youtubeUrl: '', description: '', durationMinutes: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign video');
    }
  };

  const handleDeleteVrVideo = async (assignmentId) => {
    try {
      await api.delete(`/api/doctor/vr/video/${assignmentId}?doctorId=${doctor.doctorId}`);
      toast.success('Video deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete video');
    }
  };

  const handleSendReport = async (e) => {
    e.preventDefault();
    try {
      if (!reportForm.childId) {
        toast.error('Select a child first');
        return;
      }
      await api.post(`/api/doctor/report?doctorId=${doctor.doctorId}`, {
        childId: Number(reportForm.childId),
        reportTitle: reportForm.reportTitle,
        reportContent: reportForm.reportContent,
        rating: Number(reportForm.rating)
      });
      toast.success('Report sent to parent!');
      setShowReport(false);
      setReportForm({ childId: '', reportTitle: '', reportContent: '', rating: 5 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="font-display font-bold text-xl">CogniCare+ <span className="text-gray-400 text-sm">Doctor</span></span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Dr. {user?.firstName} {user?.lastName}</span>
              <button onClick={logout} className="text-gray-600 hover:text-red-600">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['patients', 'assignments', 'sessions', 'prescriptions', 'vr', 'reports', 'leaderboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-medium capitalize transition-colors ${
                activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'patients' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <div key={child.childId} className="card hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-2xl text-white">
                    {child.firstName[0]}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">{child.firstName} {child.lastName}</h3>
                    <p className="text-gray-500 text-sm">Level {child.level}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Streak:</span> {child.currentStreak} days</p>
                  <p><span className="text-gray-500">Score:</span> {child.totalScore} points</p>
                  <p><span className="text-gray-500">Diagnosis:</span> {child.diagnosis || 'N/A'}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => { setAssignForm({...assignForm, childId: child.childId}); setShowAssign(true); }}
                    className="flex-1 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 text-sm">
                    Assign Module
                  </button>
                  <button onClick={() => { setSessionForm({...sessionForm, childId: child.childId}); setShowSession(true); }}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm">
                    Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold text-lg">Therapy Modules</h3>
              <button onClick={() => {
                if (children.length === 0) {
                  toast.error('No assigned children yet. Ask admin to assign a child.');
                  return;
                }
                setShowAssign(true);
              }} className="btn-primary">Assign Module</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module) => (
                <div key={module.moduleId} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{module.icon === 'brain' ? '🧠' : module.icon === 'palette' ? '🎨' : '📚'}</span>
                    <h4 className="font-semibold">{module.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded ${
                      module.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                      module.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {module.difficulty}
                    </span>
                    <span>{module.durationMinutes} min</span>
                    <span>{module.pointsReward} pts</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="font-display font-semibold text-md mb-3">Module Results</h4>
              {moduleStats.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No module results yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2">Module</th>
                        <th>Assigned</th>
                        <th>Completed</th>
                        <th>Completion %</th>
                        <th>Avg Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moduleStats.map((m) => (
                        <tr key={m.moduleName} className="border-t">
                          <td className="py-2 font-medium">{m.moduleName}</td>
                          <td>{m.assigned}</td>
                          <td>{m.completed}</td>
                          <td>{m.assigned > 0 ? Math.round((m.completed * 100) / m.assigned) : 0}%</td>
                          <td>{m.avgScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h4 className="font-display font-semibold text-md mb-3">Recent Assigned Modules</h4>
              {assignments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No assignments yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2">Child</th>
                        <th>Module</th>
                        <th>Difficulty</th>
                        <th>Status</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((a) => (
                        <tr key={a.assignmentId} className="border-t">
                          <td className="py-2 font-medium">{a.childName}</td>
                          <td>{a.moduleName}</td>
                          <td>{a.difficultyLevel}</td>
                          <td>{a.isCompleted ? 'Completed' : 'Pending'}</td>
                          <td>{a.score || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold text-lg">Prescriptions</h3>
              <button onClick={() => setShowPrescription(true)} className="btn-primary">Add Prescription</button>
            </div>
            {prescriptions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No prescriptions yet. Create your first prescription for a patient.</p>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((p) => (
                  <div key={p.prescriptionId} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">{p.title}</h4>
                        <p className="text-sm text-gray-600">Child: {p.childName}</p>
                        <p className="text-sm text-gray-600">{p.description || 'No description'}</p>
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        <p>Dosage: {p.dosage || '-'}</p>
                        <p>Frequency: {p.frequency || '-'}</p>
                        {p.canDelete && (
                          <button
                            onClick={() => handleDeletePrescription(p.prescriptionId)}
                            className="mt-1 px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold text-lg">Scheduled Sessions</h3>
              <button onClick={() => setShowSession(true)} className="btn-primary">Schedule Session</button>
            </div>
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No sessions scheduled. Use the "Schedule" button on patient cards.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div key={s.sessionId} className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">{s.sessionTitle}</h4>
                        <p className="text-sm text-gray-600">Child: {s.childName}</p>
                        <p className="text-sm text-gray-600">{new Date(s.scheduledAt).toLocaleString()}</p>
                      </div>
                      <div className="text-sm text-gray-500 text-right flex flex-col items-end gap-1">
                        <p>{s.sessionType}</p>
                        <p>{s.durationMinutes || 0} min</p>
                        {s.googleMeetLink && (
                          <a href={s.googleMeetLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">Join link</a>
                        )}
                        {s.canDelete && (
                          <button
                            onClick={() => handleDeleteSession(s.sessionId)}
                            className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'vr' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold text-lg">VR Video Sessions</h3>
              <button onClick={() => setShowVrVideo(true)} className="btn-primary">Assign Video</button>
            </div>
            {vrVideos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No VR videos assigned yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2">Title</th>
                      <th>Child</th>
                      <th>YouTube URL</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vrVideos.map((v) => (
                      <tr key={v.assignmentId} className="border-t">
                        <td className="py-2 font-medium">{v.videoTitle}</td>
                        <td>{v.childName}</td>
                        <td>
                          <a href={v.youtubeUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 text-xs">
                            {v.youtubeUrl && v.youtubeUrl.length > 40 ? v.youtubeUrl.substring(0, 40) + '...' : v.youtubeUrl}
                          </a>
                        </td>
                        <td>{v.durationMinutes ? `${v.durationMinutes} min` : '-'}</td>
                        <td>
                          {v.isWatched ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">Watched</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">Pending</span>
                          )}
                        </td>
                        <td>
                          <button onClick={() => handleDeleteVrVideo(v.assignmentId)} className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold text-lg">Send Report to Parent</h3>
              <button onClick={() => setShowReport(true)} className="btn-primary">Send Report</button>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Send progress reports and updates directly to parents about their child's therapy journey.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-medium text-blue-800">Parent Reports</p>
              <p className="text-sm text-blue-600 mt-1">Click "Send Report" to create a new progress report for a parent.</p>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-display font-semibold text-lg mb-4">Global Child Leaderboard</h3>
              {leaderboard.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No ranking data available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2">Rank</th>
                        <th>Child</th>
                        <th>Level</th>
                        <th>Streak</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry) => (
                        <tr key={entry.childId} className="border-t">
                          <td className="py-2 font-semibold">#{entry.rank}</td>
                          <td>{entry.childName}</td>
                          <td>{entry.level}</td>
                          <td>{entry.currentStreak}</td>
                          <td>{entry.totalScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg">Child Performance Graph</h3>
                <select
                  value={selectedChildId}
                  onChange={(e) => {
                    setSelectedChildId(e.target.value);
                    fetchChildPerformance(e.target.value);
                  }}
                  className="input-field max-w-xs"
                >
                  {children.map((child) => (
                    <option key={child.childId} value={child.childId}>{child.firstName} {child.lastName}</option>
                  ))}
                </select>
              </div>
              {selectedChildPerformance?.points?.length ? (
                <>
                  <div className="mb-3 text-sm text-gray-600">
                    Completed: {selectedChildPerformance.completedGames} / {selectedChildPerformance.totalGames} | Avg Score: {selectedChildPerformance.averageScore}
                  </div>
                  <Line data={performanceChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">No completed game records for selected child</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-display text-xl font-semibold mb-4">Assign Module</h3>
            <form onSubmit={handleAssign} className="space-y-4">
              <select value={assignForm.childId} onChange={(e) => setAssignForm({...assignForm, childId: e.target.value})} className="input-field" required>
                <option value="">Select Child</option>
                {children.map((c) => <option key={c.childId} value={c.childId}>{c.firstName} {c.lastName}</option>)}
              </select>
              {children.length === 0 && (
                <div className="text-sm text-gray-500">No children assigned to you yet. Ask admin to assign one.</div>
              )}
              <select value={assignForm.moduleId} onChange={(e) => setAssignForm({...assignForm, moduleId: e.target.value})} className="input-field" required>
                <option value="">Select Module</option>
                {modules.map((m) => <option key={m.moduleId} value={m.moduleId}>{m.name}</option>)}
              </select>
              <select value={assignForm.difficultyLevel} onChange={(e) => setAssignForm({...assignForm, difficultyLevel: e.target.value})} className="input-field">
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Assign</button>
                <button type="button" onClick={() => setShowAssign(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-display text-xl font-semibold mb-4">Schedule Session</h3>
            <form onSubmit={handleScheduleSession} className="space-y-4">
              <select value={sessionForm.childId} onChange={(e) => setSessionForm({...sessionForm, childId: e.target.value})} className="input-field" required>
                <option value="">Select Child</option>
                {children.map((c) => <option key={c.childId} value={c.childId}>{c.firstName} {c.lastName}</option>)}
              </select>
              <input placeholder="Session Title" value={sessionForm.sessionTitle} onChange={(e) => setSessionForm({...sessionForm, sessionTitle: e.target.value})} className="input-field" required />
              <select value={sessionForm.sessionType} onChange={(e) => setSessionForm({...sessionForm, sessionType: e.target.value})} className="input-field">
                <option value="VIDEO">Video</option>
                <option value="IN_PERSON">In Person</option>
                <option value="VR">VR</option>
              </select>
              <input type="datetime-local" value={sessionForm.scheduledAt} onChange={(e) => setSessionForm({...sessionForm, scheduledAt: e.target.value})} className="input-field" required />
              <input type="number" min="15" step="5" placeholder="Duration (minutes)" value={sessionForm.durationMinutes} onChange={(e) => setSessionForm({...sessionForm, durationMinutes: e.target.value})} className="input-field" />
              <input placeholder="Google Meet Link" value={sessionForm.googleMeetLink} onChange={(e) => setSessionForm({...sessionForm, googleMeetLink: e.target.value})} className="input-field" />
              <textarea placeholder="Notes" value={sessionForm.notes} onChange={(e) => setSessionForm({...sessionForm, notes: e.target.value})} className="input-field" rows="2" />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Schedule</button>
                <button type="button" onClick={() => setShowSession(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-display text-xl font-semibold mb-4">Create Prescription</h3>
            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <select value={prescriptionForm.childId} onChange={(e) => setPrescriptionForm({...prescriptionForm, childId: e.target.value})} className="input-field" required>
                <option value="">Select Child</option>
                {children.map((c) => <option key={c.childId} value={c.childId}>{c.firstName} {c.lastName}</option>)}
              </select>
              <input placeholder="Title" value={prescriptionForm.title} onChange={(e) => setPrescriptionForm({...prescriptionForm, title: e.target.value})} className="input-field" required />
              <textarea placeholder="Description" value={prescriptionForm.description} onChange={(e) => setPrescriptionForm({...prescriptionForm, description: e.target.value})} className="input-field" rows="3" />
              <input placeholder="Dosage" value={prescriptionForm.dosage} onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})} className="input-field" />
              <input placeholder="Frequency" value={prescriptionForm.frequency} onChange={(e) => setPrescriptionForm({...prescriptionForm, frequency: e.target.value})} className="input-field" />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={prescriptionForm.startDate} onChange={(e) => setPrescriptionForm({...prescriptionForm, startDate: e.target.value})} className="input-field" />
                <input type="date" value={prescriptionForm.endDate} onChange={(e) => setPrescriptionForm({...prescriptionForm, endDate: e.target.value})} className="input-field" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowPrescription(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVrVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-display text-xl font-semibold mb-4">Assign VR Video</h3>
            <form onSubmit={handleAssignVrVideo} className="space-y-4">
              <select value={vrVideoForm.childId} onChange={(e) => setVrVideoForm({...vrVideoForm, childId: e.target.value})} className="input-field" required>
                <option value="">Select Child</option>
                {children.map((c) => <option key={c.childId} value={c.childId}>{c.firstName} {c.lastName}</option>)}
              </select>
              {children.length === 0 && (
                <div className="text-sm text-gray-500">No children assigned to you yet. Ask admin to assign one.</div>
              )}
              <input
                placeholder="Video Title (e.g. Ocean Exploration)"
                value={vrVideoForm.videoTitle}
                onChange={(e) => setVrVideoForm({...vrVideoForm, videoTitle: e.target.value})}
                className="input-field"
                required
              />
              <input
                placeholder="YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
                value={vrVideoForm.youtubeUrl}
                onChange={(e) => setVrVideoForm({...vrVideoForm, youtubeUrl: e.target.value})}
                className="input-field"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={vrVideoForm.description}
                onChange={(e) => setVrVideoForm({...vrVideoForm, description: e.target.value})}
                className="input-field"
                rows="2"
              />
              <input
                type="number"
                min="1"
                placeholder="Duration in minutes (optional)"
                value={vrVideoForm.durationMinutes}
                onChange={(e) => setVrVideoForm({...vrVideoForm, durationMinutes: e.target.value})}
                className="input-field"
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Assign Video</button>
                <button type="button" onClick={() => setShowVrVideo(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-display text-xl font-semibold mb-4">Send Report to Parent</h3>
            <form onSubmit={handleSendReport} className="space-y-4">
              <select value={reportForm.childId} onChange={(e) => setReportForm({...reportForm, childId: e.target.value})} className="input-field" required>
                <option value="">Select Child</option>
                {children.map((c) => <option key={c.childId} value={c.childId}>{c.firstName} {c.lastName}</option>)}
              </select>
              {children.length === 0 && (
                <div className="text-sm text-gray-500">No children assigned to you yet.</div>
              )}
              <input
                placeholder="Report Title (e.g. Monthly Progress Update)"
                value={reportForm.reportTitle}
                onChange={(e) => setReportForm({...reportForm, reportTitle: e.target.value})}
                className="input-field"
                required
              />
              <textarea
                placeholder="Write your detailed report for the parent here..."
                value={reportForm.reportContent}
                onChange={(e) => setReportForm({...reportForm, reportContent: e.target.value})}
                className="input-field"
                rows="5"
                required
              />
              <div>
                <label className="block text-sm font-medium mb-1">Overall Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReportForm({...reportForm, rating: star})}
                      className={`text-2xl ${star <= reportForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Send Report</button>
                <button type="button" onClick={() => setShowReport(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
