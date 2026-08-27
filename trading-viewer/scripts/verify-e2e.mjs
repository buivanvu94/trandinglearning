import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://127.0.0.1:4000';

function log(step, msg, pass = true) {
  const symbol = pass ? '✓' : '✗';
  console.log(`${symbol} [STEP ${step}] ${msg}`);
}

async function run() {
  console.log('=====================================================');
  console.log('🚀 RUNNING END-TO-END SYSTEM VERIFICATION');
  console.log('=====================================================\n');

  // STEP 1: Register New Student
  const testEmail = `student_${Date.now()}@example.com`;
  const testPass = 'StudentPass@123';
  const testName = 'Nguyễn Văn Học Viên';

  console.log(`1. Testing Registration for: ${testEmail}...`);
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPass,
      phone: '0988776655',
      note: 'Học viên đăng ký đợt 1',
    }),
  });

  const regData = await regRes.json();
  if (regRes.status === 201 && regData.status === 'pending') {
    log(1, `Đăng ký thành công! Trạng thái trả về: "${regData.status}" (Pending Approval)`);
  } else {
    log(1, `Đăng ký thất bại: ${JSON.stringify(regData)}`, false);
    process.exit(1);
  }

  // STEP 2: Attempt Login with Pending Account (Should be Blocked with 403)
  console.log('\n2. Testing Login with Pending Account (Must be blocked)...');
  const pendingLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPass,
    }),
  });

  const pendingLoginData = await pendingLoginRes.json();
  if (pendingLoginRes.status === 403 && pendingLoginData.code === 'ACCOUNT_PENDING') {
    log(2, `Chặn đăng nhập thành công! Thông báo: "${pendingLoginData.message}"`);
  } else {
    log(2, `Lỗi: Tài khoản pending không bị chặn đúng cách: ${JSON.stringify(pendingLoginData)}`, false);
    process.exit(1);
  }

  // STEP 3: Admin Login
  console.log('\n3. Testing Admin Login...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@tradingpro.com',
      password: 'Admin@123456',
    }),
  });

  const adminLoginData = await adminLoginRes.json();
  const adminCookie = adminLoginRes.headers.get('set-cookie');
  const adminToken = adminLoginData.token;

  if (adminLoginRes.status === 200 && adminLoginData.success && adminLoginData.user.role === 'admin') {
    log(3, `Admin đăng nhập thành công! Role: ${adminLoginData.user.role}, Name: ${adminLoginData.user.name}`);
  } else {
    log(3, `Admin đăng nhập thất bại: ${JSON.stringify(adminLoginData)}`, false);
    process.exit(1);
  }

  // STEP 4: Admin List Users & Find Pending Student
  console.log('\n4. Admin fetching users list...');
  const usersRes = await fetch(`${BASE_URL}/api/admin/users?status=pending`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      Cookie: adminCookie || `auth_token=${adminToken}`,
    },
  });

  const usersData = await usersRes.json();
  const targetUser = usersData.users?.find((u) => u.email === testEmail);

  if (usersRes.status === 200 && targetUser) {
    log(4, `Tìm thấy học viên trong danh sách chờ duyệt: ID #${targetUser.id}, Status: ${targetUser.status}`);
  } else {
    log(4, `Không tìm thấy user pending: ${JSON.stringify(usersData)}`, false);
    process.exit(1);
  }

  // STEP 5: Admin 1-Click Activate / Approve User
  console.log(`\n5. Admin activating user ID #${targetUser.id}...`);
  const activateRes = await fetch(`${BASE_URL}/api/admin/users/${targetUser.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
      Cookie: adminCookie || `auth_token=${adminToken}`,
    },
    body: JSON.stringify({ status: 'active' }),
  });

  const activateData = await activateRes.json();
  if (activateRes.status === 200 && activateData.user?.status === 'active') {
    log(5, `Admin kích hoạt thành công! Trạng thái mới: "${activateData.user.status}"`);
  } else {
    log(5, `Kích hoạt thất bại: ${JSON.stringify(activateData)}`, false);
    process.exit(1);
  }

  // STEP 6: Student Login After Approval (Must Succeed with 200)
  console.log('\n6. Student logging in after activation...');
  const activeLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPass,
    }),
  });

  const activeLoginData = await activeLoginRes.json();
  const studentToken = activeLoginData.token;
  const studentCookie = activeLoginRes.headers.get('set-cookie');

  if (activeLoginRes.status === 200 && activeLoginData.success) {
    log(6, `Học viên đăng nhập thành công! User: ${activeLoginData.user.name}, Token nhận được: OK`);
  } else {
    log(6, `Học viên đăng nhập sau khi kích hoạt thất bại: ${JSON.stringify(activeLoginData)}`, false);
    process.exit(1);
  }

  // STEP 7: ZIP Import Mechanism Test
  console.log('\n7. Testing ZIP Import Lesson Mechanism...');
  const sampleSlidePath = path.join(__dirname, '../public/lessons/1. TỔNG QUAN VỀ KHOÁ HỌC/slide_01.jpg');
  let sampleImageBuffer;
  if (fs.existsSync(sampleSlidePath)) {
    sampleImageBuffer = fs.readFileSync(sampleSlidePath);
  } else {
    sampleImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
  }

  const zip = new AdmZip();
  zip.addFile('slide_01.png', sampleImageBuffer);
  zip.addFile('slide_02.png', sampleImageBuffer);
  zip.addFile('slide_03.png', sampleImageBuffer);
  const zipBuffer = zip.toBuffer();

  const zipFileName = '15. Thấu hiểu Orderflow và Delta.zip';
  const formData = new FormData();
  const zipBlob = new Blob([zipBuffer], { type: 'application/zip' });
  formData.append('file', zipBlob, zipFileName);
  formData.append('description', 'Chuyên đề thực chiến Orderflow và Delta Footprint');

  const zipUploadRes = await fetch(`${BASE_URL}/api/admin/lessons/import-zip`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      Cookie: adminCookie || `auth_token=${adminToken}`,
    },
    body: formData,
  });

  const zipUploadData = await zipUploadRes.json();
  if (zipUploadRes.status === 201 && zipUploadData.success) {
    log(
      7,
      `Import ZIP thành công! Tên bài học: "${zipUploadData.lesson.title}", Số lượng slide: ${zipUploadData.lesson.slide_count}`
    );
  } else {
    log(7, `Import ZIP thất bại: ${JSON.stringify(zipUploadData)}`, false);
    process.exit(1);
  }

  // STEP 8: Verify Lesson in Public & Student APIs
  console.log('\n8. Verifying all lessons in database with student token...');
  const lessonsRes = await fetch(`${BASE_URL}/api/lessons`, {
    headers: {
      Authorization: `Bearer ${studentToken}`,
      Cookie: studentCookie || `auth_token=${studentToken}`,
    },
  });
  const lessonsData = await lessonsRes.json();

  const importedLesson = lessonsData.lessons?.find((l) => l.title.includes('Orderflow'));
  if (lessonsRes.status === 200 && importedLesson) {
    log(8, `Bài học mới đã xuất hiện trong hệ thống! ID: #${importedLesson.id}, Title: "${importedLesson.title}", Slides: ${importedLesson.slides.length}`);
  } else {
    log(8, `Bài học mới không có trong danh sách: ${JSON.stringify(lessonsData)}`, false);
    process.exit(1);
  }

  console.log('\n=====================================================');
  console.log('🎉 ALL 8/8 END-TO-END VERIFICATION CHECKS PASSED!');
  console.log('=====================================================');
}

run().catch((e) => {
  console.error('Test script error:', e);
  process.exit(1);
});
