/**
 * ================================================================================
 * ระบบตรวจสอบความสะอาดห้องเรียนและเขตพื้นที่รับผิดชอบ - โรงเรียนประชาสงเคราะห์วิทยา
 * Backend API & Automation Script (Code.gs)
 * ================================================================================
 * รองรับ: Google Sheets API v4, Google Drive API, REST API (doGet / doPost), CORS
 * ================================================================================
 */

// ==========================================
// 1. การกำหนดค่าระบบหลัก (Global Configurations)
// ==========================================
const CONFIG = {
  SPREADSHEET_ID: '1eVa3TkkXrwDLPyPWpo1Ux4qtvJeOfzkTz5yU11QO92M',
  DRIVE_FOLDER_ID: '1XpX-SdJ5Gw-Evd0PBsVPmoisIKzxuU_u',
  HEADER_BG_COLOR: '#065F46', // Dark Emerald Green
  HEADER_TEXT_COLOR: '#FFFFFF',
  TIMEZONE: 'Asia/Bangkok'
};

// ==========================================
// 2. ฟังก์ชันตั้งค่าชีตระบบเริ่มต้น (setupSystemSheets)
// ==========================================
/**
 * รันฟังก์ชันนี้ครั้งแรกเพื่อสร้างตาราง กำหนดหัวตาราง จัด Styling และเติมข้อมูลเริ่มต้นอัตโนมัติ 6 ชีต
 */
function setupSystemSheets() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  const sheetsDefinition = [
    {
      name: 'SETTING',
      headers: ['Key', 'Value', 'Description'],
      defaultData: [
        ['school_name', 'โรงเรียนประชาสงเคราะห์วิทยา', 'ชื่อโรงเรียนที่แสดงในระบบ'],
        ['school_logo', 'https://lh3.googleusercontent.com/pw/AP1GczNLx3RZP5eNhiYlYMV3vwy5-ukdanDiH3PHMeqMW2mhInkLQvJ38MefB4Agug-U-Xrk2Syj4BGcNcOWOS0DJZsEhBx6wXcWBOhOKzKGDXFQIWAExilHrEluIs9r4kgXwyySrWcTWBfpm5jIM939f_va=w497-h496-s-no-gm?authuser=0', 'URL โลโก้โรงเรียน'],
        ['system_announcement', '', 'ข้อความประกาศบนแถบแบนเนอร์ระบบ'],
        ['enable_room_check', 'TRUE', 'เปิด/ปิด ระบบตรวจห้องเรียน (TRUE/FALSE)'],
        ['enable_area_check', 'TRUE', 'เปิด/ปิด ระบบตรวจเขตพื้นที่รับผิดชอบ (TRUE/FALSE)'],
        ['academic_term', '1/2569', 'ภาคเรียน/ปีการศึกษาปัจจุบัน'],
        ['auto_delete_days', '0', 'จำนวนวันลบรูปภาพใน Drive อัตโนมัติ (0 = ไม่ลบ)']
      ]
    },
    {
      name: 'USERS',
      headers: ['user_id', 'full_name', 'pin', 'role', 'allowed_rooms', 'allowed_areas', 'is_active'],
      defaultData: [
        ['USR001', 'นางสาวกัญญารัตน์ แสงนรินทร์', '123456', 'teacher', 'all', 'all', 'TRUE'],
        ['USR002', 'นายสมชาย ใจดี', '654321', 'Inspector', '[ม.1/1,ม.1/2]', '[ม.1/1,ม.1/2]', 'TRUE']
      ]
    },
    {
      name: 'DB_classroom',
      headers: ['classroom', 'area_id', 'advisors'],
      defaultData: [
        ['ม.1/1', 'AREA001', '[ครูผกามาศ เสือคล้าย, ครูอุเทน หมื่นสุวรรณ์]'],
        ['ม.1/2', 'AREA001', '[ครูสมควร รักเรียน, ครูวิภาดา ใจเพียร]'],
        ['ม.2/1', 'AREA001', '[ครูอนุชา เก่งกล้า, ครูสุดา ประเสริฐ]'],
        ['ม.2/2', 'AREA001', '[ครูธนากร กิตติคุณ, ครูนฤมล สายทอง]'],
        ['ม.3/1', 'AREA001', '[ครูพิเชษฐ์ ปรีชา, ครูอรทัย ทองใบ]'],
        ['ม.3/2', 'AREA001', '[ครูชัยวัฒน์ ดวงดี, ครูรัตนา สุขสม]']
      ]
    },
    {
      name: 'DB_allArea',
      headers: ['area_id', 'area_name', 'area_description', 'is_active'],
      defaultData: [
        ['AREA001', 'หน้าเสาธง', 'บริเวณหน้าเสาธงทั้งหมดและทางเดินด้านหน้า', 'TRUE'],
        ['AREA002', 'โรงอาหาร', 'บริเวณที่รับประทานอาหารและจุดล้างจาน', 'TRUE'],
        ['AREA003', 'หอประชุม', 'ภายในหอประชุมและลานอเนกประสงค์', 'TRUE'],
        ['AREA004', 'สนามฟุตบอล', 'บริเวณสนามฟุตบอลและอัฒจันทร์', 'TRUE']
      ]
    },
    {
      name: 'LIST_allChecklist',
      headers: ['checklist_id', 'checklist_name', 'checklist_detail', 'max_score', 'is_active'],
      defaultData: [
        ['room001', 'พื้นห้อง', 'ต้องสะอาดไม่มีขยะ ฝุ่น และเศษกระดาษ', 3, 'TRUE'],
        ['room002', 'โต๊ะ-เก้าอี้', 'จัดเป็นระเบียบเรียบร้อย ไม่มีขยะใต้โต๊ะ', 3, 'TRUE'],
        ['room003', 'กระดานและหน้าห้อง', 'ลบกระดานสะอาด อุปกรณ์หน้าห้องวางเป็นระเบียบ', 2, 'TRUE'],
        ['room004', 'ถังขยะและมุมทำความสะอาด', 'เทขยะเรียบร้อย ไม้กวาดที่โกยผงจัดเก็บเข้าที่', 2, 'TRUE'],
        ['area001', 'ความสะอาดทั่วไป', 'ไม่มีใบไม้ตกค้าง ถังขยะเทเรียบร้อย', 5, 'TRUE'],
        ['area002', 'ความเป็นระเบียบเรียบร้อย', 'สิ่งของจัดวางเป็นระเบียบ ไม่มีสิ่งกีดขวางทางเดิน', 5, 'TRUE']
      ]
    },
    {
      name: 'DB_teachers',
      headers: ['teacherName'],
      defaultData: [
        ['ครูผกามาศ เสือคล้าย'],
        ['ครูอุเทน หมื่นสุวรรณ์'],
        ['ครูสมควร รักเรียน'],
        ['ครูวิภาดา ใจเพียร'],
        ['ครูอนุชา เก่งกล้า'],
        ['ครูสุดา ประเสริฐ'],
        ['ครูธนากร กิตติคุณ'],
        ['ครูนฤมล สายทอง'],
        ['ครูพิเชษฐ์ ปรีชา'],
        ['ครูอรทัย ทองใบ'],
        ['ครูชัยวัฒน์ ดวงดี'],
        ['ครูรัตนา สุขสม']
      ]
    },
    {
      name: 'LOG_inspections',
      headers: [
        'record_id',
        'timestamp',
        'date_str',
        'type',
        'target_id',
        'target_name',
        'inspector_name',
        'scores_json',
        'total_score',
        'max_score',
        'percentage',
        'comment',
        'image_urls_json',
        'term',
        'day_of_week'
      ],
      defaultData: []
    }
  ];

  sheetsDefinition.forEach(sheetDef => {
    let sheet = ss.getSheetByName(sheetDef.name);
    if (!sheet) {
      sheet = ss.insertSheet(sheetDef.name);
    }

    // ตั้งค่าหัวตาราง
    const headerRange = sheet.getRange(1, 1, 1, sheetDef.headers.length);
    headerRange.setValues([sheetDef.headers]);
    headerRange.setBackground(CONFIG.HEADER_BG_COLOR);
    headerRange.setFontColor(CONFIG.HEADER_TEXT_COLOR);
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    sheet.setRowHeight(1, 36);
    sheet.setFrozenRows(1);

    // เติมข้อมูลเริ่มต้นหากยังไม่มีข้อมูล
    if (sheetDef.defaultData.length > 0 && sheet.getLastRow() <= 1) {
      const dataRange = sheet.getRange(2, 1, sheetDef.defaultData.length, sheetDef.headers.length);
      dataRange.setValues(sheetDef.defaultData);
      dataRange.setVerticalAlignment('middle');
    }

    // Auto fit column widths
    for (let c = 1; c <= sheetDef.headers.length; c++) {
      sheet.autoResizeColumn(c);
    }
  });

  Logger.log('✅ ตั้งค่าชีตระบบทั้ง 7 ชีตเรียบร้อยสมบูรณ์');
  return { status: 'success', message: 'Setup sheets completed successfully' };
}

// ==========================================
// 3. ฟังก์ชันดึงข้อมูลกลาง (Sheets API v4)
// ==========================================
/**
 * ดึงข้อมูลตารางแปลงเป็น Array of Objects ตามหัวคอลัมน์แถวที่ 1
 * @param {string} spreadsheetID - ID ของ Google Sheets
 * @param {string} rangeA1 - Range เช่น "SETTING!A1:C" หรือ "DB_classroom"
 * @param {number} indexID - Index คอลัมน์หลักสำหรับกรองแถวว่าง (เริ่มต้น 0)
 * @returns {Array<Object>} ข้อมูลในรูปแบบ Object
 */
function getDataByHeaderAPI(spreadsheetID, rangeA1, indexID = 0) {
  try {
    if (!spreadsheetID) spreadsheetID = CONFIG.SPREADSHEET_ID;
    
    // ตัดตัวเลขแถวออกเพื่อให้ได้รูปแบบ SheetName!A:Z
    let sheetPart = '';
    let colPart = '';
    
    if (rangeA1.includes('!')) {
      const parts = rangeA1.split('!');
      sheetPart = parts[0];
      colPart = parts[1].replace(/[0-9]/g, '');
    } else {
      sheetPart = rangeA1;
      colPart = 'A:Z';
    }

    const cleanRange = colPart ? `${sheetPart}!${colPart}` : `${sheetPart}!A:Z`;

    // เรียกใช้ Google Sheets API v4
    const response = Sheets.Spreadsheets.Values.get(spreadsheetID, cleanRange);
    const values = response.values;

    if (!values || values.length <= 1) {
      return [];
    }

    const headers = values[0].map(h => String(h).trim());
    const result = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const keyColValue = row[indexID] !== undefined ? String(row[indexID]).trim() : '';

      // หากคอลัมน์หลักว่าง ให้ข้ามแถวนั้น
      if (keyColValue === '') {
        continue;
      }

      const item = {};
      headers.forEach((header, colIndex) => {
        if (header) {
          item[header] = row[colIndex] !== undefined ? row[colIndex] : '';
        }
      });
      result.push(item);
    }

    return result;
  } catch (error) {
    Logger.log(`⚠️ เกิดข้อผิดพลาดใน getDataByHeaderAPI (${rangeA1}): ${error.toString()}`);
    return [];
  }
}

// ==========================================
// 4. API Request Routers (doGet & doPost)
// ==========================================
/**
 * จัดการ HTTP GET Requests
 */
function doGet(e) {
  try {
    const action = e && e.parameter && e.parameter.action ? e.parameter.action : 'getInitialData';

    switch (action) {
      case 'getInitialData':
        return createJsonResponse(handleGetInitialData());

      case 'getTodaySummary':
        return createJsonResponse(handleGetTodaySummary());

      case 'getStatsLogs':
        return createJsonResponse(handleGetStatsLogs(e && e.parameter));

      case 'autoClean':
        return createJsonResponse(autoCleanDriveImages());

      case 'syncImages':
        return createJsonResponse(syncDriveImagesToSheetLogs());

      case 'exportTodayReport':
        return createJsonResponse(handleExportTodayReport(e && e.parameter));

      default:
        return createJsonResponse({
          status: 'success',
          message: 'PCSK Check Classroom API is running online.',
          timestamp: new Date().toISOString()
        });
    }
  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

/**
 * จัดการ HTTP POST Requests (รองรับ JSON Payload)
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action || (e && e.parameter && e.parameter.action);

    switch (action) {
      case 'getInitialData':
        return createJsonResponse(handleGetInitialData());

      case 'getStatsLogs':
        return createJsonResponse(handleGetStatsLogs(payload));

      case 'verifyPin':
        return createJsonResponse(handleVerifyPin(payload));

      case 'saveInspection':
        return createJsonResponse(handleSaveInspection(payload));

      case 'saveSystemSettings':
        return createJsonResponse(handleSaveSystemSettings(payload));

      case 'manageClassroom':
        return createJsonResponse(handleManageClassroom(payload));

      case 'manageArea':
        return createJsonResponse(handleManageArea(payload));

      case 'manageChecklist':
        return createJsonResponse(handleManageChecklist(payload));

      case 'manageTeacher':
        return createJsonResponse(handleManageTeacher(payload));

      case 'manageUser':
        return createJsonResponse(handleManageUser(payload));

      case 'autoClean':
        return createJsonResponse(autoCleanDriveImages());

      case 'syncImages':
        return createJsonResponse(syncDriveImagesToSheetLogs());

      case 'exportTodayReport':
        return createJsonResponse(handleExportTodayReport(payload));

      default:
        return createJsonResponse({
          status: 'error',
          message: `Unknown action: ${action}`
        });
    }
  } catch (error) {
    return createJsonResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

// ==========================================
// 5. Backend Service Handlers
// ==========================================

/**
 * ดึงข้อมูลเริ่มต้นทั้งหมดสำหรับ Single Page Application
 */
function handleGetInitialData() {
  const settingsList = getDataByHeaderAPI(CONFIG.SPREADSHEET_ID, 'SETTING!A:C', 0);
  const settingsMap = {};
  settingsList.forEach(item => {
    settingsMap[item.Key] = item.Value;
  });

  // ดึง USERS แต่ตัดฟิลด์ PIN ออกเพื่อความปลอดภัยในกรณี Initial Load
  const usersRaw = getDataByHeaderAPI(CONFIG.SPREADSHEET_ID, 'USERS!A:G', 0);
  const usersSanitized = usersRaw.map(u => ({
    user_id: u.user_id,
    full_name: u.full_name,
    role: u.role,
    allowed_rooms: parseJsonOrRaw(u.allowed_rooms),
    allowed_areas: parseJsonOrRaw(u.allowed_areas),
    is_active: String(u.is_active).toUpperCase() === 'TRUE'
  }));

  const classrooms = getDataByHeaderAPI(CONFIG.SPREADSHEET_ID, 'DB_classroom!A:C', 0).map(c => ({
    classroom: c.classroom,
    area_id: c.area_id,
    advisors: parseJsonOrRaw(c.advisors)
  }));

  // ส่งคืนข้อมูลเขตพื้นที่ทั้งหมด (รวม is_active)
  const areas = getDataByHeaderAPI(CONFIG.SPREADSHEET_ID, 'DB_allArea!A:D', 0).map(a => ({
    area_id: a.area_id,
    area_name: a.area_name,
    area_description: a.area_description || '',
    is_active: String(a.is_active).toUpperCase() === 'TRUE'
  }));

  // ส่งคืนข้อมูลเกณฑ์การตรวจทั้งหมด (รวม is_active)
  const checklists = getDataByHeaderAPI(CONFIG.SPREADSHEET_ID, 'LIST_allChecklist!A:E', 0).map(c => ({
    checklist_id: c.checklist_id,
    checklist_name: c.checklist_name,
    checklist_detail: c.checklist_detail || '',
    max_score: Number(c.max_score || 3),
    is_active: String(c.is_active).toUpperCase() === 'TRUE'
  }));

  // ดึงรายชื่อครูจาก DB_teachers
  const teachersRaw = getDataByHeaderAPI(CONFIG.SPREADSHEET_ID, 'DB_teachers!A:A', 0);
  const teachers = teachersRaw
    .map(t => String(t.teacherName || '').trim())
    .filter(name => name.length > 0);

  const todaySummary = handleGetTodaySummary();
  let statsData = null;
  try {
    const statsRes = handleGetStatsLogs();
    if (statsRes && statsRes.status === 'success') {
      statsData = statsRes.data;
    }
  } catch (e) {}

  return {
    status: 'success',
    data: {
      settings: settingsMap,
      users: usersSanitized,
      classrooms: classrooms,
      areas: areas,
      checklists: checklists,
      teachers: teachers,
      todaySummary: todaySummary,
      statsData: statsData
    }
  };
}

/**
 * ตรวจสอบ PIN และส่งคืนข้อมูลผู้ใช้งาน (ไม่ส่งค่า PIN กลับ)
 */
function handleVerifyPin(payload) {
  const pin = String(payload.pin || '').trim();
  if (!pin || pin.length < 4) {
    return { status: 'error', message: 'กรุณาระบุ PIN ให้ถูกต้อง' };
  }

  const users = getDataByHeaderAPI(CONFIG.SPREADSHEET_ID, 'USERS!A:G', 0);
  const user = users.find(u => String(u.pin).trim() === pin && String(u.is_active).toUpperCase() === 'TRUE');

  if (!user) {
    return { status: 'error', message: 'รหัส PIN ไม่ถูกต้อง หรือบัญชีถูกระงับการใช้งาน' };
  }

  return {
    status: 'success',
    message: 'เข้าสู่ระบบสำเร็จ',
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      role: user.role,
      allowed_rooms: parseJsonOrRaw(user.allowed_rooms),
      allowed_areas: parseJsonOrRaw(user.allowed_areas)
    }
  };
}

/**
 * บันทึกผลการตรวจ พร้อมอัปโหลดรูปภาพลง Google Drive และเขียนลงชีต LOG_inspections
 */
function handleSaveInspection(payload) {
  const lock = LockService.getScriptLock();
  try {
    // รอรับ Lock สูงสุด 30 วินาที เพื่อป้องกัน Race Condition
    lock.waitLock(30000);

    const now = new Date();
    const dateStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd');
    const timestampStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
    const recordId = 'REC-' + Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyyMMdd-HHmmss') + '-' + Math.floor(100 + Math.random() * 900);

    const type = payload.type || 'room'; // 'room' หรือ 'area'
    const targetId = payload.target_id || '';
    const targetName = payload.target_name || '';
    const inspectorName = payload.inspector_name || '';
    const scores = payload.scores || [];
    const totalScore = Number(payload.total_score || 0);
    const maxScore = Number(payload.max_score || 0);
    const percentage = Number(payload.percentage || 0);
    const comment = payload.comment || '';
    const term = payload.term || '1/2569';
    const images = payload.images || []; // Array of Base64 strings or { data, mimeType, filename }

    // จัดการอัปโหลดรูปภาพลง Google Drive
    const imageUrls = [];
    if (Array.isArray(images) && images.length > 0) {
      let folder;
      try {
        folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      } catch (err) {
        Logger.log('⚠️ ไม่พบโฟลเดอร์ Drive ตาม ID ที่ระบุ: ' + err.toString());
        folder = DriveApp.getRootFolder();
      }

      images.forEach((img, idx) => {
        try {
          let base64Data = '';
          let mimeType = 'image/jpeg';
          let filename = `${type}_${targetId}_${recordId}_${idx + 1}.jpg`;

          if (typeof img === 'string') {
            const matches = img.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              mimeType = matches[1];
              base64Data = matches[2];
            } else {
              base64Data = img;
            }
          } else if (img && img.data) {
            base64Data = img.data.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
            if (img.mimeType) mimeType = img.mimeType;
            if (img.filename) filename = img.filename;
          }

          if (base64Data) {
            const decodedBytes = Utilities.base64Decode(base64Data);
            const blob = Utilities.newBlob(decodedBytes, mimeType, filename);
            const file = folder.createFile(blob);
            const fileId = file.getId();
            
            // ตั้งค่า Permission (แยก try-catch ป้องกันข้อผิดพลาดกรณี Google Workspace บล็อค Public Sharing)
            try {
              file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            } catch (shareErr) {
              try {
                file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
              } catch (domErr) {
                Logger.log(`Note: setSharing skipped for file ${fileId}: ${shareErr.toString()}`);
              }
            }
            
            // Direct View URL for optimal preview and cross-browser Fancybox compatibility (LINE, Brave, Safari, Chrome)
            const previewUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
            const lh3Url = `https://lh3.googleusercontent.com/d/${fileId}`;
            let directUrl = `https://drive.google.com/file/d/${fileId}/view`;
            try {
              directUrl = file.getUrl();
            } catch (urlErr) {
              // fallback url
            }

            imageUrls.push({
              id: fileId,
              name: filename,
              url: previewUrl,
              lh3Url: lh3Url,
              driveUrl: directUrl
            });
          }
        } catch (imgErr) {
          Logger.log(`⚠️ เกิดข้อผิดพลาดในการอัปโหลดรูปที่ ${idx + 1}: ${imgErr.toString()}`);
        }
      });
    }

    // ตรวจสอบข้อมูลในชีต LOG_inspections เพื่อหาแถวเดิมของวันนี้ (เทียบ date_str วันนี้ และ target_id ที่ส่งมา)
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const logSheet = ss.getSheetByName('LOG_inspections');
    const lastRow = logSheet.getLastRow();
    const lastCol = logSheet.getLastColumn();

    let existingRowIndex = -1; // 1-indexed สำหรับ getRange
    let oldImageUrls = [];

    if (lastRow > 1) {
      // ดึงทั้ง getValues() และ getDisplayValues() เพื่อป้องกันปัญหา Date Object formatting
      const values = logSheet.getRange(1, 1, lastRow, lastCol).getValues();
      const displayValues = logSheet.getRange(1, 1, lastRow, lastCol).getDisplayValues();
      
      const headers = displayValues[0].map(h => String(h).trim().toLowerCase());
      const dateCol = headers.indexOf('date_str');
      const targetIdCol = headers.indexOf('target_id');
      const imgCol = headers.indexOf('image_urls_json');

      const todayFormatted = String(dateStr).trim();
      const currentTargetId = String(targetId).trim().toLowerCase();

      for (let r = 1; r < lastRow; r++) {
        // 1. ตรวจสอบ date_str
        let rowDateStr = String(displayValues[r][dateCol]).trim();
        const rawDate = values[r][dateCol];

        if (rawDate instanceof Date) {
          rowDateStr = Utilities.formatDate(rawDate, CONFIG.TIMEZONE, 'yyyy-MM-dd');
        } else if (rowDateStr && !rowDateStr.includes(todayFormatted)) {
          try {
            const parsed = new Date(rowDateStr);
            if (!isNaN(parsed.getTime())) {
              rowDateStr = Utilities.formatDate(parsed, CONFIG.TIMEZONE, 'yyyy-MM-dd');
            }
          } catch (e) {}
        }

        // 2. ตรวจสอบ target_id
        const rowTargetId = String(displayValues[r][targetIdCol]).trim().toLowerCase();

        // หาก date_str ตรงกับวันนี้ และ target_id ตรงกับที่กำลังบันทึก
        if (rowDateStr === todayFormatted && rowTargetId === currentTargetId) {
          existingRowIndex = r + 1; // 1-indexed ในชีต
          if (imgCol !== -1) {
            oldImageUrls = parseJsonOrRaw(values[r][imgCol]);
          }
          break;
        }
      }
    }

    // หากมีการอัปโหลดรูปภาพใหม่ และเป็นการบันทึกทับข้อมูลเดิม ให้ลบรูปเก่าใน Drive เพื่อประหยัดพื้นที่
    if (existingRowIndex > 0 && Array.isArray(oldImageUrls) && oldImageUrls.length > 0 && imageUrls.length > 0) {
      oldImageUrls.forEach(oldImg => {
        try {
          const oldFileId = typeof oldImg === 'string' ? oldImg : oldImg.id;
          if (oldFileId) {
            DriveApp.getFileById(oldFileId).setTrashed(true);
          }
        } catch (delErr) {
          Logger.log(`Note: ไม่สามารถลบรูปเดิมได้: ${delErr.toString()}`);
        }
      });
    }

    // ตรวจสอบและสร้างหัวตาราง day_of_week ในคอลัมน์ O (15) หากยังไม่มี
    const dayOfWeek = getThaiDayOfWeek(dateStr);
    /*try {
      const headerCheck = logSheet.getRange(1, 1, 1, Math.max(lastCol, 15)).getDisplayValues()[0];
      if (!headerCheck[14] || String(headerCheck[14]).trim() === '') {
        logSheet.getRange(1, 15).setValue('day_of_week');
      }
    } catch (headErr) {}*/

    const rowData = [
      recordId,
      timestampStr,
      dateStr,
      type,
      targetId,
      targetName,
      inspectorName,
      JSON.stringify(scores),
      totalScore,
      maxScore,
      percentage,
      comment,
      JSON.stringify(imageUrls),
      term,
      dayOfWeek
    ];

    let responseMessage = '';
    if (existingRowIndex > 0) {
      // ทำการบันทึกทับ (Overwrite) แถวเดิมของวันนี้
      logSheet.getRange(existingRowIndex, 1, 1, rowData.length).setValues([rowData]);
      responseMessage = 'บันทึกทับผลการตรวจสอบเดิมของวันนี้เรียบร้อยแล้ว';
    } else {
      // เพิ่มแถวใหม่ (Insert)
      logSheet.appendRow(rowData);
      responseMessage = 'บันทึกผลการตรวจสอบเรียบร้อยแล้ว';
    }

    return {
      status: 'success',
      message: responseMessage,
      record_id: recordId,
      day_of_week: dayOfWeek,
      is_overwritten: existingRowIndex > 0,
      image_count: imageUrls.length,
      image_urls: imageUrls
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการบันทึก: ' + error.toString()
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * ดึงสรุปประวัติผลการตรวจสอบของวันปัจจุบัน
 */
function handleGetTodaySummary() {
  try {
    const todayStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
    const logs = getDataByHeaderAPI(CONFIG.SPREADSHEET_ID, 'LOG_inspections!A:N', 0);
    
    // กรองเฉพาะประวัติของวันนี้
    const todayLogs = logs.filter(log => {
      let logDate = String(log.date_str || '').trim();
      if (logDate === todayStr) return true;
      try {
        const d = new Date(logDate);
        if (!isNaN(d.getTime())) {
          return Utilities.formatDate(d, CONFIG.TIMEZONE, 'yyyy-MM-dd') === todayStr;
        }
      } catch (e) {}
      return false;
    }).map(log => ({
      record_id: log.record_id,
      timestamp: log.timestamp,
      date_str: log.date_str,
      type: log.type,
      target_id: log.target_id,
      target_name: log.target_name,
      inspector_name: log.inspector_name,
      scores: parseJsonOrRaw(log.scores_json),
      total_score: Number(log.total_score || 0),
      max_score: Number(log.max_score || 0),
      percentage: Number(log.percentage || 0),
      comment: log.comment,
      image_urls: parseJsonOrRaw(log.image_urls_json),
      term: log.term
    }));

    return todayLogs;
  } catch (err) {
    Logger.log('⚠️ เกิดข้อผิดพลาดใน handleGetTodaySummary: ' + err.toString());
    return [];
  }
}

// ==========================================
// 6. ฟังก์ชันทำความสะอาดข้อมูลอัตโนมัติ (Automated Cleaner)
// ==========================================
/**
 * ลบไฟล์รูปภาพใน Drive และเคลียร์ URL ใน LOG_inspections ตาม auto_delete_days
 */
function autoCleanDriveImages() {
  try {
    const settingsList = getDataByHeaderAPI(CONFIG.SPREADSHEET_ID, 'SETTING!A:C', 0);
    let autoDeleteDays = 0;
    settingsList.forEach(item => {
      if (item.Key === 'auto_delete_days') {
        autoDeleteDays = parseInt(item.Value, 10) || 0;
      }
    });

    if (autoDeleteDays <= 0) {
      return { status: 'skipped', message: 'auto_delete_days is 0 (Disabled)' };
    }

    const cutoffTime = new Date().getTime() - (autoDeleteDays * 24 * 60 * 60 * 1000);
    const cutoffDate = new Date(cutoffTime);
    let deletedFilesCount = 0;
    let updatedLogsCount = 0;

    // 1. ลบไฟล์ในโฟลเดอร์ Google Drive
    try {
      const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      const files = folder.getFiles();
      while (files.hasNext()) {
        const file = files.next();
        if (file.getDateCreated().getTime() < cutoffTime) {
          file.setTrashed(true);
          deletedFilesCount++;
        }
      }
    } catch (driveErr) {
      Logger.log('⚠️ เกิดข้อผิดพลาดในการเข้าถึงโฟลเดอร์ Drive: ' + driveErr.toString());
    }

    // 2. เคลียร์ image_urls_json ในชีต LOG_inspections
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('LOG_inspections');
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      if (data.length > 1) {
        const headers = data[0];
        const timestampIndex = headers.indexOf('timestamp');
        const imgIndex = headers.indexOf('image_urls_json');

        if (timestampIndex !== -1 && imgIndex !== -1) {
          for (let r = 1; r < data.length; r++) {
            const rawTimestamp = data[r][timestampIndex];
            const currentImgVal = String(data[r][imgIndex]).trim();

            if (currentImgVal && currentImgVal !== '[]') {
              const rowDate = new Date(rawTimestamp);
              if (!isNaN(rowDate.getTime()) && rowDate.getTime() < cutoffTime) {
                sheet.getRange(r + 1, imgIndex + 1).setValue('[]');
                updatedLogsCount++;
              }
            }
          }
        }
      }
    }

    Logger.log(`🧹 ทำความสะอาดเรียบร้อย: ลบ ${deletedFilesCount} รูป และอัปเดต ${updatedLogsCount} รายการ log`);
    return {
      status: 'success',
      deleted_files: deletedFilesCount,
      updated_logs: updatedLogsCount,
      cutoff_date: Utilities.formatDate(cutoffDate, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss')
    };
  } catch (error) {
    Logger.log('⚠️ เกิดข้อผิดพลาดใน autoCleanDriveImages: ' + error.toString());
    return { status: 'error', message: error.toString() };
  }
}

/**
 * ติดตั้ง Time-driven Trigger ทำงานทุกวันช่วงตี 1 - ตี 2 อัตโนมัติ
 */
function setupDailyTrigger() {
  // ลบ Trigger เดิมของฟังก์ชันนี้ก่อน
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'autoCleanDriveImages') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // สร้าง Trigger ใหม่
  ScriptApp.newTrigger('autoCleanDriveImages')
    .timeBased()
    .everyDays(1)
    .atHour(1)
    .create();

  Logger.log('✅ ติดตั้ง Daily Trigger สำหรับ autoCleanDriveImages เรียบร้อยแล้ว');
  return { status: 'success', message: 'Daily trigger installed successfully' };
}

/**
 * ฟังก์ชันกู้คืน/เชื่อมโยงรูปภาพใน Drive เข้ากับแถวข้อมูลใน LOG_inspections ที่ image_urls_json ยังเป็น []
 * สามารถกดรันฟังก์ชันนี้ใน Apps Script เพื่อซ่อมแซมข้อมูลย้อนหลังได้ทันที
 */
function syncDriveImagesToSheetLogs() {
  try {
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const files = folder.getFiles();
    const fileMap = {}; // record_id -> [imageObjs]

    while (files.hasNext()) {
      const file = files.next();
      const filename = file.getName();
      const fileId = file.getId();
      
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) {}

      // แยก recordId จากชื่อไฟล์ เช่น room_ม.1-1_REC-20260820-191500-123_1.jpg
      const parts = filename.split('_');
      let recordId = '';
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith('REC-')) {
          recordId = parts[i];
          break;
        }
      }

      if (recordId) {
        if (!fileMap[recordId]) fileMap[recordId] = [];
        fileMap[recordId].push({
          id: fileId,
          name: filename,
          url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`,
          lh3Url: `https://lh3.googleusercontent.com/d/${fileId}`,
          driveUrl: `https://drive.google.com/file/d/${fileId}/view`
        });
      }
    }

    // อัปเดตข้อมูลลงชีต LOG_inspections
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('LOG_inspections');
    if (!sheet) return { status: 'error', message: 'Sheet LOG_inspections not found' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'success', message: 'No logs to sync' };

    const headers = data[0];
    const recIdCol = headers.indexOf('record_id');
    const imgCol = headers.indexOf('image_urls_json');

    if (recIdCol === -1 || imgCol === -1) {
      return { status: 'error', message: 'Headers not found' };
    }

    let updatedCount = 0;
    for (let r = 1; r < data.length; r++) {
      const recId = String(data[r][recIdCol]).trim();
      const currentImgVal = String(data[r][imgCol]).trim();

      if ((!currentImgVal || currentImgVal === '[]') && fileMap[recId] && fileMap[recId].length > 0) {
        sheet.getRange(r + 1, imgCol + 1).setValue(JSON.stringify(fileMap[recId]));
        updatedCount++;
      }
    }

    Logger.log(`✅ ซิงก์รูปภาพสำเร็จ: กู้คืนและอัปเดตข้อมูล ${updatedCount} แถวใน LOG_inspections`);
    return { status: 'success', updated_rows: updatedCount };
  } catch (error) {
    Logger.log(`⚠️ เกิดข้อผิดพลาดใน syncDriveImagesToSheetLogs: ${error.toString()}`);
    return { status: 'error', message: error.toString() };
  }
}

// ==========================================
// 7. Helper Utilities
// ==========================================
/**
 * สร้าง HTTP JSON Response รองรับ CORS สำหรับ Vercel SPA
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * แปลง String ในรูปแบบ Array/JSON ให้เป็น Object หรือส่งค่าเดิมกลับ
 */
function parseJsonOrRaw(val) {
  if (val === undefined || val === null || val === '') return [];
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  
  // รองรับรูปแบบ [ม.1/1,ม.1/2] หรือ [ครูผกามาศ, ครูอุเทน] ที่อาจไม่ใช่ Valid JSON
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      const inner = trimmed.substring(1, trimmed.length - 1);
      return inner.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
  }
  return trimmed;
}

// ==========================================
// 8. การจัดการการตั้งค่าระบบ (System Settings & Master Data Management)
// ==========================================

/**
 * บันทึกการตั้งค่าระบบในชีต SETTING
 */
function handleSaveSystemSettings(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('SETTING');
    if (!sheet) return { status: 'error', message: 'ไม่พบชีต SETTING' };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { status: 'error', message: 'ไม่มีข้อมูลในชีต SETTING' };

    const keyIndex = 0; // Column A
    const valIndex = 1; // Column B

    const updates = {
      system_announcement: payload.system_announcement !== undefined ? String(payload.system_announcement).trim() : undefined,
      enable_room_check: payload.enable_room_check !== undefined ? (String(payload.enable_room_check).toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE') : undefined,
      enable_area_check: payload.enable_area_check !== undefined ? (String(payload.enable_area_check).toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE') : undefined,
      academic_term: payload.academic_term !== undefined ? String(payload.academic_term).trim() : undefined,
      auto_delete_days: payload.auto_delete_days !== undefined ? String(payload.auto_delete_days).trim() : undefined,
      session_timeout_minutes: payload.session_timeout_minutes !== undefined ? String(payload.session_timeout_minutes).trim() : undefined
    };

    const foundKeys = {};
    for (let r = 1; r < data.length; r++) {
      const key = String(data[r][keyIndex]).trim();
      if (updates[key] !== undefined) {
        sheet.getRange(r + 1, valIndex + 1).setValue(updates[key]);
        foundKeys[key] = true;
      }
    }

    // หากมี key ที่ส่งมาแต่ยังไม่มีในชีต SETTING ให้ appendRow อัตโนมัติ
    Object.keys(updates).forEach(k => {
      if (updates[k] !== undefined && !foundKeys[k]) {
        sheet.appendRow([k, updates[k], '']);
      }
    });

    return { status: 'success', message: 'บันทึกการตั้งค่าระบบสำเร็จ' };
  } catch (error) {
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า: ' + error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * จัดการข้อมูลห้องเรียน (DB_classroom) : create, update, delete
 */
function handleManageClassroom(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('DB_classroom');
    if (!sheet) return { status: 'error', message: 'ไม่พบชีต DB_classroom' };

    const mode = payload.mode || 'create'; // 'create' | 'update' | 'delete'
    const classroom = String(payload.classroom || '').trim();
    const oldClassroom = String(payload.old_classroom || classroom).trim();
    const areaId = String(payload.area_id || '').trim();
    let advisors = payload.advisors || [];

    if (typeof advisors === 'string') {
      advisors = parseJsonOrRaw(advisors);
    }
    if (!Array.isArray(advisors)) {
      advisors = [String(advisors)];
    }
    advisors = advisors.map(a => String(a).trim()).filter(a => a.length > 0);

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim().toLowerCase());
    const classCol = headers.indexOf('classroom');
    const areaCol = headers.indexOf('area_id');
    const advCol = headers.indexOf('advisors');

    if (classCol === -1 || areaCol === -1 || advCol === -1) {
      return { status: 'error', message: 'หัวตาราง DB_classroom ไม่ถูกต้อง' };
    }

    // Validation for create/update
    if (mode === 'create' || mode === 'update') {
      // 1. ตรวจสอบรูปแบบห้องเรียน ม.x/y (x: 1-6, y: 1-15)
      const roomRegex = /^ม\.[1-6]\/(1[0-5]|[1-9])$/;
      if (!roomRegex.test(classroom)) {
        return {
          status: 'error',
          message: 'รูปแบบห้องเรียนไม่ถูกต้อง ต้องอยู่ในรูปแบบ ม.x/y เช่น ม.1/1 ถึง ม.6/15'
        };
      }

      // 2. ตรวจสอบครูที่ปรึกษา (1 - 3 คน)
      if (advisors.length < 1 || advisors.length > 3) {
        return {
          status: 'error',
          message: 'ครูที่ปรึกษาต้องมีอย่างน้อย 1 คน และไม่เกิน 3 คน'
        };
      }

      // 3. ตรวจสอบความซ้ำซ้อนภายในชีต (classroom ห้ามซ้ำ, area_id ห้ามซ้ำหากมีการระบุ)
      for (let r = 1; r < data.length; r++) {
        const rowClass = String(data[r][classCol]).trim();
        const rowArea = String(data[r][areaCol]).trim();

        // กรณี Create: ห้ามซ้ำกับแถวใดๆ
        if (mode === 'create') {
          if (rowClass === classroom) {
            return { status: 'error', message: `ห้องเรียน ${classroom} มีอยู่ในระบบแล้ว` };
          }
          if (areaId && rowArea === areaId) {
            return { status: 'error', message: `เขตพื้นที่ ${areaId} ถูกผูกไว้กับห้อง ${rowClass} แล้ว (ห้ามซ้ำกัน)` };
          }
        }

        // กรณี Update: ข้ามแถวของตัวเอง (เทียบกับ oldClassroom)
        if (mode === 'update') {
          if (rowClass !== oldClassroom) {
            if (rowClass === classroom) {
              return { status: 'error', message: `ห้องเรียน ${classroom} มีอยู่ในระบบแล้ว` };
            }
            if (areaId && rowArea === areaId) {
              return { status: 'error', message: `เขตพื้นที่ ${areaId} ถูกผูกไว้กับห้อง ${rowClass} แล้ว (ห้ามซ้ำกัน)` };
            }
          }
        }
      }
    }

    const advisorsJsonStr = JSON.stringify(advisors);

    if (mode === 'create') {
      sheet.appendRow([classroom, areaId, advisorsJsonStr]);
      return { status: 'success', message: `เพิ่มห้องเรียน ${classroom} สำเร็จ` };
    }

    if (mode === 'update') {
      let targetRowIndex = -1;
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][classCol]).trim() === oldClassroom) {
          targetRowIndex = r + 1; // 1-indexed
          break;
        }
      }

      if (targetRowIndex === -1) {
        return { status: 'error', message: `ไม่พบข้อมูลห้องเรียน ${oldClassroom} ที่ต้องการแก้ไข` };
      }

      sheet.getRange(targetRowIndex, classCol + 1).setValue(classroom);
      sheet.getRange(targetRowIndex, areaCol + 1).setValue(areaId);
      sheet.getRange(targetRowIndex, advCol + 1).setValue(advisorsJsonStr);

      return { status: 'success', message: `แก้ไขข้อมูลห้องเรียน ${classroom} สำเร็จ` };
    }

    if (mode === 'delete') {
      let targetRowIndex = -1;
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][classCol]).trim() === classroom) {
          targetRowIndex = r + 1;
          break;
        }
      }

      if (targetRowIndex === -1) {
        return { status: 'error', message: `ไม่พบข้อมูลห้องเรียน ${classroom} ที่ต้องการลบ` };
      }

      sheet.deleteRow(targetRowIndex);
      return { status: 'success', message: `ลบข้อมูลห้องเรียน ${classroom} เรียบร้อยแล้ว` };
    }

    return { status: 'error', message: `Invalid mode: ${mode}` };
  } catch (error) {
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการจัดการห้องเรียน: ' + error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * จัดการข้อมูลเขตพื้นที่รับผิดชอบ (DB_allArea) : create, update, delete, toggle
 */
function handleManageArea(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('DB_allArea');
    if (!sheet) return { status: 'error', message: 'ไม่พบชีต DB_allArea' };

    const mode = payload.mode || 'create'; // 'create' | 'update' | 'delete' | 'toggle'
    let areaId = String(payload.area_id || '').trim();
    const areaName = String(payload.area_name || '').trim();
    const areaDesc = String(payload.area_description || '').trim();
    const isActive = payload.is_active !== undefined ? (String(payload.is_active).toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE') : 'TRUE';

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim().toLowerCase());
    const idCol = headers.indexOf('area_id');
    const nameCol = headers.indexOf('area_name');
    const descCol = headers.indexOf('area_description');
    const activeCol = headers.indexOf('is_active');

    if (idCol === -1 || nameCol === -1 || activeCol === -1) {
      return { status: 'error', message: 'หัวตาราง DB_allArea ไม่ถูกต้อง' };
    }

    if (mode === 'create') {
      if (!areaName) {
        return { status: 'error', message: 'กรุณาระบุชื่อเขตพื้นที่' };
      }

      // Auto-generate next area_id (e.g. AREA001 -> find max number + 1)
      let maxNum = 0;
      for (let r = 1; r < data.length; r++) {
        const id = String(data[r][idCol]).trim();
        const match = id.match(/^AREA(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }

      const nextNum = maxNum + 1;
      areaId = 'AREA' + String(nextNum).padStart(3, '0');

      sheet.appendRow([areaId, areaName, areaDesc, isActive]);
      return {
        status: 'success',
        message: `เพิ่มเขตพื้นที่ ${areaName} (${areaId}) สำเร็จ`,
        area_id: areaId
      };
    }

    if (mode === 'update') {
      if (!areaId) return { status: 'error', message: 'ไม่พบรหัสเขตพื้นที่' };
      if (!areaName) return { status: 'error', message: 'กรุณาระบุชื่อเขตพื้นที่' };

      let targetRowIndex = -1;
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][idCol]).trim() === areaId) {
          targetRowIndex = r + 1;
          break;
        }
      }

      if (targetRowIndex === -1) {
        return { status: 'error', message: `ไม่พบเขตพื้นที่ ${areaId} ในระบบ` };
      }

      sheet.getRange(targetRowIndex, nameCol + 1).setValue(areaName);
      if (descCol !== -1) sheet.getRange(targetRowIndex, descCol + 1).setValue(areaDesc);
      sheet.getRange(targetRowIndex, activeCol + 1).setValue(isActive);

      return { status: 'success', message: `แก้ไขเขตพื้นที่ ${areaName} สำเร็จ` };
    }

    if (mode === 'toggle') {
      if (!areaId) return { status: 'error', message: 'ไม่พบรหัสเขตพื้นที่' };

      let targetRowIndex = -1;
      let currentActive = 'TRUE';
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][idCol]).trim() === areaId) {
          targetRowIndex = r + 1;
          currentActive = String(data[r][activeCol]).trim().toUpperCase();
          break;
        }
      }

      if (targetRowIndex === -1) {
        return { status: 'error', message: `ไม่พบเขตพื้นที่ ${areaId}` };
      }

      const newStatus = currentActive === 'TRUE' ? 'FALSE' : 'TRUE';
      sheet.getRange(targetRowIndex, activeCol + 1).setValue(newStatus);
      return {
        status: 'success',
        message: `เปลี่ยนสถานะเป็น ${newStatus === 'TRUE' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} สำเร็จ`,
        is_active: newStatus === 'TRUE'
      };
    }

    if (mode === 'delete') {
      if (!areaId) return { status: 'error', message: 'ไม่พบรหัสเขตพื้นที่ที่ต้องการลบ' };

      // Safety check: ตรวจสอบว่ามีห้องเรียนใน DB_classroom ผูกเขตนี้อยู่หรือไม่
      const classSheet = ss.getSheetByName('DB_classroom');
      if (classSheet) {
        const classData = classSheet.getDataRange().getValues();
        if (classData.length > 1) {
          const classHeaders = classData[0].map(h => String(h).trim().toLowerCase());
          const cClassCol = classHeaders.indexOf('classroom');
          const cAreaCol = classHeaders.indexOf('area_id');
          if (cAreaCol !== -1 && cClassCol !== -1) {
            for (let r = 1; r < classData.length; r++) {
              if (String(classData[r][cAreaCol]).trim() === areaId) {
                const linkedRoom = String(classData[r][cClassCol]).trim();
                return {
                  status: 'error',
                  message: `ไม่สามารถลบเขตพื้นที่นี้ได้ เนื่องจากห้อง ${linkedRoom} กำลังผูกอยู่กับเขตนี้ กรุณาเปลี่ยนเขตของห้องเรียนก่อนลบ`
                };
              }
            }
          }
        }
      }

      let targetRowIndex = -1;
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][idCol]).trim() === areaId) {
          targetRowIndex = r + 1;
          break;
        }
      }

      if (targetRowIndex === -1) {
        return { status: 'error', message: `ไม่พบเขตพื้นที่ ${areaId} ที่ต้องการลบ` };
      }

      sheet.deleteRow(targetRowIndex);
      return { status: 'success', message: `ลบเขตพื้นที่ ${areaId} เรียบร้อยแล้ว` };
    }

    return { status: 'error', message: `Invalid mode: ${mode}` };
  } catch (error) {
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการจัดการเขตพื้นที่: ' + error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * จัดการข้อมูลเกณฑ์การตรวจ (LIST_allChecklist) : create, update, delete, toggle
 */
function handleManageChecklist(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName('LIST_allChecklist');
    if (!sheet) return { status: 'error', message: 'ไม่พบชีต LIST_allChecklist' };

    const mode = payload.mode || 'create'; // 'create' | 'update' | 'delete' | 'toggle'
    let checklistId = String(payload.checklist_id || '').trim();
    const type = String(payload.type || 'room').toLowerCase(); // 'room' | 'area'
    const checklistName = String(payload.checklist_name || '').trim();
    const checklistDetail = String(payload.checklist_detail || '').trim();
    let maxScore = parseInt(payload.max_score, 10);
    if (isNaN(maxScore) || maxScore < 2) maxScore = 2;
    if (maxScore > 10) maxScore = 10;
    const isActive = payload.is_active !== undefined ? (String(payload.is_active).toUpperCase() === 'TRUE' ? 'TRUE' : 'FALSE') : 'TRUE';

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim().toLowerCase());
    const idCol = headers.indexOf('checklist_id');
    const nameCol = headers.indexOf('checklist_name');
    const detailCol = headers.indexOf('checklist_detail');
    const scoreCol = headers.indexOf('max_score');
    const activeCol = headers.indexOf('is_active');

    if (idCol === -1 || nameCol === -1 || scoreCol === -1 || activeCol === -1) {
      return { status: 'error', message: 'หัวตาราง LIST_allChecklist ไม่ถูกต้อง' };
    }

    if (mode === 'create') {
      if (!checklistName) {
        return { status: 'error', message: 'กรุณาระบุชื่อเกณฑ์การประเมิน' };
      }

      const prefix = type === 'area' ? 'area' : 'room';
      let maxNum = 0;
      const prefixRegex = new RegExp(`^${prefix}(\\d+)$`, 'i');

      for (let r = 1; r < data.length; r++) {
        const id = String(data[r][idCol]).trim();
        const match = id.match(prefixRegex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }

      const nextNum = maxNum + 1;
      checklistId = prefix + String(nextNum).padStart(3, '0');

      sheet.appendRow([checklistId, checklistName, checklistDetail, maxScore, isActive]);
      return {
        status: 'success',
        message: `เพิ่มเกณฑ์การประเมิน ${checklistName} (${checklistId}) สำเร็จ`,
        checklist_id: checklistId
      };
    }

    if (mode === 'update') {
      if (!checklistId) return { status: 'error', message: 'ไม่พบรหัสเกณฑ์การประเมิน' };
      if (!checklistName) return { status: 'error', message: 'กรุณาระบุชื่อเกณฑ์การประเมิน' };

      let targetRowIndex = -1;
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][idCol]).trim() === checklistId) {
          targetRowIndex = r + 1;
          break;
        }
      }

      if (targetRowIndex === -1) {
        return { status: 'error', message: `ไม่พบเกณฑ์ ${checklistId} ในระบบ` };
      }

      sheet.getRange(targetRowIndex, nameCol + 1).setValue(checklistName);
      if (detailCol !== -1) sheet.getRange(targetRowIndex, detailCol + 1).setValue(checklistDetail);
      sheet.getRange(targetRowIndex, scoreCol + 1).setValue(maxScore);
      sheet.getRange(targetRowIndex, activeCol + 1).setValue(isActive);

      return { status: 'success', message: `แก้ไขเกณฑ์ ${checklistName} สำเร็จ` };
    }

    if (mode === 'toggle') {
      if (!checklistId) return { status: 'error', message: 'ไม่พบรหัสเกณฑ์' };

      let targetRowIndex = -1;
      let currentActive = 'TRUE';
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][idCol]).trim() === checklistId) {
          targetRowIndex = r + 1;
          currentActive = String(data[r][activeCol]).trim().toUpperCase();
          break;
        }
      }

      if (targetRowIndex === -1) {
        return { status: 'error', message: `ไม่พบเกณฑ์ ${checklistId}` };
      }

      const newStatus = currentActive === 'TRUE' ? 'FALSE' : 'TRUE';
      sheet.getRange(targetRowIndex, activeCol + 1).setValue(newStatus);
      return {
        status: 'success',
        message: `เปลี่ยนสถานะเป็น ${newStatus === 'TRUE' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} สำเร็จ`,
        is_active: newStatus === 'TRUE'
      };
    }

    if (mode === 'delete') {
      if (!checklistId) return { status: 'error', message: 'ไม่พบรหัสเกณฑ์ที่ต้องการลบ' };

      let targetRowIndex = -1;
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][idCol]).trim() === checklistId) {
          targetRowIndex = r + 1;
          break;
        }
      }

      if (targetRowIndex === -1) {
        return { status: 'error', message: `ไม่พบเกณฑ์ ${checklistId} ที่ต้องการลบ` };
      }

      sheet.deleteRow(targetRowIndex);
      return { status: 'success', message: `ลบเกณฑ์การประเมิน ${checklistId} เรียบร้อยแล้ว` };
    }

    return { status: 'error', message: `Invalid mode: ${mode}` };
  } catch (error) {
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการจัดการเกณฑ์: ' + error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * จัดการข้อมูลครู (DB_teachers) : create, delete
 */
function handleManageTeacher(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName('DB_teachers');
    if (!sheet) {
      sheet = ss.insertSheet('DB_teachers');
      sheet.getRange(1, 1).setValue('teacherName');
    }

    const mode = payload.mode || 'create';
    const teacherName = String(payload.teacherName || '').trim();

    if (!teacherName) {
      return { status: 'error', message: 'กรุณาระบุชื่อครู' };
    }

    const data = sheet.getDataRange().getValues();

    if (mode === 'create') {
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][0]).trim() === teacherName) {
          return { status: 'error', message: `ครูชื่อ "${teacherName}" มีอยู่ในระบบแล้ว` };
        }
      }
      sheet.appendRow([teacherName]);
      return { status: 'success', message: `เพิ่มครู "${teacherName}" สำเร็จ` };
    }

    if (mode === 'delete') {
      let targetRowIndex = -1;
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][0]).trim() === teacherName) {
          targetRowIndex = r + 1;
          break;
        }
      }

      if (targetRowIndex === -1) {
        return { status: 'error', message: `ไม่พบครู "${teacherName}" ในระบบ` };
      }

      sheet.deleteRow(targetRowIndex);
      return { status: 'success', message: `ลบครู "${teacherName}" สำเร็จ` };
    }

    return { status: 'error', message: `Invalid mode: ${mode}` };
  } catch (error) {
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการจัดการข้อมูลครู: ' + error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * จัดการข้อมูลผู้ใช้งานระบบ (USERS) : create, update, toggle, delete
 */
function handleManageUser(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = ss.getSheetByName('USERS');
    if (!sheet) {
      sheet = ss.insertSheet('USERS');
      sheet.getRange(1, 1, 1, 7).setValues([['user_id', 'full_name', 'pin', 'role', 'allowed_rooms', 'allowed_areas', 'is_active']]);
    }

    const mode = payload.mode || 'create';
    const data = sheet.getDataRange().getValues();
    if (data.length < 1) {
      return { status: 'error', message: 'ตาราง USERS ว่างเปล่า' };
    }

    const headers = data[0].map(h => String(h).trim().toLowerCase());
    const idCol = headers.indexOf('user_id');
    const nameCol = headers.indexOf('full_name');
    const pinCol = headers.indexOf('pin');
    const roleCol = headers.indexOf('role');
    const roomsCol = headers.indexOf('allowed_rooms');
    const areasCol = headers.indexOf('allowed_areas');
    const activeCol = headers.indexOf('is_active');

    let userId = String(payload.user_id || '').trim();
    const fullName = String(payload.full_name || '').trim();
    const pin = String(payload.pin || '').trim();
    const role = String(payload.role || 'Inspector').trim();
    
    // จัดการ allowed_rooms / allowed_areas (รองรับ 'all' หรือ Array)
    let allowedRooms = 'all';
    if (payload.allowed_rooms !== undefined) {
      if (Array.isArray(payload.allowed_rooms)) {
        allowedRooms = JSON.stringify(payload.allowed_rooms);
      } else {
        allowedRooms = String(payload.allowed_rooms);
      }
    }

    let allowedAreas = 'all';
    if (payload.allowed_areas !== undefined) {
      if (Array.isArray(payload.allowed_areas)) {
        allowedAreas = JSON.stringify(payload.allowed_areas);
      } else {
        allowedAreas = String(payload.allowed_areas);
      }
    }

    const isActive = String(payload.is_active).toUpperCase() === 'FALSE' ? 'FALSE' : 'TRUE';
    const currentUserId = String(payload.current_user_id || '').trim();

    if (mode === 'create') {
      if (!fullName) {
        return { status: 'error', message: 'กรุณาระบุชื่อ-นามสกุลผู้ใช้งาน' };
      }
      if (!pin || !/^\d{6}$/.test(pin)) {
        return { status: 'error', message: 'รหัส PIN ต้องเป็นตัวเลข 6 หลักเท่านั้น' };
      }

      // ตรวจสอบ PIN ซ้ำในระบบ
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][pinCol]).trim() === pin) {
          return { status: 'error', message: `รหัส PIN "${pin}" มีผู้ใช้งานแล้ว กรุณากำหนดรหัส PIN อื่น` };
        }
      }

      // หาค่า user_id สูงสุดเดิม แล้ว +1 ในรูปแบบ USR000
      let maxNum = 0;
      for (let r = 1; r < data.length; r++) {
        const uid = String(data[r][idCol]).trim();
        const match = uid.match(/^USR(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }

      const nextNum = maxNum + 1;
      userId = 'USR' + String(nextNum).padStart(3, '0');

      sheet.appendRow([userId, fullName, pin, role, allowedRooms, allowedAreas, isActive]);

      return {
        status: 'success',
        message: `เพิ่มผู้ใช้งาน ${fullName} (${userId}) สำเร็จ`,
        user: {
          user_id: userId,
          full_name: fullName,
          role: role,
          allowed_rooms: parseJsonOrRaw(allowedRooms),
          allowed_areas: parseJsonOrRaw(allowedAreas),
          is_active: isActive === 'TRUE'
        }
      };
    }

    if (mode === 'update') {
      if (!userId) return { status: 'error', message: 'ไม่พบรหัสผู้ใช้งาน' };
      if (!fullName) return { status: 'error', message: 'กรุณาระบุชื่อ-นามสกุลผู้ใช้งาน' };

      let targetRowIndex = -1;
      let existingPin = '';
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][idCol]).trim() === userId) {
          targetRowIndex = r + 1;
          existingPin = String(data[r][pinCol]).trim();
          break;
        }
      }

      if (targetRowIndex === -1) {
        return { status: 'error', message: `ไม่พบผู้ใช้งานรหัส ${userId} ในระบบ` };
      }

      // ตรวจสอบและอัปเดต PIN
      let finalPin = existingPin;
      if (pin && pin !== '******' && pin !== existingPin) {
        if (!/^\d{6}$/.test(pin)) {
          return { status: 'error', message: 'รหัส PIN ต้องเป็นตัวเลข 6 หลักเท่านั้น' };
        }
        for (let r = 1; r < data.length; r++) {
          if (r + 1 !== targetRowIndex && String(data[r][pinCol]).trim() === pin) {
            return { status: 'error', message: `รหัส PIN "${pin}" ซ้ำกับผู้ใช้อื่นในระบบ` };
          }
        }
        finalPin = pin;
      }

      sheet.getRange(targetRowIndex, nameCol + 1).setValue(fullName);
      sheet.getRange(targetRowIndex, pinCol + 1).setValue(finalPin);
      sheet.getRange(targetRowIndex, roleCol + 1).setValue(role);
      sheet.getRange(targetRowIndex, roomsCol + 1).setValue(allowedRooms);
      sheet.getRange(targetRowIndex, areasCol + 1).setValue(allowedAreas);
      sheet.getRange(targetRowIndex, activeCol + 1).setValue(isActive);

      return {
        status: 'success',
        message: `แก้ไขข้อมูลผู้ใช้งาน ${fullName} (${userId}) สำเร็จ`,
        user: {
          user_id: userId,
          full_name: fullName,
          role: role,
          allowed_rooms: parseJsonOrRaw(allowedRooms),
          allowed_areas: parseJsonOrRaw(allowedAreas),
          is_active: isActive === 'TRUE'
        }
      };
    }

    if (mode === 'toggle') {
      if (!userId) return { status: 'error', message: 'ไม่พบรหัสผู้ใช้งาน' };

      let targetRowIndex = -1;
      let currentActive = 'TRUE';
      let targetName = '';
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][idCol]).trim() === userId) {
          targetRowIndex = r + 1;
          currentActive = String(data[r][activeCol]).trim().toUpperCase();
          targetName = String(data[r][nameCol]).trim();
          break;
        }
      }

      if (targetRowIndex === -1) {
        return { status: 'error', message: `ไม่พบผู้ใช้งานรหัส ${userId}` };
      }

      const newStatus = currentActive === 'TRUE' ? 'FALSE' : 'TRUE';
      sheet.getRange(targetRowIndex, activeCol + 1).setValue(newStatus);

      return {
        status: 'success',
        message: `เปลี่ยนสถานะ ${targetName} เป็น ${newStatus === 'TRUE' ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'} สำเร็จ`,
        is_active: newStatus === 'TRUE'
      };
    }

    if (mode === 'delete') {
      if (!userId) return { status: 'error', message: 'ไม่พบรหัสผู้ใช้งานที่ต้องการลบ' };

      if (currentUserId && userId === currentUserId) {
        return { status: 'error', message: 'ไม่สามารถลบบัญชีผู้ใช้งานของตนเองที่กำลังเข้าสู่ระบบอยู่ได้' };
      }

      let targetRowIndex = -1;
      let targetName = '';
      for (let r = 1; r < data.length; r++) {
        if (String(data[r][idCol]).trim() === userId) {
          targetRowIndex = r + 1;
          targetName = String(data[r][nameCol]).trim();
          break;
        }
      }

      if (targetRowIndex === -1) {
        return { status: 'error', message: `ไม่พบผู้ใช้งาน ${userId} ในระบบ` };
      }

      sheet.deleteRow(targetRowIndex);

      return {
        status: 'success',
        message: `ลบผู้ใช้งาน ${targetName} (${userId}) เรียบร้อยแล้ว`
      };
    }

    return { status: 'error', message: `Invalid mode: ${mode}` };
  } catch (error) {
    return { status: 'error', message: 'เกิดข้อผิดพลาดในการจัดการผู้ใช้งาน: ' + error.toString() };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// 12. ฟังก์ชันดึงข้อมูลสถิติประวัติการตรวจ (Stats Engine)
// ==========================================

/**
 * ดึงชื่อวันในสัปดาห์ภาษาไทย (อาทิตย์ - เสาร์)
 */
function getThaiDayOfWeek(dateInput) {
  try {
    const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    let d;
    if (typeof dateInput === 'string') {
      const parts = String(dateInput).trim().split('-');
      if (parts.length === 3) {
        d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        d = new Date(dateInput);
      }
    } else if (dateInput instanceof Date) {
      d = dateInput;
    } else {
      d = new Date();
    }
    const dayIndex = d.getDay();
    return thaiDays[dayIndex] || '';
  } catch (e) {
    return '';
  }
}

/**
 * แปลงวันที่ YYYY-MM-DD เป็นรูปแบบวันที่ภาษาไทยแบบย่อ เช่น '23 ส.ค. 69'
 */
function formatThaiDateShort(dateStr) {
  try {
    if (!dateStr) return '';
    const parts = String(dateStr).trim().split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const thaiYearShort = String((year + 543) % 100).padStart(2, '0');
      const thaiMonth = thaiMonths[month] || '';
      return `${day} ${thaiMonth} ${thaiYearShort}`;
    }
  } catch (e) {}
  return String(dateStr);
}

/**
 * แปลงวันที่ YYYY-MM-DD เป็นรูปแบบวันที่ภาษาไทยแบบเต็ม เช่น 'วันศุกร์ที่ 21 สิงหาคม 2569'
 */
function formatThaiDateFull(dateStr) {
  try {
    if (!dateStr) return '';
    const parts = String(dateStr).trim().split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      const thaiDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
      const thaiMonthsFull = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      const dayName = thaiDays[d.getDay()] || '';
      const monthName = thaiMonthsFull[month] || '';
      const thaiYear = year + 543;
      return `วัน${dayName}ที่ ${day} ${monthName} ${thaiYear}`;
    }
  } catch (e) {}
  return String(dateStr);
}

/**
 * ดึงประวัติการตรวจทั้งหมดสำหรับแท็บสถิติห้องเรียน
 */
function handleGetStatsLogs(params) {
  try {
    const rawLogs = getDataByHeaderAPI(CONFIG.SPREADSHEET_ID, 'LOG_inspections!A:O', 0);
    
    // Optional filter by term
    const targetTerm = params && params.term ? String(params.term).trim() : '';

    const allLogs = [];
    const dateMap = {};

    rawLogs.forEach(log => {
      // Normalize date_str
      let logDate = String(log.date_str || '').trim();
      if (logDate.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(logDate)) {
        logDate = logDate.slice(0, 10);
      } else if (log.timestamp) {
        try {
          const d = new Date(log.timestamp);
          if (!isNaN(d.getTime())) {
            logDate = Utilities.formatDate(d, CONFIG.TIMEZONE, 'yyyy-MM-dd');
          }
        } catch (e) {}
      }

      if (!logDate) return;

      // Filter by term if specified
      if (targetTerm && log.term && String(log.term).trim() !== targetTerm) {
        return;
      }

      // Parse scores
      const parsedScores = parseJsonOrRaw(log.scores_json);
      const dayOfWeek = log.day_of_week || getThaiDayOfWeek(logDate);

      const logItem = {
        record_id: log.record_id,
        timestamp: log.timestamp,
        date_str: logDate,
        day_of_week: dayOfWeek,
        thai_date: formatThaiDateShort(logDate),
        full_thai_date: formatThaiDateFull(logDate),
        type: log.type, // 'room' | 'area'
        target_id: log.target_id,
        target_name: log.target_name,
        inspector_name: log.inspector_name,
        scores: parsedScores,
        total_score: Number(log.total_score || 0),
        max_score: Number(log.max_score || 0),
        percentage: Number(log.percentage || 0),
        comment: log.comment || '',
        term: log.term || ''
      };

      allLogs.push(logItem);

      // Aggregate date stats
      if (!dateMap[logDate]) {
        dateMap[logDate] = {
          date_str: logDate,
          day_of_week: dayOfWeek,
          thai_date: formatThaiDateShort(logDate),
          full_thai_date: formatThaiDateFull(logDate),
          room_count: 0,
          area_count: 0,
          total_count: 0
        };
      }

      if (log.type === 'room') {
        dateMap[logDate].room_count += 1;
      } else if (log.type === 'area') {
        dateMap[logDate].area_count += 1;
      }
      dateMap[logDate].total_count += 1;
    });

    // Sort available dates descending (newest first)
    const availableDates = Object.values(dateMap).sort((a, b) => {
      return b.date_str.localeCompare(a.date_str);
    });

    return {
      status: 'success',
      data: {
        total_logs: allLogs.length,
        total_inspection_days: availableDates.length,
        available_dates: availableDates,
        logs: allLogs
      }
    };
  } catch (error) {
    Logger.log('⚠️ เกิดข้อผิดพลาดใน handleGetStatsLogs: ' + error.toString());
    return {
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ: ' + error.toString()
    };
  }
}

/**
 * ฟอร์แมตชื่อครูที่ปรึกษาให้อยู่ในรูป "ครู[ชื่อ]" แทนคำนำหน้าเดิมและตัดนามสกุลออก
 * ตัวอย่าง: ["นางผกามาศ เสือคล้าย", "นายอุเทน หมื่นสุวรรณ์"] -> ครูผกามาศ, ครูอุเทน
 */
function formatAdvisorShortName(advisorsRaw) {
  const list = parseJsonOrRaw(advisorsRaw);
  if (!list) return '';
  const arr = Array.isArray(list) ? list : [list];

  const prefixes = [
    'เด็กชาย', 'เด็กหญิง', 'ด.ช.', 'ด.ญ.',
    'นางสาว', 'น.ส.', 'นาง', 'นาย',
    'ว่าที่ร้อยตรีหญิง', 'ว่าที่ร้อยตรี', 'ว่าที่ ร.ต.หญิง', 'ว่าที่ ร.ต.',
    'ดร.', 'อาจารย์', 'ครู'
  ];

  const formatted = arr.map(item => {
    let str = String(item || '').trim();
    if (!str) return '';
    for (const prefix of prefixes) {
      if (str.startsWith(prefix)) {
        str = str.substring(prefix.length).trim();
        break;
      }
    }
    const parts = str.split(/\s+/).filter(Boolean);
    const firstName = parts[0] || str;
    return 'ครู' + firstName;
  }).filter(Boolean);

  return formatted.join(', ');
}

/**
 * สร้างรหัสวันที่สำหรับชื่อไฟล์ เช่น 2026-11-07 -> 691107
 */
function getThaiDateCode(dateStr) {
  try {
    if (!dateStr) return '';
    const parts = String(dateStr).trim().split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      const thaiYearShort = String((year + 543) % 100).padStart(2, '0');
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return `${thaiYearShort}${mm}${dd}`;
    }
  } catch (e) {}
  return '';
}

/**
 * นำข้อมูลผลการตรวจห้องเรียนของวันนี้ไปใส่ใน Sheet TEMPLATE: TEMP_exportToday
 * และ Export ออกเป็นไฟล์ PDF (base64) เพื่อนำไปใช้งานหรือแปลงเป็นภาพ PNG
 */
function handleExportTodayReport(payload) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);

    const todayStr = payload && payload.date_str
      ? String(payload.date_str).trim()
      : Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');

    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const templateSheet = ss.getSheetByName('TEMP_exportToday');
    if (!templateSheet) {
      return {
        status: 'error',
        message: 'ไม่พบชีตเทมเพลต "TEMP_exportToday" ใน Google Sheets กรุณาตรวจสอบชื่อชีต'
      };
    }

    // 1. ดึงข้อมูลห้องเรียนจาก DB_classroom
    const classrooms = getDataByHeaderAPI(CONFIG.SPREADSHEET_ID, 'DB_classroom!A:C', 0);

    // 2. ดึงข้อมูลบันทึกการตรวจจาก LOG_inspections เฉพาะวันนี้ และเฉพาะ type === 'room'
    const allLogs = getDataByHeaderAPI(CONFIG.SPREADSHEET_ID, 'LOG_inspections!A:O', 0);
    const todayRoomLogs = allLogs.filter(log => {
      let logDate = String(log.date_str || '').trim();
      if (logDate.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(logDate)) {
        logDate = logDate.slice(0, 10);
      }
      return logDate === todayStr && String(log.type).trim().toLowerCase() === 'room';
    });

    const roomLogMap = {};
    const juniorInspectors = [];
    const seniorInspectors = [];
    const allInspectors = [];

    todayRoomLogs.forEach(log => {
      const targetId = String(log.target_id || '').trim();
      if (targetId) {
        roomLogMap[targetId] = log;
      }
      const insp = String(log.inspector_name || '').trim();
      if (insp) {
        if (!allInspectors.includes(insp)) allInspectors.push(insp);
        if (/^ม\.[123]/.test(targetId)) {
          if (!juniorInspectors.includes(insp)) juniorInspectors.push(insp);
        } else if (/^ม\.[456]/.test(targetId)) {
          if (!seniorInspectors.includes(insp)) seniorInspectors.push(insp);
        }
      }
    });

    // 3. กำหนดวันที่และผู้ตรวจในหัวกระดาษ (หน้า 1 ม.ต้น: A2, A3 และ หน้า 2 ม.ปลาย: A38, A39)
    const dateThaiStr = formatThaiDateFull(todayStr);

    const juniorInspectorStr = juniorInspectors.length > 0
      ? ('ผู้ตรวจ  ' + juniorInspectors.join(', '))
      : (allInspectors.length > 0 ? ('ผู้ตรวจ  ' + allInspectors.join(', ')) : 'ผู้ตรวจ  -');

    const seniorInspectorStr = seniorInspectors.length > 0
      ? ('ผู้ตรวจ  ' + seniorInspectors.join(', '))
      : (allInspectors.length > 0 ? ('ผู้ตรวจ  ' + allInspectors.join(', ')) : 'ผู้ตรวจ  -');

    // หน้า 1: ม.ต้น
    templateSheet.getRange('A2').setValue(dateThaiStr);
    templateSheet.getRange('A3').setValue(juniorInspectorStr);

    // หน้า 2: ม.ปลาย
    templateSheet.getRange('A38').setValue(dateThaiStr);
    templateSheet.getRange('A39').setValue(seniorInspectorStr);

    // 4. เตรียมข้อมูลลงตารางแต่ละระดับชั้น (ม.1 ถึง ม.6)
    const levelRanges = [
      { level: 'ม.1', startRow: 6, rowCount: 6 },
      { level: 'ม.2', startRow: 15, rowCount: 6 },
      { level: 'ม.3', startRow: 24, rowCount: 6 },
      { level: 'ม.4', startRow: 42, rowCount: 6 },
      { level: 'ม.5', startRow: 51, rowCount: 6 },
      { level: 'ม.6', startRow: 60, rowCount: 6 }
    ];

    levelRanges.forEach(lvl => {
      const levelClassrooms = classrooms.filter(c => {
        const roomName = String(c.classroom || '').trim();
        return roomName.startsWith(lvl.level + '/');
      });

      levelClassrooms.sort((a, b) => {
        const roomA = String(a.classroom || '').trim();
        const roomB = String(b.classroom || '').trim();
        const numA = parseInt(roomA.split('/')[1] || '0', 10);
        const numB = parseInt(roomB.split('/')[1] || '0', 10);
        return numA - numB;
      });

      const rowsData = [];
      for (let r = 0; r < lvl.rowCount; r++) {
        if (r < levelClassrooms.length) {
          const c = levelClassrooms[r];
          const roomName = c.classroom;
          const advisorDisplay = formatAdvisorShortName(c.advisors);

          let s1 = '-', s2 = '-', s3 = '-', s4 = '-', s5 = '-';
          const log = roomLogMap[roomName];
          if (log) {
            const scores = parseJsonOrRaw(log.scores_json);
            if (Array.isArray(scores)) {
              scores.forEach(sc => {
                const cid = String(sc.checklist_id || '').toLowerCase();
                const val = (sc.score !== undefined && sc.score !== null && sc.score !== '') ? sc.score : '-';
                if (cid === 'room001') s1 = val;
                else if (cid === 'room002') s2 = val;
                else if (cid === 'room003') s3 = val;
                else if (cid === 'room004') s4 = val;
                else if (cid === 'room005') s5 = val;
              });
            }
          }
          // คอลัมน์ A ถึง G (คอลัมน์ H รวม มีสูตร Google Sheets อยู่แล้ว)
          rowsData.push([roomName, advisorDisplay, s1, s2, s3, s4, s5]);
        } else {
          rowsData.push(['', '', '', '', '', '', '']);
        }
      }

      templateSheet.getRange(lvl.startRow, 1, lvl.rowCount, 7).setValues(rowsData);
    });

    SpreadsheetApp.flush();

    // 5. ส่งออกเป็น PDF เฉพาะชีต TEMP_exportToday
    const sheetId = templateSheet.getSheetId();
    const dateCode = getThaiDateCode(todayStr);
    const pdfFileName = `สรุปข้อมูลความสะอาดห้องเรียน_${dateCode}.pdf`;

    let pdfBlob = null;

    // วิธีที่ 1: ดึงผ่าน Google Sheets Export URL โดยระบุ gid ของ TEMP_exportToday โดยตรง
    pdfBlob = fetchA4PdfBlob(CONFIG.SPREADSHEET_ID, sheetId, pdfFileName);

    // วิธีที่ 2 (Fallback คุ้มกัน 100%): ถ้าวิธีที่ 1 ไม่สำเร็จ
    // จะคัดลอกเฉพาะชีต TEMP_exportToday ไปยัง Temporary Spreadsheet แผ่นใหม่
    // พร้อมเปิดแชร์ ANYONE_WITH_LINK ชั่วคราว เพื่อรับประกันว่าไม่มีชีตอื่นติดมาอย่างแน่นอน 100%
    // และได้ขนาดหน้ากระดาษ A4 (21.02 x 29.73 cm) พร้อมระยะขอบที่ถูกต้องตามกำหนด 100%
    if (!pdfBlob) {
      const tempSS = SpreadsheetApp.create('TEMP_EXPORT_' + dateCode);
      const tempId = tempSS.getId();
      const tempFile = DriveApp.getFileById(tempId);

      try {
        // เปิดสิทธิ์แชร์ไฟล์ชั่วคราวเพื่อให้ UrlFetchApp สามารถดาวน์โหลด PDF ขนาด A4 ได้อย่างสมบูรณ์
        try {
          tempFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch (shareErr) {
          try {
            tempFile.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
          } catch (dErr) {}
        }

        const copiedSheet = templateSheet.copyTo(tempSS);
        copiedSheet.setName('TEMP_exportToday');

        // ลบชีตตั้งต้น Sheet1 ออก ให้เหลือเฉพาะชีตเทมเพลตเท่านั้น
        const initialSheets = tempSS.getSheets();
        for (let s = 0; s < initialSheets.length; s++) {
          if (initialSheets[s].getSheetId() !== copiedSheet.getSheetId()) {
            tempSS.deleteSheet(initialSheets[s]);
          }
        }
        SpreadsheetApp.flush();

        // แก้ไขปัญหา #REF! จากสูตรที่อ้างอิงข้ามไปยังชีต SETTING หรือชีตอื่นๆ (เช่น A36:H36 และ A72:H72)
        // โดยดึงค่าผลลัพธ์ข้อความจริงที่คำนวณเรียบร้อยแล้วจาก templateSheet ต้นฉบับมาเขียนทับสูตร
        const lastRow = templateSheet.getLastRow();
        const lastCol = templateSheet.getLastColumn();
        const origDisplayValues = templateSheet.getRange(1, 1, lastRow, lastCol).getDisplayValues();
        const origFormulas = templateSheet.getRange(1, 1, lastRow, lastCol).getFormulas();

        for (let r = 0; r < lastRow; r++) {
          for (let c = 0; c < lastCol; c++) {
            const formula = origFormulas[r][c];
            if (formula && (formula.includes('SETTING') || formula.includes('!'))) {
              const displayVal = origDisplayValues[r][c];
              copiedSheet.getRange(r + 1, c + 1).setValue(displayVal);
            }
          }
        }

        // กำหนดเจาะจงที่ A36 และ A72 (แถบข้อความโครงการท้ายตาราง ม.ต้น และ ม.ปลาย)
        const a36Val = templateSheet.getRange('A36').getDisplayValue();
        const a72Val = templateSheet.getRange('A72').getDisplayValue();
        if (a36Val && !a36Val.includes('#REF!')) {
          copiedSheet.getRange('A36').setValue(a36Val);
        }
        if (a72Val && !a72Val.includes('#REF!')) {
          copiedSheet.getRange('A72').setValue(a72Val);
        }

        // กวาดตรวจเช็คความปลอดภัย: หากมีเซลล์ใดใน copiedSheet ยังคงติด #REF! ให้แทนที่ด้วยค่าจาก templateSheet ทันที
        const copiedValues = copiedSheet.getRange(1, 1, lastRow, lastCol).getDisplayValues();
        for (let r = 0; r < lastRow; r++) {
          for (let c = 0; c < lastCol; c++) {
            if (copiedValues[r][c] && String(copiedValues[r][c]).includes('#REF!')) {
              const safeVal = origDisplayValues[r][c];
              copiedSheet.getRange(r + 1, c + 1).setValue(safeVal.includes('#REF!') ? '' : safeVal);
            }
          }
        }
        SpreadsheetApp.flush();

        const tempSheetId = copiedSheet.getSheetId();

        // ดึง PDF ขนาด A4 พร้อมระยะขอบที่ถูกต้อง 100%
        pdfBlob = fetchA4PdfBlob(tempId, tempSheetId, pdfFileName);

        // หากยังไม่ได้ ให้ใช้ Drive getAs บน tempSS เป็นมาตรการสำรองขั้นสุดท้าย
        if (!pdfBlob) {
          Logger.log('Warning: Falling back to getAs application/pdf');
          pdfBlob = tempFile.getAs('application/pdf').setName(pdfFileName);
        }
      } finally {
        // ลบ Temporary Spreadsheet ออกจาก Drive ทันที
        try {
          tempFile.setTrashed(true);
        } catch (delErr) {
          Logger.log('Failed to delete tempSS: ' + delErr.toString());
        }
      }
    }

    if (!pdfBlob) {
      throw new Error('ไม่สามารถสร้างไฟล์ PDF ได้ กรุณาตรวจสอบสิทธิ์ของระบบ');
    }

    const pdfBase64 = Utilities.base64Encode(pdfBlob.getBytes());

    return {
      status: 'success',
      message: 'เตรียมข้อมูลและส่งออกรายงานสำเร็จ',
      date_str: todayStr,
      date_code: dateCode,
      date_thai: dateThaiStr,
      pdf_filename: pdfFileName,
      pdf_base64: pdfBase64
    };
  } catch (error) {
    Logger.log('⚠️ เกิดข้อผิดพลาดใน handleExportTodayReport: ' + error.toString());
    return {
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการสร้างรายงาน: ' + error.toString()
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * สร้าง URL สำหรับ Export Google Sheet เป็น PDF ขนาด A4 พร้อมระยะขอบเจาะจง
 */
function buildPdfExportUrl(spreadsheetId, sheetGid, sizeParam) {
  const params = [
    'exportFormat=pdf',
    'format=pdf',
    'size=' + (sizeParam || 'A4'),
    'portrait=true',
    'fitw=true',
    'scale=2',
    'gridlines=false',
    'printtitle=false',
    'sheetnames=false',
    'fzr=false',
    'top_margin=0.75',
    'bottom_margin=0.75',
    'left_margin=0.70',
    'right_margin=0.70',
    'gid=' + sheetGid
  ];
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?` + params.join('&');
}

/**
 * ตรวจสอบความถูกต้องว่า Response เป็นไฟล์ PDF จริง
 */
function isPdfResponse(res) {
  if (!res || res.getResponseCode() !== 200) return false;
  const blob = res.getBlob();
  const cType = String(blob.getContentType() || '').toLowerCase();
  const headers = res.getHeaders() || {};
  const hType = String(headers['Content-Type'] || headers['content-type'] || '').toLowerCase();
  if (!cType.includes('pdf') && !hType.includes('pdf')) return false;
  const bytes = blob.getBytes();
  if (!bytes || bytes.length < 4) return false;
  // %PDF in ASCII is [0x25, 0x50, 0x44, 0x46]
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

/**
 * ฟังก์ชันดึง PDF ขนาด A4 ผ่าน Google Sheets Export API พร้อมระบบ Fallback
 */
function fetchA4PdfBlob(spreadsheetId, sheetGid, fileName) {
  const token = ScriptApp.getOAuthToken();
  const sizeOptions = ['A4', '7'];

  for (let s = 0; s < sizeOptions.length; s++) {
    const exportUrl = buildPdfExportUrl(spreadsheetId, sheetGid, sizeOptions[s]);

    // 1. ลองดึงพร้อม Bearer Token
    try {
      const res = UrlFetchApp.fetch(exportUrl, {
        headers: {
          'Authorization': 'Bearer ' + token
        },
        muteHttpExceptions: true
      });
      if (isPdfResponse(res)) {
        return res.getBlob().setName(fileName);
      }
    } catch (e) {
      Logger.log(`Token fetch error for size ${sizeOptions[s]}: ${e.toString()}`);
    }

    // 2. ลองดึงแบบไม่ส่ง Bearer Token (สำหรับไฟล์ที่เปิดแชร์ ANYONE_WITH_LINK)
    try {
      const resNoAuth = UrlFetchApp.fetch(exportUrl, {
        muteHttpExceptions: true
      });
      if (isPdfResponse(resNoAuth)) {
        return resNoAuth.getBlob().setName(fileName);
      }
    } catch (e2) {
      Logger.log(`NoAuth fetch error for size ${sizeOptions[s]}: ${e2.toString()}`);
    }
  }

  return null;
}

/**
 * ฟังก์ชันช่วยบังคับประกาศ OAuth Scopes ให้ Google Apps Script ทราบอัตโนมัติ
 * (Drive, Spreadsheets, External Requests)
 */
function _forceOAuthScopes() {
  DriveApp.getRootFolder();
  SpreadsheetApp.getActiveSpreadsheet();
  UrlFetchApp.fetch('https://docs.google.com');
}

