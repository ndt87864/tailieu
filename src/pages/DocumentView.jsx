import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import { DocumentMobileHeader } from '../components/MobileHeader';
import { getAllCategories, getDocumentsByCategory, getQuestionsByDocument } from '../firebase/firestoreService';
import { useTheme, THEME_COLORS } from '../context/ThemeContext';
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import * as XLSX from 'xlsx';
import UserHeader from '../components/UserHeader';
import UserManagementContent from '../components/admin/UserManagementContent';
import { useUserRole } from '../context/UserRoleContext';

const ThemeColorPicker = ({ isOpen, onClose, isDarkMode, toggleDarkMode }) => {
  const { themeColor, changeThemeColor, THEME_COLORS } = useTheme();
  const pickerRef = useRef(null);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={pickerRef}
        className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-xl p-4 max-w-sm w-[90%] mx-auto`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Tùy chỉnh giao diện</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Dark Mode Toggle */}
        <div className={`flex items-center justify-between p-3 mb-4 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className="flex items-center">
            <span className={`mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Chế độ {isDarkMode ? 'tối' : 'sáng'}
            </span>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
              isDarkMode ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <p className={`mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Chọn màu chủ đề cho ứng dụng
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          {/* Màu mặc định */}
          <div 
            className={`theme-color-option theme-color-default ${themeColor === THEME_COLORS.DEFAULT ? 'active' : ''}`}
            onClick={() => changeThemeColor(THEME_COLORS.DEFAULT)}
            title="Mặc định"
          ></div>
          
          {/* Màu xanh */}
          <div 
            className={`theme-color-option theme-color-blue ${themeColor === THEME_COLORS.BLUE ? 'active' : ''}`}
            onClick={() => changeThemeColor(THEME_COLORS.BLUE)}
            title="Xanh dương"
          ></div>
          
          {/* Màu đỏ */}
          <div 
            className={`theme-color-option theme-color-red ${themeColor === THEME_COLORS.RED ? 'active' : ''}`}
            onClick={() => changeThemeColor(THEME_COLORS.RED)}
            title="Đỏ"
          ></div>
          
          {/* Màu tím */}
          <div 
            className={`theme-color-option theme-color-purple ${themeColor === THEME_COLORS.PURPLE ? 'active' : ''}`}
            onClick={() => changeThemeColor(THEME_COLORS.PURPLE)}
            title="Tím"
          ></div>
          
          {/* Màu vàng */}
          <div 
            className={`theme-color-option theme-color-yellow ${themeColor === THEME_COLORS.YELLOW ? 'active' : ''}`}
            onClick={() => changeThemeColor(THEME_COLORS.YELLOW)}
            title="Vàng"
          ></div>
          
          {/* Màu nâu */}
          <div 
            className={`theme-color-option theme-color-brown ${themeColor === THEME_COLORS.BROWN ? 'active' : ''}`}
            onClick={() => changeThemeColor(THEME_COLORS.BROWN)}
            title="Nâu"
          ></div>
          
          {/* Màu đen */}
          <div 
            className={`theme-color-option theme-color-black ${themeColor === THEME_COLORS.BLACK ? 'active' : ''}`}
            onClick={() => changeThemeColor(THEME_COLORS.BLACK)}
            title="Đen"
          ></div>
          
          {/* Màu trắng */}
          <div 
            className={`theme-color-option theme-color-white ${themeColor === THEME_COLORS.WHITE ? 'active' : ''}`}
            onClick={() => changeThemeColor(THEME_COLORS.WHITE)}
            title="Trắng"
          ></div>
        </div>
        
        <div className={`p-3 rounded-md text-sm ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
          <p className="mb-2">
            <strong>Lưu ý:</strong> Thay đổi màu chủ đề sẽ chỉ có hiệu lực khi ở chế độ sáng.
          </p>
        </div>
        
      </div>
    </div>
  );
};
const noCopyStyles = {
  userSelect: 'none',
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  WebkitTouchCallout: 'none',
};

function DocumentView() {
  const params = useParams();
  const categorySlug = params.categorySlug;
  const documentSlug = params.documentSlug;
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [user] = useAuthState(auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isAdmin, isPremium } = useUserRole();
  const [limitedView, setLimitedView] = useState(false);
  const preventCopy = (e) => {
    e.preventDefault();
    return false;
  };

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [documents, setDocuments] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMain, setOpenMain] = useState(-1);
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  const handleLogout = () => {
    auth.signOut();
    setIsDropdownOpen(false);
  };
  const handleAccountClick = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      
      if (window.innerWidth >= 770 && window.innerWidth < 1280) {
        if (isSidebarOpen) {
          document.querySelector('.sidebar-container')?.classList.add('sidebar-compact');
          document.querySelector('.content-container')?.classList.add('content-with-compact-sidebar');
        }
      } else if (window.innerWidth >= 1280) {
        document.querySelector('.sidebar-container')?.classList.remove('sidebar-compact');
        document.querySelector('.content-container')?.classList.remove('content-with-compact-sidebar');
      }
    };

    try {
      window.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } catch (error) {
      console.error("Lỗi khi theo dõi kích thước màn hình:", error);
    }
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    
    setTimeout(() => {
      if (windowWidth >= 770 && windowWidth < 1280) {
        if (!isSidebarOpen) {
          document.querySelector('.sidebar-container')?.classList.remove('sidebar-compact');
          document.querySelector('.content-container')?.classList.remove('content-with-compact-sidebar');
        } else {
          document.querySelector('.sidebar-container')?.classList.add('sidebar-compact');
          document.querySelector('.content-container')?.classList.add('content-with-compact-sidebar');
        }
      }
    }, 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const categoriesData = await getAllCategories();
        
        if (!categoriesData || categoriesData.length === 0) {
          throw new Error('Không thể tải danh mục');
        }
        
        setCategories(categoriesData);
        
        const category = categoriesData.find(cat => {
          if (!cat || !cat.title) return false;
          const slug = cat.title.toLowerCase().replace(/\s+/g, '_').replace(/[^\w-]+/g, '').replace(/--+/g, '_');
          return slug === categorySlug;
        });
        
        if (!category) {
          throw new Error('Không tìm thấy danh mục này');
        }
        
        setSelectedCategory(category);
        setOpenMain(categoriesData.indexOf(category));
        try {
          const docsData = await getDocumentsByCategory(category.id);
          
          if (!docsData || docsData.length === 0) {
            throw new Error('Danh mục này không có tài liệu');
          }
          
          setDocuments({ [category.id]: docsData });
          
          const doc = docsData.find(d => d && d.slug === documentSlug);
          
          if (!doc) {
            throw new Error('Không tìm thấy tài liệu');
          }
          
          setSelectedDocument(doc);
          
          try {
            const questionsData = await getQuestionsByDocument(doc.id);
            let displayedQuestions = questionsData;
            if (!isAdmin && !isPremium) {
              const halfCount = Math.ceil(questionsData.length / 2);
              displayedQuestions = questionsData.slice(0, halfCount);
              setLimitedView(true);
            } else {
              setLimitedView(false);
            }
            setQuestions(displayedQuestions);
          } catch (questionError) {
            console.error("Lỗi khi tải câu hỏi:", questionError);
            setQuestions([]);
          }
        } catch (docsError) {
          console.error("Lỗi khi tải tài liệu:", docsError);
          throw docsError;
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError(err.message || "Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [categorySlug, documentSlug, isAdmin, isPremium]);
  const filteredQuestions = questions.filter(q => 
    (q.question && q.question.toLowerCase().includes((search || '').toLowerCase())) ||
    (q.answer && q.answer.toLowerCase().includes((search || '').toLowerCase()))
  );
  const exportToExcel = () => {
    try {
      const excelData = filteredQuestions.map(q => ({
        'STT': q.stt,
        'Câu hỏi': q.question,
        'Trả lời': q.answer
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const documentTitle = selectedDocument?.title || 'Document';
      XLSX.utils.book_append_sheet(workbook, worksheet, documentTitle.substring(0, 30));
      const fileName = `${selectedCategory?.title || 'Category'} - ${documentTitle}.xlsx`;
      
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Lỗi khi xuất file Excel:", error);
      alert("Có lỗi xảy ra khi tạo file Excel. Vui lòng thử lại sau.");
    }
  };

  const handleAuthClick = () => {
    navigate('/login');
  };
  useEffect(() => {
    const handleContextMenu = (e) => {
      if (!isAdmin && !isPremium) {
        e.preventDefault();
        return false;
      }
    };
    const handleKeyDown = (e) => {
      if (!isAdmin && !isPremium && ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.keyCode === 67))) {
        e.preventDefault();
        return false;
      }
    };
    const handleCopy = (e) => {
      if (!isAdmin && !isPremium) {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
    };
  }, [isAdmin, isPremium]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-100 border-red-400'} border text-red-500 px-4 py-3 rounded relative`} role="alert">
            <strong className="font-bold">Lỗi!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <div className="mt-4 flex flex-col md:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Tải lại trang
            </button>
            <Link to="/" className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md text-center">
              Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-slate-100'}`}
      style={!isAdmin && !isPremium ? noCopyStyles : {}}
      onCopy={!isAdmin && !isPremium ? preventCopy : undefined}
      onCut={!isAdmin && !isPremium ? preventCopy : undefined}
      onDragStart={!isAdmin && !isPremium ? preventCopy : undefined}
    >
      {/* Header di động chỉ hiển thị khi màn hình < 770px */}
      {windowWidth < 770 && (
        <DocumentMobileHeader 
          selectedCategory={selectedCategory}
          selectedDocument={selectedDocument}
          setIsSidebarOpen={toggleSidebar}
          isDarkMode={isDarkMode}
        />
      )}

      <div className="flex min-h-screen relative">
        <div className={`${windowWidth < 770 
          ? `fixed inset-y-0 left-0 z-20 transition-all duration-300 transform mobile-sidebar ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}` 
          : 'relative sidebar-container'} ${windowWidth >= 770 && windowWidth < 1280 ? 'sidebar-compact' : ''}`}>
          <Sidebar
            sidebarData={categories}
            documents={documents}
            openMain={openMain}
            setOpenMain={setOpenMain}
            selectedCategory={selectedCategory}
            selectedDocument={selectedDocument}
            setSelectedDocument={setSelectedDocument}
            setSearch={setSearch}
            setDocuments={setDocuments}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />
        </div>
        
        {/* Mobile overlay for sidebar */}
        {isSidebarOpen && windowWidth < 770 && (
          <div 
            className="fixed inset-0 z-10 bg-black/50" 
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        
        <div className={`flex-1 overflow-hidden content-container ${windowWidth >= 770 && windowWidth < 1280 && !isSidebarOpen ? 'content-with-compact-sidebar' : ''}`}>
          {/* Header desktop chỉ hiển thị khi màn hình >= 770px */}
          {windowWidth >= 770 && (
            <UserHeader
              title={selectedCategory?.title ? `${selectedCategory.title} - ${selectedDocument?.title}` : 'Tài liệu NEU'}
            />
          )}
          
          <div className="flex flex-col flex-1">
          {! (categorySlug === 'admin' && documentSlug === 'users') && (
            <div className="p-6 pb-0">
              {/* Hiển thị tiêu đề trên desktop */}
              {windowWidth >= 770 && (
                <h1 className={`text-xl font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                  {selectedCategory?.title} - {selectedDocument?.title}
                </h1>
              )}
              
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  Hiển thị từ 1 đến {filteredQuestions.length} trong tổng số {filteredQuestions.length} câu hỏi
                </p>
                <div className="flex gap-2">          {/* Export Excel button */}
                  {user && (
                    <button
                      onClick={exportToExcel}
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors`}
                      title={!isAdmin && !isPremium ? "Tính năng này chỉ dành cho thành viên Premium" : "Tải xuống danh sách câu hỏi dưới dạng Excel"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Excel</span>
                    </button>
                  )}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm câu hỏi"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className={`pl-3 pr-10 py-2 border rounded-md w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 absolute right-3 top-2.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
          
      {/* Questions list */}
      <div className="mx-auto max-w-4xl px-4 pb-12">
        {/* When showing search results with no matches in limited view, add a note */}
        {search && filteredQuestions.length === 0 && limitedView && (
          <div className={`mt-4 p-4 rounded-md ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } text-center shadow-sm`}>
            <p className="mb-2">Không tìm thấy kết quả phù hợp với tìm kiếm của bạn.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Lưu ý: Bạn đang xem phiên bản giới hạn. Kết quả tìm kiếm có thể nằm trong phần nội dung chỉ dành cho tài khoản premium.
            </p>
          </div>
        )}
        
      </div>
      {/* Add premium notification for limited view */}
      {limitedView && (
        <div className={`mx-auto max-w-4xl px-4 mb-6 ${
          isDarkMode ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
        } rounded-lg py-3`}>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-yellow-500' : 'text-yellow-400'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 8a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
              Bạn đang xem bản giới hạn (50% câu hỏi). 
              <a href="/pricing" className={`font-medium underline ml-1 ${isDarkMode ? 'text-yellow-300 hover:text-yellow-400' : 'text-yellow-800 hover:text-yellow-900'}`}>
                Nâng cấp tài khoản
              </a> để truy cập đầy đủ.
            </p>
          </div>
        </div>
      )}
          {categorySlug === 'admin' && documentSlug === 'users' ? (
            <UserManagementContent />
          ) : (
            <MainContent
              filteredQuestions={filteredQuestions}
            />
          )}
          </div>
        </div>
      </div>
      <ThemeColorPicker 
        isOpen={isThemePickerOpen} 
        onClose={() => setIsThemePickerOpen(false)} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
      />
      
    </div>
  );
}

export default DocumentView;