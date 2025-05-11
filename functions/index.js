const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();

// Kiểm tra xem người dùng có quyền admin hay không
async function isUserAdmin(uid) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    return userDoc.exists && userDoc.data().role === 'admin';
  } catch (error) {
    console.error('Lỗi khi kiểm tra quyền admin:', error);
    return false;
  }
}

// Cloud Function để xóa người dùng
exports.deleteUser = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Xác thực yêu cầu - yêu cầu token Firebase
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(403).json({error: 'Unauthorized'});
        return;
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Kiểm tra xem người gọi có phải là admin hay không
      if (!(await isUserAdmin(decodedToken.uid))) {
        res.status(403).json({error: 'Không có quyền xóa người dùng'});
        return;
      }
      
      // Lấy ID người dùng cần xóa
      const userId = req.body.userId;
      if (!userId) {
        res.status(400).json({error: 'ID người dùng không được cung cấp'});
        return;
      }
      
      // Xóa người dùng từ Authentication
      await admin.auth().deleteUser(userId);
      
      // Trả về kết quả thành công
      res.status(200).json({success: true, message: 'Đã xóa người dùng thành công'});
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      res.status(500).json({error: error.message});
    }
  });
});
