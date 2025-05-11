/**
 * Script để tìm các file không được sử dụng trong dự án
 * 
 * Cách sử dụng:
 * 1. Lưu file này vào thư mục scripts
 * 2. Chạy lệnh: node scripts/find-unused-files.js
 */

const fs = require('fs');
const path = require('path');

// Thư mục gốc của dự án
const rootDir = path.resolve(__dirname, '..');

// Danh sách các extension cần kiểm tra
const extensions = ['.js', '.jsx', '.ts', '.tsx'];

// Các thư mục loại trừ không cần quét
const excludeDirs = ['node_modules', 'build', 'dist', '.git', 'public', 'scripts'];

// Các file luôn được coi là sử dụng (entry points)
const entryPoints = [
  'src/index.js',
  'src/index.jsx',
  'src/index.ts',
  'src/index.tsx',
  'src/App.js',
  'src/App.jsx',
  'src/App.ts',
  'src/App.tsx',
  'src/main.js',
  'src/main.jsx',
  'src/main.ts',
  'src/main.tsx',
  'vite.config.js',
  'vite.config.ts',
  'webpack.config.js',
  'package.json'
];

// Regex để tìm kiếm import/require statements
const importRegex = /(?:import|require)\s*\(?[^)]*['"]([^'"]+)['"]/g;
const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const jsxImportRegex = /(?:from|import)\s+['"]([^'"]+)['"]/g;

// Hàm để lấy tất cả các file với extension cần kiểm tra
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Bỏ qua các thư mục loại trừ
      if (!excludeDirs.includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        // Lấy đường dẫn tương đối so với rootDir
        const relativePath = path.relative(rootDir, filePath);
        fileList.push(relativePath);
      }
    }
  }
  
  return fileList;
}

// Hàm để tìm tất cả các import trong một file
function findImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(path.join(rootDir, filePath), 'utf8');
    const imports = new Set();
    
    // Tìm tất cả các import statements
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.add(match[1]);
    }
    
    // Reset regex
    importRegex.lastIndex = 0;
    
    // Tìm dynamic imports
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      imports.add(match[1]);
    }
    
    // Reset regex
    dynamicImportRegex.lastIndex = 0;
    
    // Tìm JSX imports
    while ((match = jsxImportRegex.exec(content)) !== null) {
      imports.add(match[1]);
    }
    
    return Array.from(imports);
  } catch (error) {
    console.error(`Lỗi khi đọc file ${filePath}:`, error);
    return [];
  }
}

// Hàm chính để tìm các file không sử dụng
function findUnusedFiles() {
  console.log('Đang quét tất cả các file trong dự án...');
  const allFiles = getAllFiles(rootDir);
  console.log(`Tìm thấy ${allFiles.length} file để phân tích.`);
  
  // Tạo map của tất cả các file và tình trạng sử dụng
  const fileUsage = new Map();
  allFiles.forEach(file => {
    // Coi các entry points là đã sử dụng
    const isEntryPoint = entryPoints.some(entry => file.endsWith(entry));
    fileUsage.set(file, isEntryPoint);
  });
  
  // Phân tích các imports
  console.log('Đang phân tích imports...');
  allFiles.forEach(file => {
    const imports = findImportsInFile(file);
    
    imports.forEach(importPath => {
      // Xử lý import path, loại bỏ các aliases và query params
      let cleanImportPath = importPath
        .replace(/^\@\//, 'src/')  // Alias @/ -> src/
        .replace(/\?.*$/, '')      // Remove query params like ?raw
        .split('#')[0];            // Remove # fragments
      
      // Xử lý relative imports
      if (importPath.startsWith('.')) {
        const fileDir = path.dirname(file);
        cleanImportPath = path.normalize(path.join(fileDir, importPath));
      }
      
      // Kiểm tra xem import có trỏ đến file nào trong dự án
      allFiles.forEach(existingFile => {
        const existingFilePath = path.join(rootDir, existingFile);
        const existingFileDir = path.dirname(existingFilePath);
        const existingFileBase = path.basename(existingFilePath, path.extname(existingFilePath));
        
        // Kiểm tra nếu import trỏ đến file này (có tính đến các extension)
        const possibleFiles = extensions.map(ext => 
          path.normalize(path.join(existingFileDir, `${existingFileBase}${ext}`))
        );
        
        const isImported = possibleFiles.some(possibleFile => 
          possibleFile.includes(cleanImportPath) || 
          cleanImportPath.includes(path.basename(existingFile, path.extname(existingFile)))
        );
        
        if (isImported) {
          fileUsage.set(existingFile, true);
        }
      });
    });
  });
  
  // Tìm các file không được sử dụng
  const unusedFiles = [];
  fileUsage.forEach((isUsed, file) => {
    if (!isUsed) {
      unusedFiles.push(file);
    }
  });
  
  console.log('\n=== Kết quả phân tích ===');
  console.log(`Tổng số file: ${allFiles.length}`);
  console.log(`Số file đã sử dụng: ${allFiles.length - unusedFiles.length}`);
  console.log(`Số file chưa sử dụng: ${unusedFiles.length}`);
  
  if (unusedFiles.length > 0) {
    console.log('\n=== Danh sách file không được sử dụng ===');
    unusedFiles.forEach(file => {
      console.log(`- ${file}`);
    });
    
    // Tạo file danh sách để dễ xem sau
    const outputPath = path.join(rootDir, 'unused-files.txt');
    fs.writeFileSync(outputPath, unusedFiles.join('\n'), 'utf8');
    console.log(`\nĐã lưu danh sách file không sử dụng vào: ${outputPath}`);
    
    console.log('\nCảnh báo: Hãy kiểm tra kỹ danh sách trước khi xóa các file.');
    console.log('Một số file có thể được sử dụng động hoặc thông qua các cơ chế khác.');
    
    // Tạo script để xóa các file không sử dụng
    const deleteScriptPath = path.join(rootDir, 'delete-unused-files.js');
    const deleteScript = `// Script tự động tạo để xóa các file không sử dụng
const fs = require('fs');
const path = require('path');

const filesToDelete = [
${unusedFiles.map(file => `  '${file.replace(/\\/g, '\\\\')}'`).join(',\n')}
];

console.log('Bắt đầu xóa các file không sử dụng...');
filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    fs.unlinkSync(filePath);
    console.log(\`Đã xóa: \${file}\`);
  } catch (error) {
    console.error(\`Lỗi khi xóa \${file}:\`, error.message);
  }
});
console.log('Hoàn tất!');
`;
    
    fs.writeFileSync(deleteScriptPath, deleteScript, 'utf8');
    console.log(`Đã tạo script xóa file: ${deleteScriptPath}`);
    console.log('Để xóa các file không sử dụng, chạy lệnh: node delete-unused-files.js');
  } else {
    console.log('\nKhông tìm thấy file nào không được sử dụng. Dự án sạch!');
  }
}

// Chạy phân tích
findUnusedFiles();
