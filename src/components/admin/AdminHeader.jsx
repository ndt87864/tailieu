import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { auth } from '../../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import ThemeColorPicker from '../ThemeColorPicker';

const AdminHeader = ({ title }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [screenSize, setScreenSize] = useState('small'); 
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsCollapsed(width < 1280 && width >= 770);
      
      if (width < 770) {
        setScreenSize('small');
      } else if (width >= 770 && width < 1280) {
        setScreenSize('medium');
      } else {
        setScreenSize('large');
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    auth.signOut();
    setIsDropdownOpen(false);
  };
  const handleAccountClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };
  const handleThemeClick = () => {
    setIsDropdownOpen(false);
    setIsThemePickerOpen(true);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const headerClasses = `
    ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'} 
    border-b py-4 px-6 fixed top-0 right-0 z-30
    ${windowWidth >= 770 ? (isCollapsed ? 'left-16' : 'left-72') : 'left-0'}
  `;

  return (
    <>
      <header className={headerClasses}>
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">{title || 'Quản trị hệ thống'}</h1>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                {user.email}
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'} flex items-center justify-center`}>
                  {user.photoURL ? (
                    <img src={user.photoURL} className="w-8 h-8 rounded-full" alt={user.displayName || 'Ảnh đại diện'} />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="font-medium">
                  {user.displayName ? user.displayName.split(' ')[0] : 'Tài khoản'}
                </span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
                {isDropdownOpen && (
                <div 
                  className={`absolute right-0 mt-2 w-48 py-1 rounded-md shadow-lg z-10 border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                  style={{ backdropFilter: 'blur(0px)', backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' }}
                >
                  <button
                    onClick={handleAccountClick}
                    className={`block w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Tài khoản của tôi
                  </button>
                  
                  {screenSize === 'medium' && (
                    <button
                      onClick={handleThemeClick}
                      className={`block w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a8.001 8.001 0 00-7.646 5.646 8.001 8.001 0 0015.292 0A8.001 8.001 0 0012 4.354zM12 2a10 10 0 00-9.95 9.05A10 10 0 1012 2z"></path>
                      </svg>
                      Tùy chỉnh giao diện
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/');
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Trang chủ
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className={`block w-full text-left px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className={`px-3 py-1.5 rounded-md ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} transition-colors text-white flex items-center gap-1`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
        
        {/* ThemeColorPicker */}
        <ThemeColorPicker 
          isOpen={isThemePickerOpen} 
          onClose={() => setIsThemePickerOpen(false)} 
        />
      </header>
      
      {/* Spacer to prevent content from going under the fixed header */}
      <div className="h-16"></div>
    </>
  );
};

export default AdminHeader;
