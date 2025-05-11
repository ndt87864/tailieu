import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase/firebase';
import { useUserRole } from '../../context/UserRoleContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  getAllQuestionsWithDocumentInfo, 
  addQuestion, 
  updateQuestion, 
  deleteQuestion,
  getDocumentsWithQuestionCount,
  getAllCategoriesWithDocuments
} from '../../firebase/firestoreService';
import Sidebar from '../../components/Sidebar';
import { DocumentMobileHeader } from '../../components/MobileHeader';
import UserHeader from '../../components/UserHeader';
import ThemeColorPicker from '../../components/ThemeColorPicker';
import * as XLSX from 'xlsx';

const QuestionManagement = () => {
  console.log("QuestionManagement component is rendering");
  
  const [questions, setQuestions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user] = useAuthState(auth);
  const { isAdmin } = useUserRole();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  
  const [sidebarData, setSidebarData] = useState([]);
  const [sidebarDocuments, setSidebarDocuments] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [openMain, setOpenMain] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedDocumentFilter, setSelectedDocumentFilter] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    answer: '',
    documentId: ''
  });
  const [editQuestion, setEditQuestion] = useState({
    id: '',
    question: '',
    answer: '',
    documentId: ''
  });
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterDocument, setFilterDocument] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [categoryDocuments, setCategoryDocuments] = useState({});

  const [questionType, setQuestionType] = useState('text'); 
  const [excelFile, setExcelFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = React.useRef(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingExcel, setProcessingExcel] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);

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
    const loadData = async () => {
      console.log("Loading data, isAdmin:", isAdmin);
      
      if (!isAdmin) {
        console.log("User is not admin, returning early");
        setLoading(false); 
        return;
      }
      
      try {
        setLoading(true);
        
        const categoriesWithDocs = await getAllCategoriesWithDocuments();
        console.log("Categories fetched:", categoriesWithDocs);
        
        const sortedCategories = [...categoriesWithDocs].sort((a, b) => 
          (a.stt || Number.MAX_SAFE_INTEGER) - (b.stt || Number.MAX_SAFE_INTEGER)
        );
        
        setAllCategories(sortedCategories);
        
        const docsMap = {};
        const allDocuments = [];
        
        sortedCategories.forEach(category => {
          if (category.documents && category.documents.length > 0) {
            const sortedDocs = [...category.documents].sort((a, b) => 
              (a.stt || Number.MAX_SAFE_INTEGER) - (b.stt || Number.MAX_SAFE_INTEGER)
            );
            
            docsMap[category.id] = sortedDocs;
            sortedDocs.forEach(doc => {
              allDocuments.push({
                ...doc,
                categoryId: category.id,
                categoryTitle: category.title,
                categoryLogo: category.logo || null
              });
            });
          }
        });
        
        setCategoryDocuments(docsMap);
        
        if (!sortedCategories || sortedCategories.length === 0) {
          console.log("No categories found");
          setError("Không tìm thấy danh mục");
          setLoading(false);
          return;
        }
        
        const firstCategory = sortedCategories[0];
        console.log("First category:", firstCategory);
        
        if (!firstCategory.documents || firstCategory.documents.length === 0) {
          console.log("No documents found in first category");
          setError("Không tìm thấy tài liệu trong danh mục đầu tiên");
          setLoading(false);
          return;
        }
        
        const firstDocument = firstCategory.documents[0];
        console.log("First document:", firstDocument);
        
        const questionsData = await getAllQuestionsWithDocumentInfo();
        console.log("All questions fetched:", questionsData);
        
        const filteredQuestions = questionsData.filter(question => 
          question.documentId === firstDocument.id
        );
        console.log("Filtered questions for first document:", filteredQuestions);
        
        const formattedCategories = [{
          id: firstCategory.id,
          title: firstCategory.title,
          logo: firstCategory.logo || null
        }];
        
        const formattedDocuments = {
          [firstCategory.id]: [firstDocument]
        };
        
        setSelectedDocumentFilter(firstDocument.id);
        setSelectedCategory(firstCategory.id);
        setSelectedDocument(firstDocument.id);
        setOpenMain(0);
        
        setSidebarData(formattedCategories);
        setSidebarDocuments(formattedDocuments);
        setQuestions(filteredQuestions || []);
        setDocuments([firstDocument]);
        setFilterCategory(firstCategory.id);
        setFilterDocument(firstDocument.id);
        
        console.log("Data loading complete, filtered questions count:", filteredQuestions.length);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Không thể tải danh sách câu hỏi và tài liệu: " + err.message);
        setLoading(false); 
      }
    };

    loadData();
  }, [isAdmin]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  const handleDocumentFilterChange = (e) => {
    setSelectedDocumentFilter(e.target.value);
  };

  const handleInputChange = (e) => {
    setNewQuestion({
      ...newQuestion,
      [e.target.name]: e.target.value
    });
  };

  const handleEditInputChange = (e) => {
    setEditQuestion({
      ...editQuestion,
      [e.target.name]: e.target.value
    });
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    
    if (!file) {
      setExcelFile(null);
      return;
    }
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
      setFileError('Chỉ chấp nhận file Excel (.xlsx, .xls)');
      setExcelFile(null);
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setFileError('Kích thước file không được vượt quá 5MB');
      setExcelFile(null);
      return;
    }
    
    setExcelFile(file);
  };

  const processExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
          
          if (jsonData.length === 0) {
            reject(new Error('File Excel không chứa dữ liệu'));
            return;
          }
          
          const hasAtLeastTwoColumns = jsonData.some(row => 
            row.A && row.B && 
            row.A.toString().trim() !== '' && 
            row.B.toString().trim() !== ''
          );
          
          if (!hasAtLeastTwoColumns) {
            reject(new Error('File Excel phải có ít nhất 2 cột dữ liệu'));
            return;
          }
          const validRows = jsonData.filter(row => 
            row.A && row.B && 
            row.A.toString().trim() !== '' && 
            row.B.toString().trim() !== ''
          );
          
          if (validRows.length === 0) {
            reject(new Error('Không tìm thấy dữ liệu hợp lệ trong file Excel'));
            return;
          }
          
          resolve(validRows);
        } catch (error) {
          reject(new Error('Lỗi khi đọc file Excel: ' + error.message));
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsBinaryString(file);
    });
  };
  
  const uploadQuestionsToFirestore = async (questions, documentId) => {
    setTotalRows(questions.length);
    setProcessedRows(0);
    setUploadProgress(0);
    
    try {
      for (let i = 0; i < questions.length; i++) {
        const row = questions[i];
        
        const questionData = {
          question: row.A.toString().trim(),
          answer: row.B.toString().trim(),
          documentId: documentId
        };
        
        await addQuestion(questionData);
        
        setProcessedRows(i + 1);
        setUploadProgress(Math.round(((i + 1) / questions.length) * 100));
      }
      
      return questions.length;
    } catch (error) {
      throw new Error('Lỗi khi tải câu hỏi lên Firestore: ' + error.message);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');
    setFileError('');
    
    if (questionType === 'text') {
      if (!newQuestion.question.trim()) {
        setFormError('Vui lòng nhập câu hỏi');
        return;
      }
      
      if (!newQuestion.answer.trim()) {
        setFormError('Vui lòng nhập câu trả lời');
        return;
      }
      
      try {
        setIsSubmitting(true);
        
        const questionData = {
          question: newQuestion.question.trim(),
          answer: newQuestion.answer.trim(),
          documentId: selectedDocumentFilter 
        };
        
        const addedQuestion = await addQuestion(questionData);
        
        const document = documents.find(doc => doc.id === questionData.documentId);
        
        setQuestions(prevQuestions => [
          ...prevQuestions, 
          {
            ...addedQuestion,
            documentTitle: document?.title || '',
            documentId: document?.id || '',
            categoryId: document?.categoryId || '',
            categoryTitle: document?.categoryTitle || '',
            categoryLogo: document?.categoryLogo || null
          }
        ]);
        
        setNewQuestion({
          question: '',
          answer: '',
          documentId: ''
        });
        
        setShowAddModal(false);
        setSuccessMessage('Đã thêm câu hỏi thành công!');
        
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        console.error("Error adding question:", error);
        setFormError('Lỗi khi thêm câu hỏi: ' + error.message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!excelFile) {
        setFileError('Vui lòng chọn file Excel');
        return;
      }
      
      try {
        setIsSubmitting(true);
        setProcessingExcel(true);
        const excelData = await processExcelFile(excelFile);
        const addedCount = await uploadQuestionsToFirestore(excelData, selectedDocumentFilter);
        
        setSuccessMessage(`Đã nhập thành công ${addedCount} câu hỏi từ file Excel!`);
        
        setTimeout(() => {
          setExcelFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setProcessingExcel(false);
          setShowAddModal(false);
          const refreshQuestions = async () => {
            try {
              const questionsData = await getAllQuestionsWithDocumentInfo();
              const filteredQuestions = questionsData.filter(question => 
                question.documentId === selectedDocumentFilter
              );
              setQuestions(filteredQuestions || []);
            } catch (error) {
              console.error("Error refreshing questions:", error);
            }
          };
          
          refreshQuestions();
        }, 2000);
        
      } catch (error) {
        console.error("Error processing Excel file:", error);
        setFormError(error.message || 'Lỗi khi xử lý file Excel');
        setProcessingExcel(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!editQuestion.question.trim()) {
      setFormError('Vui lòng nhập câu hỏi');
      return;
    }
    
    if (!editQuestion.answer.trim()) {
      setFormError('Vui lòng nhập câu trả lời');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const questionData = {
        question: editQuestion.question.trim(),
        answer: editQuestion.answer.trim(),
        documentId: selectedDocumentFilter
      };
      await updateQuestion(editQuestion.id, questionData);
      const document = documents.find(doc => doc.id === questionData.documentId);
      setQuestions(prevQuestions => prevQuestions.map(question => 
        question.id === editQuestion.id 
          ? {
              ...question,
              ...questionData,
              documentTitle: document?.title || question.documentTitle,
              categoryId: document?.categoryId || question.categoryId,
              categoryTitle: document?.categoryTitle || question.categoryTitle,
              categoryLogo: document?.categoryLogo || question.categoryLogo
            }
          : question
      ));
      setShowEditModal(false);
      setSuccessMessage('Đã cập nhật câu hỏi thành công!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error("Error updating question:", error);
      setFormError('Lỗi khi cập nhật câu hỏi: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    
    try {
      setIsDeleting(true);
      setDeleteError('');
      await deleteQuestion(questionToDelete.id);
      setQuestions(prevQuestions => prevQuestions.filter(question => question.id !== questionToDelete.id));
      
      setShowDeleteModal(false);
      setDeleteSuccess('Đã xóa câu hỏi thành công!');
      
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (error) {
      console.error("Error deleting question:", error);
      setDeleteError('Lỗi khi xóa câu hỏi: ' + error.message);
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmed(false);
    }
  };

  const openEditModal = (question) => {
    setEditQuestion({
      id: question.id,
      question: question.question,
      answer: question.answer,
      documentId: selectedDocumentFilter
    });
    setShowEditModal(true);
  };
  const openDeleteModal = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };
  const filteredQuestions = questions.filter(question => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        question.question?.toLowerCase().includes(query) ||
        question.answer?.toLowerCase().includes(query) ||
        question.documentTitle?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  console.log("Filtered questions count:", filteredQuestions.length);

  const handleApplyFilter = async () => {
    if (!filterCategory || !filterDocument) return;
    
    try {
      setLoading(true);
      
      const questionsData = await getAllQuestionsWithDocumentInfo();
      
      const filteredQuestions = questionsData.filter(question => 
        question.documentId === filterDocument
      );
      
      let documentDetails = null;
      if (categoryDocuments[filterCategory]) {
        documentDetails = categoryDocuments[filterCategory].find(doc => doc.id === filterDocument);
      }
      setQuestions(filteredQuestions || []);
      setSelectedDocumentFilter(filterDocument);
      setSelectedCategory(filterCategory);
      setSelectedDocument(filterDocument);
      
      if (documentDetails) {
        setDocuments([documentDetails]); 
      }
      setShowFilterModal(false);
      setLoading(false);
    } catch (error) {
      console.error("Error applying filter:", error);
      setError("Không thể áp dụng bộ lọc: " + error.message);
      setLoading(false);
    }
  };

  const handleFilterCategoryChange = (categoryId) => {
    setFilterCategory(categoryId);
    
    if (categoryDocuments[categoryId] && categoryDocuments[categoryId].length > 0) {
      setFilterDocument(categoryDocuments[categoryId][0].id);
    } else {
      setFilterDocument(null);
    }
  };


  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-slate-100'}`}>
      {/* Mobile Header */}
      {windowWidth < 770 && (
        <DocumentMobileHeader 
          setIsSidebarOpen={setIsSidebarOpen}
          isDarkMode={isDarkMode}
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar - Fixed on desktop, slidable on mobile */}
        <div className={`${windowWidth < 770 
          ? `fixed inset-y-0 left-0 z-20 transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}` 
          : 'sticky top-0 h-screen z-10'
        }`}>
          <Sidebar
            sidebarData={sidebarData}
            documents={sidebarDocuments}
            openMain={openMain}
            setOpenMain={setOpenMain}
            selectedCategory={selectedCategory}
            selectedDocument={selectedDocument}
            setSelectedDocument={setSelectedDocument}
            setSearch={setSearch}
            setDocuments={setSidebarDocuments}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            hideDocumentTree={true} 
          />
        </div>
        
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && windowWidth < 770 && (
          <div 
            className="fixed inset-0 z-10 bg-black/50" 
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {/* Desktop Header - Fixed at top */}
          {windowWidth >= 770 && (
            <div className="sticky top-0 z-20 w-full">
              <UserHeader 
                user={user}
                isDarkMode={isDarkMode}
                setIsThemePickerOpen={setIsThemePickerOpen}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            </div>
          )}
          
          {/* Theme Color Picker */}
          {isThemePickerOpen && (
            <ThemeColorPicker onClose={() => setIsThemePickerOpen(false)} />
          )}
          
          <main className={`p-4 md:p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-100 text-gray-900'}`}>
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h1 className="text-2xl font-bold mb-4 md:mb-0">Quản lý Bộ Câu Hỏi</h1>
                
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                  <button
                    className={`px-4 py-2 rounded-md ${
                      isDarkMode
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white transition-colors`}
                    onClick={() => setShowAddModal(true)}
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Thêm Câu Hỏi Mới
                    </span>
                  </button>
                </div>
              </div>
            
            {/* Success message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {successMessage}
              </div>
            )}
            
            {/* Delete success message */}
            {deleteSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                {deleteSuccess}
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {/* Filters and search */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-sm font-medium mb-1">
                    Tìm kiếm câu hỏi
                  </label>
                  <input
                    type="text"
                    id="search"
                    className={`w-full rounded-md ${
                      isDarkMode
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-white text-gray-900 border-gray-300'
                    } border px-3 py-2`}
                    placeholder="Tìm theo câu hỏi, câu trả lời hoặc tên tài liệu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="w-full md:w-64">
                  <label className="block text-sm font-medium mb-1">
                    Bộ câu hỏi
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowFilterModal(true)}
                    className={`w-full flex items-center justify-between px-4 py-2 rounded-md ${
                      isDarkMode
                        ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
                        : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'
                    } border transition-colors`}
                  >
                    <span>
                      {documents.length > 0 
                        ? documents.find(doc => doc.id === selectedDocumentFilter)?.title || 'Chọn bộ câu hỏi'
                        : 'Chọn bộ câu hỏi'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Questions list */}
            <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-md">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4">Đang tải dữ liệu...</p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="p-6 text-center">
                  <p>Không tìm thấy câu hỏi nào.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          STT
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Câu hỏi
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Câu trả lời
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Tài liệu
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Danh mục
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {filteredQuestions.map((question, index) => (
                        <tr 
                          key={question.id} 
                          className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="max-w-xs overflow-hidden">
                              {question.question}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="max-w-xs overflow-hidden">
                              {question.answer.length > 100 
                                ? `${question.answer.substring(0, 100)}...` 
                                : question.answer}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {question.documentTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {question.categoryTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditModal(question)}
                                className="text-blue-500 hover:text-blue-700"
                                title="Chỉnh sửa"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openDeleteModal(question)}
                                className="text-red-500 hover:text-red-700"
                                title="Xóa"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
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
        </main>
      </div>
    </div>
    
    {/* Modals */}
    {/* Add Question Modal */}
    {showAddModal && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-70"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div 
              className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
                isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
              }`}
            >
            <div className={`px-6 pt-6 pb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-xl font-medium leading-6 mb-5">Thêm Câu Hỏi Mới</h3>
              
              {formError && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleAddQuestion}>
                {/* Question Type Selector */}
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2">
                    Loại nhập liệu
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="questionType"
                        value="text"
                        checked={questionType === 'text'}
                        onChange={() => setQuestionType('text')}
                        className={`h-4 w-4 ${
                          isDarkMode
                            ? 'text-blue-600 bg-gray-700 border-gray-600'
                            : 'text-blue-600 bg-gray-100 border-gray-300'
                        }`}
                      />
                      <span className="ml-2">Nhập câu hỏi</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="questionType"
                        value="excel"
                        checked={questionType === 'excel'}
                        onChange={() => setQuestionType('excel')}
                        className={`h-4 w-4 ${
                          isDarkMode
                            ? 'text-blue-600 bg-gray-700 border-gray-600'
                            : 'text-blue-600 bg-gray-100 border-gray-300'
                        }`}
                      />
                      <span className="ml-2">Nhập từ Excel</span>
                    </label>
                  </div>
                </div>
                
                {/* Display the current document information */}
                
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2">
                    Tài liệu
                  </label>
                  <div className={`px-4 py-3 rounded-xl border ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-gray-50 text-gray-900 border-gray-200'
                  }`}>
                    {documents.length > 0 && documents[0].title 
                      ? documents[0].title 
                      : 'Đang tải...'}
                  </div>
                </div>
                
                {/* Conditional rendering based on question type */}
                {questionType === 'text' ? (
                  <>
                    <div className="mb-5">
                      <label htmlFor="question" className="block text-sm font-medium mb-2">
                        Câu hỏi
                      </label>
                      <textarea
                        id="question"
                        name="question"
                        rows="3"
                        className={`w-full rounded-xl py-3 px-4 ${
                          isDarkMode
                            ? 'bg-gray-700 text-white border-gray-600'
                            : 'bg-gray-50 text-gray-900 border-gray-200'
                        } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Nhập câu hỏi..."
                        value={newQuestion.question}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                    
                    <div className="mb-5">
                      <label htmlFor="answer" className="block text-sm font-medium mb-2">
                        Câu trả lời
                      </label>
                      <textarea
                        id="answer"
                        name="answer"
                        rows="5"
                        className={`w-full rounded-xl py-3 px-4 ${
                          isDarkMode
                            ? 'bg-gray-700 text-white border-gray-600'
                            : 'bg-gray-50 text-gray-900 border-gray-200'
                        } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        placeholder="Nhập câu trả lời..."
                        value={newQuestion.answer}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </>
                ) : (
                  <div className="mb-5">
                    <label htmlFor="excelFile" className="block text-sm font-medium mb-2">
                      File Excel
                    </label>
                    
                    {processingExcel ? (
                      <div className={`p-4 rounded-xl border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="mb-2 flex justify-between text-sm">
                          <span>Đang tải lên Firestore...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-center">
                          Đã xử lý {processedRows}/{totalRows} câu hỏi
                        </p>
                      </div>
                    ) : (
                      <div className={`border-2 border-dashed rounded-xl p-4 text-center ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 hover:border-gray-500'
                          : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                      } transition-colors`}>
                        <input
                          type="file"
                          id="excelFile"
                          accept=".xlsx,.xls"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        
                        {excelFile ? (
                          <div className="py-2">
                            <div className="flex items-center justify-center mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium mb-1">{excelFile.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(excelFile.size / 1024).toFixed(2)} KB
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setExcelFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              className={`mt-2 px-3 py-1 text-xs rounded-md ${
                                isDarkMode
                                  ? 'bg-gray-600 hover:bg-gray-500 text-white'
                                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                              }`}
                            >
                              Chọn file khác
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="py-8 cursor-pointer" 
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm font-medium mb-1">Chọn file Excel</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Chấp nhận file .xlsx, .xls (tối đa 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {fileError && (
                      <p className="mt-1 text-sm text-red-500">{fileError}</p>
                    )}
                    
                    <div className="mt-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-md text-xs text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Định dạng file Excel:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Cột A: Câu hỏi</li>
                        <li>Cột B: Câu trả lời</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    className={`px-5 py-3 rounded-xl font-medium ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    } transition-colors`}
                    onClick={() => setShowAddModal(false)}
                    disabled={processingExcel}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors ${
                      isSubmitting || processingExcel ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting || processingExcel}
                  >
                    {processingExcel 
                      ? `Đang tải lên (${uploadProgress}%)` 
                      : isSubmitting 
                        ? 'Đang thêm...' 
                        : 'Thêm câu hỏi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Edit Question Modal */}
    {showEditModal && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-70"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div 
              className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
                isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
              }`}
            >
            <div className={`px-6 pt-6 pb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-xl font-medium leading-6 mb-5">Chỉnh Sửa Câu Hỏi</h3>
              
              {formError && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleUpdateQuestion}>
                {/* Display the current document information */}
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2">
                    Tài liệu
                  </label>
                  <div className={`px-4 py-3 rounded-xl border ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-gray-50 text-gray-900 border-gray-200'
                  }`}>
                    {documents.length > 0 && documents[0].title 
                      ? documents[0].title 
                      : 'Đang tải...'}
                  </div>
                </div>
                
                <div className="mb-5">
                  <label htmlFor="edit-question" className="block text-sm font-medium mb-2">
                    Câu hỏi
                  </label>
                  <textarea
                    id="edit-question"
                    name="question"
                    required
                    rows="3"
                    className={`w-full rounded-xl py-3 px-4 ${
                      isDarkMode
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Nhập câu hỏi..."
                    value={editQuestion.question}
                    onChange={handleEditInputChange}
                  ></textarea>
                </div>
                
                <div className="mb-5">
                  <label htmlFor="edit-answer" className="block text-sm font-medium mb-2">
                    Câu trả lời
                  </label>
                  <textarea
                    id="edit-answer"
                    name="answer"
                    required
                    rows="5"
                    className={`w-full rounded-xl py-3 px-4 ${
                      isDarkMode
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Nhập câu trả lời..."
                    value={editQuestion.answer}
                    onChange={handleEditInputChange}
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    className={`px-5 py-3 rounded-xl font-medium ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    } transition-colors`}
                    onClick={() => setShowEditModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Delete Question Modal */}
    {showDeleteModal && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-70"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div 
              className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
                isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
              }`}
            >
            <div className={`px-6 pt-6 pb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-xl font-medium">Xác nhận xóa</h3>
                  <div className="mt-3">
                    <p className="text-base">
                      Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể khôi phục.
                    </p>
                    
                    {deleteError && (
                      <div className="mt-3 p-3 bg-red-100 text-red-600 rounded-md text-sm">
                        {deleteError}
                      </div>
                    )}
                    
                    <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <p className="font-medium mb-2">Câu hỏi:</p>
                      <p className="text-sm">{questionToDelete?.question}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-xl px-5 py-3 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleDeleteQuestion}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Đang xóa...' : 'Xóa'}
                </button>
                <button
                  type="button"
                  className={`mt-3 w-full inline-flex justify-center rounded-xl px-5 py-3 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  } font-medium focus:outline-none sm:mt-0 sm:w-auto`}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Filter Modal */}
    {showFilterModal && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-black bg-opacity-70"></div>
          </div>
          
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div 
            className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
              isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className={`px-6 pt-6 pb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className="text-xl font-medium leading-6 mb-5">Chọn Bộ Câu Hỏi</h3>
              
              <div className="mb-5">
                <label htmlFor="filterCategory" className="block text-sm font-medium mb-2">
                  Danh mục
                </label>
                <select
                  id="filterCategory"
                  className={`w-full rounded-xl py-3 px-4 ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-gray-50 text-gray-900 border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  value={filterCategory || ''}
                  onChange={(e) => handleFilterCategoryChange(e.target.value)}
                >
                  <option value="">Chọn danh mục</option>
                  {allCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-5">
                <label htmlFor="filterDocument" className="block text-sm font-medium mb-2">
                  Tài liệu
                </label>
                <select
                  id="filterDocument"
                  className={`w-full rounded-xl py-3 px-4 ${
                    isDarkMode
                      ? 'bg-gray-700 text-white border-gray-600'
                      : 'bg-gray-50 text-gray-900 border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  value={filterDocument || ''}
                  onChange={(e) => setFilterDocument(e.target.value)}
                  disabled={!filterCategory || !categoryDocuments[filterCategory] || categoryDocuments[filterCategory].length === 0}
                >
                  <option value="">Chọn tài liệu</option>
                  {filterCategory && categoryDocuments[filterCategory] && 
                    categoryDocuments[filterCategory].map((document) => (
                      <option key={document.id} value={document.id}>
                        {document.title}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className={`px-5 py-3 rounded-xl font-medium ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  } transition-colors`}
                  onClick={() => setShowFilterModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className={`px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors ${
                    !filterCategory || !filterDocument ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={handleApplyFilter}
                  disabled={!filterCategory || !filterDocument}
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default QuestionManagement;
