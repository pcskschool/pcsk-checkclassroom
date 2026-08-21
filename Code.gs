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
        'term'
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

      case 'autoClean':
        return createJsonResponse(autoCleanDriveImages());

      case 'syncImages':
        return createJsonResponse(syncDriveImagesToSheetLogs());

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

      case 'autoClean':
        return createJsonResponse(autoCleanDriveImages());

      case 'syncImages':
        return createJsonResponse(syncDriveImagesToSheetLogs());

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

  return {
    status: 'success',
    data: {
      settings: settingsMap,
      users: usersSanitized,
      classrooms: classrooms,
      areas: areas,
      checklists: checklists,
      teachers: teachers,
      todaySummary: todaySummary
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
            
            // Direct View URL for optimal preview and Fancybox compatibility
            const previewUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
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
      term
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
          url: `https://lh3.googleusercontent.com/d/${fileId}`,
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
      auto_delete_days: payload.auto_delete_days !== undefined ? String(payload.auto_delete_days).trim() : undefined
    };

    for (let r = 1; r < data.length; r++) {
      const key = String(data[r][keyIndex]).trim();
      if (updates[key] !== undefined) {
        sheet.getRange(r + 1, valIndex + 1).setValue(updates[key]);
      }
    }

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

      // 3. ตรวจสอบว่า area_id ถูกระบุหรือไม่
      if (!areaId) {
        return { status: 'error', message: 'กรุณาเลือกเขตพื้นที่รับผิดชอบ' };
      }

      // 4. ตรวจสอบความซ้ำซ้อนภายในชีต (classroom และ area_id ห้ามซ้ำ)
      for (let r = 1; r < data.length; r++) {
        const rowClass = String(data[r][classCol]).trim();
        const rowArea = String(data[r][areaCol]).trim();

        // กรณี Create: ห้ามซ้ำกับแถวใดๆ
        if (mode === 'create') {
          if (rowClass === classroom) {
            return { status: 'error', message: `ห้องเรียน ${classroom} มีอยู่ในระบบแล้ว` };
          }
          if (rowArea === areaId) {
            return { status: 'error', message: `เขตพื้นที่ ${areaId} ถูกผูกไว้กับห้อง ${rowClass} แล้ว (ห้ามซ้ำกัน)` };
          }
        }

        // กรณี Update: ข้ามแถวของตัวเอง (เทียบกับ oldClassroom)
        if (mode === 'update') {
          if (rowClass !== oldClassroom) {
            if (rowClass === classroom) {
              return { status: 'error', message: `ห้องเรียน ${classroom} มีอยู่ในระบบแล้ว` };
            }
            if (rowArea === areaId) {
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

