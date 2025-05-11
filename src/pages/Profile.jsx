import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, THEME_COLORS } from '../context/ThemeContext';
import { useUserRole } from '../context/UserRoleContext';
import { auth, db } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Profile = () => {
  const [user, loading] = useAuthState(auth);
  const { isDarkMode, themeColor, changeThemeColor, THEME_COLORS } = useTheme();
  const { userRole, isAdmin, isPaidUser, isFreeUser } = useUserRole();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9]+$/.test(value)) {
      setPhoneNumber(value);
    }
  };
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setEmail(user.email || '');
        setDisplayName(user.displayName || '');
        
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (userData.displayName) setDisplayName(userData.displayName);
            if (userData.email) setEmail(userData.email);
            if (userData.phoneNumber) setPhoneNumber(userData.phoneNumber);
            
            console.log('Dữ liệu người dùng từ Firestore:', userData);
          } else {
            console.log('Không tìm thấy dữ liệu người dùng trong Firestore');
            await setDoc(doc(db, 'users', user.uid), {
              displayName: user.displayName || '',
              email: user.email || '',
              phoneNumber: '',
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('Lỗi khi lấy thông tin người dùng:', err);
        }
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    try {
      if (phoneNumber.trim() && !isValidPhone(phoneNumber)) {
        throw new Error('Số điện thoại phải đúng định dạng , có đúng 10 chữ số');
      }

      if (user.displayName !== displayName) {
        await updateProfile(user, { displayName });
      }
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        email,
        phoneNumber,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      if (showPasswordFields) {
        if (newPassword !== confirmPassword) {
          throw new Error('Mật khẩu xác nhận không khớp với mật khẩu mới');
        }
        if (newPassword.length < 6 || newPassword.length > 12) {
          throw new Error('Mật khẩu phải có từ 6 đến 12 ký tự');
        }
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        await updatePassword(user, newPassword);
        
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordFields(false);
        
        setSuccess('Thông tin tài khoản và mật khẩu đã được cập nhật thành công!');
      } else {
        setSuccess('Thông tin tài khoản đã được cập nhật thành công!');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật thông tin:', err);
      setError(
        err.code === 'auth/wrong-password' ? 'Mật khẩu hiện tại không đúng' :
        err.code === 'auth/weak-password' ? 'Mật khẩu mới quá yếu' :
        err.message || 'Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-3">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold">Thông tin tài khoản</h2>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Chỉnh sửa thông tin cá nhân của bạn
          </p>
        </div>

        {success && (
          <div className={`mb-4 p-3 rounded ${isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'}`}>
            {success}
          </div>
        )}

        {error && (
          <div className={`mb-4 p-3 rounded ${isDarkMode ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-100 border-red-400 text-red-700'}`}>
            {error}
          </div>
        )}

        {/* Form thông tin cá nhân kết hợp với đổi mật khẩu */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
          {/* User Role Information */}
          <div className="mb-6 pb-6 border-b border-opacity-20 border-gray-500">
            <h3 className={`text-base font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Thông tin vai trò
            </h3>
            <div className="flex items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mr-2`}>
                Loại tài khoản:
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isAdmin 
                  ? isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                  : isPaidUser
                    ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                    : isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
              }`}>
                {isAdmin ? 'Quản trị viên' : isPaidUser ? 'Người dùng trả phí' : 'Người dùng miễn phí'}
              </span>
            </div>
            <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {isAdmin 
                ? 'Bạn có quyền quản trị trang web và quản lý tài khoản người dùng.'
                : isPaidUser
                  ? 'Bạn đang sử dụng tài khoản trả phí với đầy đủ tính năng.'
                  : 'Bạn đang sử dụng tài khoản miễn phí với các tính năng cơ bản.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email field - readonly */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  readOnly
                  className={`mt-1 block w-full px-3 py-2 border ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-700/50 text-gray-300' 
                      : 'border-gray-300 bg-gray-100 text-gray-500'
                  } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                />
                <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Email không thể thay đổi
                </p>
              </div>
              
              {/* Họ tên */}
              <div>
                <label htmlFor="displayName" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-700 text-white' 
                      : 'border-gray-300 text-gray-900'
                  } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                />
              </div>
              
              {/* Số điện thoại */}
              <div>
                <label htmlFor="phoneNumber" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Số điện thoại (10 chữ số)
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  placeholder="Nhập 10 chữ số"
                  className={`mt-1 block w-full px-3 py-2 border ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-700 text-white' 
                      : 'border-gray-300 text-gray-900'
                  } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                />
                <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Vui lòng nhập đúng 10 chữ số
                </p>
              </div>
              
              {/* Checkbox để hiện/ẩn phần đổi mật khẩu - đặt ngay sau phần số điện thoại */}
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="changePassword"
                  checked={showPasswordFields}
                  onChange={() => setShowPasswordFields(!showPasswordFields)}
                  className={`h-4 w-4 text-green-600 focus:ring-green-500 ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                  } rounded`}
                />
                <label htmlFor="changePassword" className={`ml-2 block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
                  Đổi mật khẩu
                </label>
              </div>
              
              {/* Phần đổi mật khẩu - chỉ hiển thị khi checkbox được chọn */}
              {showPasswordFields && (
                <div className={`space-y-4 mt-4 p-4 rounded-md ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h3 className={`text-md font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Thông tin mật khẩu
                  </h3>
                  
                  {/* Mật khẩu hiện tại */}
                  <div>
                    <label htmlFor="currentPassword" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        isDarkMode 
                          ? 'border-gray-700 bg-gray-700 text-white' 
                          : 'border-gray-300 text-gray-900'
                      } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      required={showPasswordFields}
                    />
                  </div>
                  
                  {/* Mật khẩu mới */}
                  <div>
                    <label htmlFor="newPassword" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Mật khẩu mới (6-12 ký tự)
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        isDarkMode 
                          ? 'border-gray-700 bg-gray-700 text-white' 
                          : 'border-gray-300 text-gray-900'
                      } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      required={showPasswordFields}
                    />
                  </div>
                  
                  {/* Xác nhận mật khẩu mới */}
                  <div>
                    <label htmlFor="confirmPassword" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 border ${
                        isDarkMode 
                          ? 'border-gray-700 bg-gray-700 text-white' 
                          : 'border-gray-300 text-gray-900'
                      } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      required={showPasswordFields}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)} 
                className={`px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                } focus:outline-none`}
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-green-700 hover:bg-green-800'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;