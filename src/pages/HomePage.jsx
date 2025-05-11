import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCategoriesWithDocuments } from '../firebase/firestoreService';
import { useTheme } from '../context/ThemeContext';
import { HomeMobileHeader } from '../components/MobileHeader';
import UserHeader from '../components/UserHeader';
import ThemeColorPicker from '../components/ThemeColorPicker';
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const toSlug = (str) => {
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '_');
};

const HomePage = () => {
  const [categoriesWithDocs, setCategoriesWithDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  
  const [sidebarData, setSidebarData] = useState([]);
  const [documents, setDocuments] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const data = await getAllCategoriesWithDocuments();
        setCategoriesWithDocs(data);
        
        setSidebarData(data);
        
        if (data.length > 0) {
          const firstCategory = data[0];
          setDocuments({
            [firstCategory.id]: firstCategory.documents || []
          });
        }
        
      } catch (err) {
        console.error("Error loading homepage data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDocumentClick = (category, document) => {
    const categorySlug = toSlug(category.title);
    navigate(`/${categorySlug}/${document.slug}`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-800'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-800'}`}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Lỗi khi tải dữ liệu</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-slate-100'}`}>
      {/* Mobile Header */}
      {windowWidth < 770 && (
        <HomeMobileHeader 
          setIsSidebarOpen={setIsSidebarOpen}
          isDarkMode={isDarkMode}
        />
      )}

      <div className="flex min-h-screen relative">
        
        
        {/* Main Content */}
        <div className={`flex flex-col flex-1 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-800'}`}>
          {/* Desktop Header */}
          {windowWidth >= 770 && (
            <UserHeader title="Trang chủ" />
          )}
          
          {/* Content */}
          <div className="flex-1 p-6">
            <div className="mb-8">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Thư viện tài liệu HOU
              </h1>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Chọn một danh mục để xem tài liệu liên quan
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoriesWithDocs.map(category => (
                <div 
                  key={category.id} 
                  className={`rounded-lg overflow-hidden shadow-md ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}
                >
                  <div className={`px-6 py-4 ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
                    <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {category.title}
                    </h2>
                  </div>
                  <div className="p-2">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {category.documents && category.documents.length > 0 ? (
                        category.documents.map(doc => (
                          <li key={doc.id}>
                            <button
                              onClick={() => handleDocumentClick(category, doc)}
                              className={`w-full text-left px-4 py-3 rounded-md ${
                                isDarkMode 
                                  ? 'hover:bg-gray-700 text-gray-200' 
                                  : 'hover:bg-gray-100 text-gray-700'
                              } transition-colors`}
                            >
                              <div className="flex items-center">
                                <svg 
                                  className="w-5 h-5 mr-2 text-green-500" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24" 
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span>{doc.title}</span>
                              </div>
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Không có tài liệu
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* ThemeColorPicker */}
      <ThemeColorPicker 
        isOpen={isThemePickerOpen} 
        onClose={() => setIsThemePickerOpen(false)} 
      />
    </div>
  );
};

export default HomePage;
