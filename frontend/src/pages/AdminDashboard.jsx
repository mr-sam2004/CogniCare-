import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingParents, setPendingParents] = useState([]);
  const [allParents, setAllParents] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [allChildren, setAllChildren] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedChildPerformance, setSelectedChildPerformance] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [unreadContactCount, setUnreadContactCount] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateDoctor, setShowCreateDoctor] = useState(false);
  const [showCreateChild, setShowCreateChild] = useState(false);
  const [showChildCreated, setShowChildCreated] = useState(false);
  const [childCreatedData, setChildCreatedData] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [activeEditModal, setActiveEditModal] = useState(null);
  const [doctorForm, setDoctorForm] = useState({ email: '', password: '', firstName: '', lastName: '', specialization: '', licenseNumber: '' });
  const [childForm, setChildForm] = useState({ email: '', password: '', firstName: '', lastName: '', dateOfBirth: '', parentId: '', doctorId: '' });
  const [parentEditForm, setParentEditForm] = useState({ parentId: null, firstName: '', lastName: '', phone: '', address: '', approvalStatus: 'PENDING' });
  const [doctorEditForm, setDoctorEditForm] = useState({ doctorId: null, firstName: '', lastName: '', email: '', specialization: '', phone: '', yearsOfExperience: '' });
  const [childEditForm, setChildEditForm] = useState({ childId: null, firstName: '', lastName: '', email: '', diagnosis: '', parentId: '', doctorId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, parentsRes, feedbackRes, allParentsRes, allDoctorsRes, allChildrenRes, leaderboardRes, contactsRes] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/pending-parents'),
        api.get('/api/admin/feedback'),
        api.get('/api/admin/parents'),
        api.get('/api/admin/doctors'),
        api.get('/api/admin/children'),
        api.get('/api/public/leaderboard'),
        api.get('/api/admin/contacts')
      ]);
      setStats(statsRes.data.data);
      setPendingParents(parentsRes.data.data);
      setFeedback(feedbackRes.data.data);
      setAllParents(allParentsRes.data.data);
      setContactMessages(contactsRes.data.data || []);
      setUnreadContactCount((contactsRes.data.data || []).filter(c => !c.isRead).length);
      setAllDoctors(allDoctorsRes.data.data);
      setAllChildren(allChildrenRes.data.data);
      const leaderboardData = leaderboardRes.data.data || [];
      setLeaderboard(leaderboardData);
      if (leaderboardData.length > 0) {
        const defaultChildId = selectedChildId || String(leaderboardData[0].childId);
        setSelectedChildId(defaultChildId);
        await fetchChildPerformance(defaultChildId);
      } else {
        setSelectedChildId('');
        setSelectedChildPerformance(null);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const fetchChildPerformance = async (childId) => {
    if (!childId) return;
    try {
      const res = await api.get(`/api/public/child-performance/${childId}`);
      setSelectedChildPerformance(res.data.data);
    } catch (error) {
      toast.error('Failed to load child performance');
    }
  };

  const handleApprove = async (parentId) => {
    try {
      await api.post(`/api/admin/approve-parent/${parentId}`);
      toast.success('Parent approved!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve parent');
    }
  };

  const handleReject = async (parentId) => {
    try {
      await api.post(`/api/admin/reject-parent/${parentId}`);
      toast.success('Parent rejected');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject parent');
    }
  };

  const openConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.onConfirm) return;
    try {
      await confirmDialog.onConfirm();
      setConfirmDialog({ open: false, title: '', message: '', onConfirm: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteParent = (parentId) => {
    openConfirmDialog(
      'Deactivate Parent',
      'This will deactivate the parent account and all linked child accounts.',
      async () => {
        await api.delete(`/api/admin/parent/${parentId}`);
        toast.success('Parent deactivated');
        fetchData();
      }
    );
  };

  const openParentEditModal = (parent) => {
    setParentEditForm({
      parentId: parent.parentId,
      firstName: parent.firstName || '',
      lastName: parent.lastName || '',
      phone: parent.phone || '',
      address: parent.address || '',
      approvalStatus: parent.approvalStatus || 'PENDING'
    });
    setActiveEditModal('parent');
  };

  const submitParentEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/admin/parent/${parentEditForm.parentId}`, {
        firstName: parentEditForm.firstName,
        lastName: parentEditForm.lastName,
        phone: parentEditForm.phone,
        address: parentEditForm.address,
        approvalStatus: parentEditForm.approvalStatus
      });
      toast.success('Parent updated');
      setActiveEditModal(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update parent');
    }
  };

  const openDoctorEditModal = (doctor) => {
    setDoctorEditForm({
      doctorId: doctor.doctorId,
      firstName: doctor.firstName || '',
      lastName: doctor.lastName || '',
      email: doctor.email || '',
      specialization: doctor.specialization || '',
      phone: doctor.phone || '',
      yearsOfExperience: doctor.yearsOfExperience || ''
    });
    setActiveEditModal('doctor');
  };

  const submitDoctorEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/admin/doctor/${doctorEditForm.doctorId}`, {
        firstName: doctorEditForm.firstName,
        lastName: doctorEditForm.lastName,
        email: doctorEditForm.email,
        specialization: doctorEditForm.specialization,
        phone: doctorEditForm.phone,
        yearsOfExperience: doctorEditForm.yearsOfExperience ? Number(doctorEditForm.yearsOfExperience) : null
      });
      toast.success('Doctor updated');
      setActiveEditModal(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update doctor');
    }
  };

  const handleDeleteDoctor = (doctorId) => {
    openConfirmDialog(
      'Deactivate Doctor',
      'This will deactivate the doctor account. Assigned children will be unassigned.',
      async () => {
        await api.delete(`/api/admin/doctor/${doctorId}`);
        toast.success('Doctor deactivated');
        fetchData();
      }
    );
  };

  const openChildEditModal = (child) => {
    setChildEditForm({
      childId: child.childId,
      firstName: child.firstName || '',
      lastName: child.lastName || '',
      email: child.email || '',
      diagnosis: child.diagnosis || '',
      parentId: child.parentId ? String(child.parentId) : '',
      doctorId: child.doctorId ? String(child.doctorId) : ''
    });
    setActiveEditModal('child');
  };

  const submitChildEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/admin/child/${childEditForm.childId}`, {
        firstName: childEditForm.firstName,
        lastName: childEditForm.lastName,
        email: childEditForm.email,
        diagnosis: childEditForm.diagnosis,
        parentId: childEditForm.parentId ? Number(childEditForm.parentId) : null,
        doctorId: childEditForm.doctorId ? Number(childEditForm.doctorId) : 0
      });
      toast.success('Child updated');
      setActiveEditModal(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update child');
    }
  };

  const handleDeleteChild = (childId) => {
    openConfirmDialog(
      'Deactivate Child',
      'This will deactivate the child account.',
      async () => {
        await api.delete(`/api/admin/child/${childId}`);
        toast.success('Child deactivated');
        fetchData();
      }
    );
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...doctorForm,
        yearsOfExperience: doctorForm.yearsOfExperience ? Number(doctorForm.yearsOfExperience) : undefined
      };
      await api.post('/api/admin/create-doctor', payload);
      toast.success('Doctor created successfully!');
      setShowCreateDoctor(false);
      setDoctorForm({ email: '', password: '', firstName: '', lastName: '', specialization: '', licenseNumber: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create doctor');
    }
  };

  const handleCreateChild = async (e) => {
    e.preventDefault();
    try {
      if (!childForm.parentId) {
        toast.error('Please select a parent');
        return;
      }

      const payload = {
        ...childForm,
        doctorId: childForm.doctorId ? Number(childForm.doctorId) : null
      };
      const res = await api.post('/api/admin/create-child', payload);
      toast.success('Child account created successfully!');
      setChildCreatedData(res.data.data);
      setShowChildCreated(true);
      setShowCreateChild(false);
      setChildForm({ email: '', password: '', firstName: '', lastName: '', dateOfBirth: '', parentId: '', doctorId: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create child account');
    }
  };

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Sessions',
      data: [12, 19, 15, 25, 22, 30, 28],
      borderColor: 'rgb(14, 165, 233)',
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      fill: true,
    }]
  };

  const childPerformanceChartData = {
    labels: (selectedChildPerformance?.points || []).map((point, idx) => `${idx + 1}. ${point.moduleName}`),
    datasets: [{
      label: 'Score',
      data: (selectedChildPerformance?.points || []).map((point) => point.score),
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      tension: 0.3,
      fill: true,
    }]
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
              <span className="font-display font-bold text-xl">CogniCare+ <span className="text-gray-400 text-sm">Admin</span></span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user?.firstName}</span>
              <button onClick={logout} className="text-gray-600 hover:text-red-600 transition-colors">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats && [
            { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'bg-blue-500' },
            { label: 'Parents', value: stats.totalParents, icon: '👨‍👩‍👧', color: 'bg-green-500' },
            { label: 'Doctors', value: stats.totalDoctors, icon: '👨‍⚕️', color: 'bg-purple-500' },
            { label: 'Children', value: stats.totalChildren, icon: '👶', color: 'bg-orange-500' },
          ].map((stat, i) => (
            <div key={i} className="card">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['dashboard', 'parents', 'doctors', 'children', 'contacts', 'leaderboard', 'feedback'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-medium capitalize transition-colors ${
                activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'parents' ? `Pending Parents (${stats?.pendingParents || 0})` : tab}
              {tab === 'contacts' && unreadContactCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadContactCount}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-display font-semibold text-lg mb-4">Weekly Sessions</h3>
              <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
            <div className="card">
              <h3 className="font-display font-semibold text-lg mb-4">User Distribution</h3>
              <Doughnut
                data={{
                  labels: ['Parents', 'Doctors', 'Children'],
                  datasets: [{
                    data: [stats?.totalParents || 0, stats?.totalDoctors || 0, stats?.totalChildren || 0],
                    backgroundColor: ['#10b981', '#8b5cf6', '#f97316'],
                  }]
                }}
                options={{ responsive: true }}
              />
            </div>
          </div>
        )}

        {activeTab === 'parents' && (
          <div className="card">
            <h3 className="font-display font-semibold text-lg mb-4">Pending Parent Approvals</h3>
            {pendingParents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingParents.map((parent) => (
                  <div key={parent.parentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold">{parent.firstName} {parent.lastName}</p>
                      <p className="text-sm text-gray-500">{parent.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(parent.parentId)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Approve</button>
                      <button onClick={() => handleReject(parent.parentId)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <h4 className="font-display font-semibold text-md mb-3">All Parents</h4>
              {allParents.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No parents found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2">Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allParents.map((p) => (
                        <tr key={p.parentId} className="border-t">
                          <td className="py-2 font-medium">{p.firstName} {p.lastName}</td>
                          <td>{p.email}</td>
                          <td>{p.phone || '-'}</td>
                          <td>
                            <span className={`px-2 py-1 rounded text-xs ${
                              p.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              p.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>{p.approvalStatus}</span>
                          </td>
                          <td className="py-2">
                            <div className="flex gap-2">
                               <button onClick={() => openParentEditModal(p)} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Edit</button>
                              <button onClick={() => handleDeleteParent(p.parentId)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Deactivate</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold text-lg">Manage Doctors</h3>
              <button onClick={() => setShowCreateDoctor(true)} className="btn-primary">Create Doctor</button>
            </div>
            {showCreateDoctor && (
              <form onSubmit={handleCreateDoctor} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Email" value={doctorForm.email} onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})} className="input-field" required />
                  <input type="password" placeholder="Password" value={doctorForm.password} onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})} className="input-field" required />
                  <input placeholder="First Name" value={doctorForm.firstName} onChange={(e) => setDoctorForm({...doctorForm, firstName: e.target.value})} className="input-field" required />
                  <input placeholder="Last Name" value={doctorForm.lastName} onChange={(e) => setDoctorForm({...doctorForm, lastName: e.target.value})} className="input-field" required />
                  <input placeholder="Specialization" value={doctorForm.specialization} onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})} className="input-field" />
                  <input placeholder="License Number" value={doctorForm.licenseNumber} onChange={(e) => setDoctorForm({...doctorForm, licenseNumber: e.target.value})} className="input-field" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">Create</button>
                  <button type="button" onClick={() => setShowCreateDoctor(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                </div>
              </form>
            )}

            <div className="mt-6">
              <h4 className="font-display font-semibold text-md mb-3">All Doctors</h4>
              {allDoctors.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No doctors found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2">Name</th>
                        <th>Email</th>
                        <th>Specialization</th>
                        <th>Phone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allDoctors.map((d) => (
                        <tr key={d.doctorId} className="border-t">
                          <td className="py-2 font-medium">{d.firstName} {d.lastName}</td>
                          <td>{d.email}</td>
                          <td>{d.specialization || '-'}</td>
                          <td>{d.phone || '-'}</td>
                          <td className="py-2">
                            <div className="flex gap-2">
                               <button onClick={() => openDoctorEditModal(d)} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Edit</button>
                              <button onClick={() => handleDeleteDoctor(d.doctorId)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Deactivate</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'children' && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-semibold text-lg">Manage Children</h3>
              <button onClick={() => setShowCreateChild(true)} className="btn-primary">Create Child Account</button>
            </div>
            {showCreateChild && (
              <form onSubmit={handleCreateChild} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input placeholder="Email" value={childForm.email} onChange={(e) => setChildForm({...childForm, email: e.target.value})} className="input-field" required />
                  <input type="password" placeholder="Password" value={childForm.password} onChange={(e) => setChildForm({...childForm, password: e.target.value})} className="input-field" required />
                  <input placeholder="First Name" value={childForm.firstName} onChange={(e) => setChildForm({...childForm, firstName: e.target.value})} className="input-field" required />
                  <input placeholder="Last Name" value={childForm.lastName} onChange={(e) => setChildForm({...childForm, lastName: e.target.value})} className="input-field" required />
                  <input type="date" value={childForm.dateOfBirth} onChange={(e) => setChildForm({...childForm, dateOfBirth: e.target.value})} className="input-field" required />
                  <select value={childForm.parentId} onChange={(e) => setChildForm({...childForm, parentId: e.target.value})} className="input-field" required>
                    <option value="">Select Parent</option>
                    {allParents.map((p) => (
                      <option key={p.parentId} value={p.parentId}>
                        {p.firstName} {p.lastName} (ID: {p.parentId})
                      </option>
                    ))}
                  </select>
                  <select value={childForm.doctorId} onChange={(e) => setChildForm({...childForm, doctorId: e.target.value})} className="input-field">
                    <option value="">Assign Doctor (optional)</option>
                    {allDoctors.map((d) => (
                      <option key={d.doctorId} value={d.doctorId}>
                        Dr. {d.firstName} {d.lastName} (ID: {d.doctorId})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">Create</button>
                  <button type="button" onClick={() => setShowCreateChild(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                </div>
              </form>
            )}

            <div className="mt-6">
              <h4 className="font-display font-semibold text-md mb-3">All Children</h4>
              {allChildren.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No children found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2">Name</th>
                        <th>Email</th>
                        <th>Parent ID</th>
                        <th>Doctor ID</th>
                        <th>Diagnosis</th>
                        <th>Level</th>
                        <th>Streak</th>
                        <th>Score</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allChildren.map((c) => (
                        <tr key={c.childId} className="border-t">
                          <td className="py-2 font-medium">{c.firstName} {c.lastName}</td>
                          <td>{c.email}</td>
                          <td>{c.parentId}</td>
                          <td>{c.doctorId || '-'}</td>
                          <td>{c.diagnosis || '-'}</td>
                          <td>{c.level}</td>
                          <td>{c.currentStreak}</td>
                          <td>{c.totalScore}</td>
                          <td className="py-2">
                            <div className="flex gap-2">
                               <button onClick={() => openChildEditModal(c)} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Edit</button>
                              <button onClick={() => handleDeleteChild(c.childId)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Deactivate</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-display font-semibold text-lg mb-4">Top Children Leaderboard</h3>
              {leaderboard.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No ranking data yet</p>
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
                  {leaderboard.map((entry) => (
                    <option key={entry.childId} value={entry.childId}>{entry.childName}</option>
                  ))}
                </select>
              </div>
              {selectedChildPerformance?.points?.length ? (
                <>
                  <div className="mb-3 text-sm text-gray-600">
                    Completed: {selectedChildPerformance.completedGames} / {selectedChildPerformance.totalGames} | Avg Score: {selectedChildPerformance.averageScore}
                  </div>
                  <Line data={childPerformanceChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">No completed game data for this child</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="card bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <div className="flex items-center gap-4">
                <span className="text-5xl">📬</span>
                <div>
                  <h3 className="font-display text-xl font-bold">Contact Messages</h3>
                  <p className="text-blue-200 text-sm mt-1">Messages from users via the Contact Us form</p>
                </div>
              </div>
            </div>

            {contactMessages.length === 0 ? (
              <div className="card text-center py-12 text-gray-400">
                <p className="text-5xl mb-3">📭</p>
                <p className="text-lg font-medium">No contact messages yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contactMessages.map((msg) => (
                  <div key={msg.messageId} className={`border rounded-2xl p-5 hover:shadow-md transition-all ${!msg.isRead ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white opacity-75'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {!msg.isRead && <span className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 mt-1"></span>}
                        <div>
                          <p className="font-semibold">{msg.name}</p>
                          <p className="text-sm text-gray-500">{msg.email} {msg.phone ? `• ${msg.phone}` : ''}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                    {msg.subject && <p className="font-medium text-gray-800 mb-1">{msg.subject}</p>}
                    <p className="text-gray-700 text-sm">{msg.message}</p>
                    {!msg.isRead && (
                      <button
                        onClick={async () => {
                          await api.post(`/api/admin/contact/${msg.messageId}/read`);
                          setContactMessages(prev => prev.map(m => m.messageId === msg.messageId ? {...m, isRead: true} : m));
                          setUnreadContactCount(prev => Math.max(0, prev - 1));
                        }}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="card bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
              <div className="flex items-center gap-4">
                <span className="text-5xl">💬</span>
                <div>
                  <h3 className="font-display text-xl font-bold">Parent Feedback</h3>
                  <p className="text-indigo-200 text-sm mt-1">Weekly feedback submitted by parents from their dashboard</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card bg-gradient-to-br from-yellow-400 to-amber-500 text-white">
                <p className="text-3xl mb-1">💬</p>
                <p className="text-2xl font-bold">{feedback.length}</p>
                <p className="text-yellow-100 text-sm">Total Feedback</p>
              </div>
              <div className="card bg-gradient-to-br from-green-400 to-emerald-500 text-white">
                <p className="text-3xl mb-1">⭐</p>
                <p className="text-2xl font-bold">{feedback.length > 0 ? Math.round(feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.filter(f => f.rating).length) : 0}</p>
                <p className="text-green-100 text-sm">Avg Rating</p>
              </div>
              <div className="card bg-gradient-to-br from-blue-400 to-blue-500 text-white">
                <p className="text-3xl mb-1">👨‍👩‍👧</p>
                <p className="text-2xl font-bold">{new Set(feedback.map(f => f.fromName)).size}</p>
                <p className="text-blue-100 text-sm">Unique Parents</p>
              </div>
            </div>

            <div className="card">
              <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                <span className="text-xl">📬</span> Parent Feedback
                {feedback.length > 0 && (
                  <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{feedback.length}</span>
                )}
              </h3>
              {feedback.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-5xl mb-3">📭</p>
                  <p className="text-lg font-medium">No parent feedback yet</p>
                  <p className="text-sm mt-1">Parents can submit weekly feedback from their dashboard</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map((fb) => (
                    <div key={fb.feedbackId} className="border border-indigo-100 rounded-2xl p-5 bg-gradient-to-br from-white to-indigo-50 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
                            {fb.fromName ? fb.fromName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-indigo-900">{fb.fromName || 'Unknown Parent'}</p>
                            <p className="text-xs text-indigo-400">Parent</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {fb.createdAt && (
                            <span className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          )}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={`text-base ${star <= (fb.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {fb.comment && (
                        <div className="bg-white border border-indigo-100 rounded-xl p-4 mt-2">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{fb.comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-display text-xl font-semibold mb-2">{confirmDialog.title}</h3>
            <p className="text-sm text-gray-600 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null })}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="button" onClick={handleConfirmAction} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {activeEditModal === 'parent' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
            <h3 className="font-display text-xl font-semibold mb-4">Edit Parent</h3>
            <form onSubmit={submitParentEdit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input value={parentEditForm.firstName} onChange={(e) => setParentEditForm({ ...parentEditForm, firstName: e.target.value })} className="input-field" placeholder="First Name" required />
                <input value={parentEditForm.lastName} onChange={(e) => setParentEditForm({ ...parentEditForm, lastName: e.target.value })} className="input-field" placeholder="Last Name" required />
                <input value={parentEditForm.phone} onChange={(e) => setParentEditForm({ ...parentEditForm, phone: e.target.value })} className="input-field" placeholder="Phone" />
                <select value={parentEditForm.approvalStatus} onChange={(e) => setParentEditForm({ ...parentEditForm, approvalStatus: e.target.value })} className="input-field">
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
              <textarea value={parentEditForm.address} onChange={(e) => setParentEditForm({ ...parentEditForm, address: e.target.value })} className="input-field min-h-[96px]" placeholder="Address" />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setActiveEditModal(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeEditModal === 'doctor' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
            <h3 className="font-display text-xl font-semibold mb-4">Edit Doctor</h3>
            <form onSubmit={submitDoctorEdit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input value={doctorEditForm.firstName} onChange={(e) => setDoctorEditForm({ ...doctorEditForm, firstName: e.target.value })} className="input-field" placeholder="First Name" required />
                <input value={doctorEditForm.lastName} onChange={(e) => setDoctorEditForm({ ...doctorEditForm, lastName: e.target.value })} className="input-field" placeholder="Last Name" required />
                <input type="email" value={doctorEditForm.email} onChange={(e) => setDoctorEditForm({ ...doctorEditForm, email: e.target.value })} className="input-field" placeholder="Email" required />
                <input value={doctorEditForm.specialization} onChange={(e) => setDoctorEditForm({ ...doctorEditForm, specialization: e.target.value })} className="input-field" placeholder="Specialization" />
                <input value={doctorEditForm.phone} onChange={(e) => setDoctorEditForm({ ...doctorEditForm, phone: e.target.value })} className="input-field" placeholder="Phone" />
                <input type="number" min="0" value={doctorEditForm.yearsOfExperience} onChange={(e) => setDoctorEditForm({ ...doctorEditForm, yearsOfExperience: e.target.value })} className="input-field" placeholder="Years of Experience" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setActiveEditModal(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeEditModal === 'child' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full">
            <h3 className="font-display text-xl font-semibold mb-4">Edit Child</h3>
            <form onSubmit={submitChildEdit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input value={childEditForm.firstName} onChange={(e) => setChildEditForm({ ...childEditForm, firstName: e.target.value })} className="input-field" placeholder="First Name" required />
                <input value={childEditForm.lastName} onChange={(e) => setChildEditForm({ ...childEditForm, lastName: e.target.value })} className="input-field" placeholder="Last Name" required />
                <input type="email" value={childEditForm.email} onChange={(e) => setChildEditForm({ ...childEditForm, email: e.target.value })} className="input-field" placeholder="Email" required />
                <input value={childEditForm.diagnosis} onChange={(e) => setChildEditForm({ ...childEditForm, diagnosis: e.target.value })} className="input-field" placeholder="Diagnosis" />
                <select value={childEditForm.parentId} onChange={(e) => setChildEditForm({ ...childEditForm, parentId: e.target.value })} className="input-field" required>
                  <option value="">Select Parent</option>
                  {allParents.map((p) => (
                    <option key={p.parentId} value={p.parentId}>{p.firstName} {p.lastName} (ID: {p.parentId})</option>
                  ))}
                </select>
                <select value={childEditForm.doctorId} onChange={(e) => setChildEditForm({ ...childEditForm, doctorId: e.target.value })} className="input-field">
                  <option value="">Unassign doctor</option>
                  {allDoctors.map((d) => (
                    <option key={d.doctorId} value={d.doctorId}>Dr. {d.firstName} {d.lastName} (ID: {d.doctorId})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setActiveEditModal(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showChildCreated && childCreatedData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-display text-xl font-semibold mb-2">Child Account Created</h3>
            <p className="text-sm text-gray-600 mb-4">Share these login details with the parent (shown once).</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Username</span>
                <span className="font-semibold">{childCreatedData.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Temp Password</span>
                <span className="font-semibold">{childCreatedData.tempPassword}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowChildCreated(false)}
                className="btn-primary flex-1"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
