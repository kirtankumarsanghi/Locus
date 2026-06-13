import { useNavigate } from 'react-router-dom';

export default function Help() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl">help_center</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Help & Support</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Welcome to Locus Support. If you are experiencing issues with desk reservations, room bookings, or account access, please contact your university administrator or the library front desk.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Go Back
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">home</span>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
