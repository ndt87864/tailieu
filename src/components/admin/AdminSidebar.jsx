import React, { useState, useEffect } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { auth } from '../../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import ThemeColorPicker from '../ThemeColorPicker';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const { isDarkMode } = useTheme();
  const [user] = useAuthState(auth);
  const [isThemePickerVisible, setIsThemePickerVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsCollapsed(window.innerWidth < 1280 && window.innerWidth >= 770);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getCategoryIcon = (logoId) => {
    if (!logoId) {
      return (
        <svg className="w-5 h-5 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      );
    }


    return logoMap[logoId] || getCategoryIcon(null); 
  };

  const sidebarClasses = `
    h-screen overflow-y-auto border-r ${isDarkMode ? 'border-gray-700' : 'border-purple-800'} transition-all duration-300 scrollbar-hide
    ${isCollapsed ? 'w-16' : 'w-72'}
    ${windowWidth < 770 
      ? (isOpen ? 'fixed left-0 top-0 z-50 shadow-lg w-72' : 'fixed -left-80 top-0 z-50') 
      : 'sticky top-0 h-screen flex-shrink-0'
    }
    ${isDarkMode ? 'bg-gray-800' : 'bg-purple-900'} text-white
  `;
  
  const Overlay = () => (
    windowWidth < 770 && isOpen ? (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40" 
        onClick={() => setIsOpen(false)}
      ></div>
    ) : null
  );

  const showFullContent = !isCollapsed || windowWidth < 770;
  const navigationItems = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      title: 'Quản lý danh mục',
      path: '/admin/categories'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Quản lý tài liệu',
      path: '/admin/documents'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Quản lý câu hỏi',
      path: '/admin/questions'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: 'Quản lý người dùng',
      path: '/admin/users'
    }
  ];

  return (
    <>
      {windowWidth < 770 && isOpen && (
        <button 
          onClick={() => setIsOpen(false)} 
          className="fixed top-4 left-[260px] z-[60] bg-gray-900 text-white rounded-full p-1.5 shadow-xl"
          aria-label="Đóng sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      <Overlay />
      <aside className={sidebarClasses}>
        <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-purple-900'}`}>
          <div className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-700' : 'border-purple-800'}`}>
            <Link to="/admin" className="flex items-center">
              <div className="p-1 mr-2">
                <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {showFullContent && <span className="text-lg font-medium">Admin Panel</span>}
            </Link>
            
            {showFullContent && user && (
              <div className={`flex items-center space-x-2 ml-auto`}>
                <button 
                  className={`p-1 rounded-full transition-colors
                    ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-purple-800'}`}
                  onClick={() => setIsThemePickerVisible(!isThemePickerVisible)}
                  title="Thiết lập giao diện"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <nav className="mt-2 px-2">
          <ul className="space-y-1">
            {/* Quản lý người dùng */}
            <li>
              <Link
                to="/admin/users"
                className={`flex items-center px-4 py-3 transition-colors rounded-md ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-purple-800'
                }`}
              >
                {getCategoryIcon('user-management')}
                {showFullContent && <span className="text-white font-medium">Quản lý người dùng</span>}
              </Link>
            </li>

            {/* Quản lý tài liệu */}
            {navigationItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all mb-1
                  ${isActive 
                    ? (isDarkMode ? 'bg-gray-700 text-white' : 'bg-green-50 text-green-700')
                    : (isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                  }
                `}
              >
                <span className="mr-3 flex-shrink-0">{item.icon}</span>
                <span>{item.title}</span>
              </NavLink>
            ))}

            {/* Có thể thêm các mục quản trị khác ở đây */}
            
            {/* Quay về trang chủ */}
            <li className="mt-4 pt-4 border-t border-gray-700">
              <Link
                to="/"
                className={`flex items-center px-4 py-3 transition-colors rounded-md ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-purple-800'
                }`}
              >
                {getCategoryIcon('home')}
                {showFullContent && <span className="text-white font-medium">Trang chủ</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* Theme Color Picker Modal */}
      <ThemeColorPicker 
        isOpen={isThemePickerVisible} 
        onClose={() => setIsThemePickerVisible(false)} 
      />
    </>
  );
};

export default AdminSidebar;
