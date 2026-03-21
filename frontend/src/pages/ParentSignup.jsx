import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ParentSignup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    childFirstName: '',
    childLastName: '',
    childDateOfBirth: '',
    childGender: 'MALE',
    childDiagnosis: '',
    cognitiveLevel: '',
    doctorFeedback: '',
    questionnaireJson: ''
  });
  const [reportFile, setReportFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { parentSignup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = new FormData();
    payload.append('data', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
    if (reportFile) payload.append('report', reportFile);

    const result = await parentSignup(payload, true);
    
    if (result.success) {
      toast.success('Registration successful! Please wait for admin approval.');
      navigate('/login');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <span className="font-display font-bold text-3xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              CogniCare+
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-900">Parent Registration</h1>
          <p className="text-gray-600 mt-2">Register yourself and your child</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">Parent Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">Child Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Child's First Name *</label>
                  <input
                    type="text"
                    name="childFirstName"
                    value={formData.childFirstName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Child's Last Name *</label>
                  <input
                    type="text"
                    name="childLastName"
                    value={formData.childLastName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    name="childDateOfBirth"
                    value={formData.childDateOfBirth}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    name="childGender"
                    value={formData.childGender}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis (if any)</label>
                <textarea
                  name="childDiagnosis"
                  value={formData.childDiagnosis}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                  placeholder="Describe any cognitive conditions or concerns"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cognitive Level</label>
                <select
                  name="cognitiveLevel"
                  value={formData.cognitiveLevel}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select level</option>
                  <option value="MILD">Mild</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="SEVERE">Severe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Feedback</label>
                <input
                  type="text"
                  name="doctorFeedback"
                  value={formData.doctorFeedback}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Any notes from doctor"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cognitive Questionnaire (JSON)</label>
                <textarea
                  name="questionnaireJson"
                  value={formData.questionnaireJson}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                  placeholder='{"attention": "low", "memory": "moderate"}'
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Medical Report</label>
                <input
                  type="file"
                  onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                  className="input-field"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
            </div>
          </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentSignup;
