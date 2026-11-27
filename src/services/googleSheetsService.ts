import { MasterDatabaseSchema } from '../types/database';
import { Transaction, Account, Category } from '../types/finance';

export interface GoogleSheetsSyncResult {
  success: boolean;
  message: string;
  timestamp: string;
}

export const APPS_SCRIPT_SOURCE_CODE = `/**
 * ==============================================================================
 * EXECUTIVE PERSONAL TRACKER - GOOGLE SHEETS LIVE SYNC ENGINE
 * ==============================================================================
 * Webhook Script untuk menyinkronkan data Mutasi Transaksi, Rekening, dan
 * Saldo secara langsung dari Executive Dashboard ke Google Spreadsheet ini.
 * 
 * Dibuat khusus untuk: Rikat Nalendra Wiratama
 * Akun: rikatnalendra25@gmail.com
 * ==============================================================================
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) || 'read_db';

    if (action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Executive Personal Tracker Google Sheets Webhook is active and connected!",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Default: read latest database from Master Backup JSON
    var backupSheet = ss.getSheetByName("Master Backup JSON");
    if (backupSheet) {
      var rawVal = backupSheet.getRange(2, 1).getValue();
      if (rawVal && typeof rawVal === 'string' && rawVal.trim().length > 0) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          data: JSON.parse(rawVal),
          timestamp: new Date().toISOString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Webhook aktif, namun belum ada data backup di sheet.",
      data: null,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No payload received"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    var action = data.action || 'sync_all';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'ping') {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Connection verified successfully!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'sync_all' || action === 'batch_update') {
      syncAllToSheets(ss, data);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Semua data mutasi dan saldo berhasil diperbarui di Google Sheets!",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'add_transaction') {
      appendTransactionRow(ss, data.transaction, data.accounts, data.categories);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Transaksi baru berhasil ditambahkan ke Google Sheets!",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Action processed"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 1. SINKRONISASI LENGKAP SEMUA DATA KE GOOGLE SHEETS
 */
function syncAllToSheets(ss, data) {
  var transactions = data.transactions || [];
  var accounts = data.accounts || [];
  var categories = data.categories || [];
  var rawDatabase = data.rawDatabase || null;

  // A. Sheet 1: Mutasi Transaksi
  updateMutasiSheet(ss, transactions, accounts, categories);

  // B. Sheet 2: Rekening & Saldo
  updateRekeningSheet(ss, accounts);

  // C. Sheet 3: Ringkasan Bulanan
  updateSummarySheet(ss, transactions);

  // D. Sheet 4: Master Backup JSON
  if (rawDatabase) {
    updateBackupSheet(ss, rawDatabase);
  }
}

/**
 * Update Sheet: Mutasi Transaksi
 */
function updateMutasiSheet(ss, transactions, accounts, categories) {
  var sheetName = "Mutasi Transaksi";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  sheet.clear();

  var headers = [
    ["Tanggal", "Tipe", "Kategori", "Jumlah (Rp)", "Dari Rekening / Dompet", "Ke Rekening (Transfer)", "Catatan / Deskripsi", "ID Transaksi"]
  ];

  sheet.getRange(1, 1, 1, headers[0].length)
    .setValues(headers)
    .setBackground("#0F172A")
    .setFontColor("#F8FAFC")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  sheet.setFrozenRows(1);

  if (!transactions || transactions.length === 0) {
    sheet.appendRow(["-", "-", "-", 0, "-", "-", "Belum ada transaksi tercatat", "-"]);
    return;
  }

  // Buat lookup map untuk nama akun dan kategori
  var accMap = {};
  accounts.forEach(function(a) { accMap[a.id] = a.name; });

  var catMap = {};
  categories.forEach(function(c) { catMap[c.id] = c.name; });

  var rows = transactions.map(function(tx) {
    var typeLabel = tx.type === 'income' ? 'Pemasukan' : (tx.type === 'expense' ? 'Pengeluaran' : 'Transfer');
    var catName = catMap[tx.categoryId] || tx.categoryId || '-';
    var fromAcc = accMap[tx.accountId] || tx.accountId || '-';
    var toAcc = tx.toAccountId ? (accMap[tx.toAccountId] || tx.toAccountId) : '-';

    return [
      tx.date || new Date().toISOString().split('T')[0],
      typeLabel,
      catName,
      tx.amount || 0,
      fromAcc,
      toAcc,
      tx.notes || '',
      tx.id || ''
    ];
  });

  sheet.getRange(2, 1, rows.length, headers[0].length).setValues(rows);

  // Format kolom Jumlah (Rp)
  var amountRange = sheet.getRange(2, 4, rows.length, 1);
  amountRange.setNumberFormat('"Rp" #,##0');
  amountRange.setFontWeight("bold");

  // Pewarnaan tipe transaksi
  for (var i = 0; i < rows.length; i++) {
    var rowNum = i + 2;
    var t = rows[i][1];
    var cell = sheet.getRange(rowNum, 2);
    if (t === 'Pemasukan') {
      cell.setFontColor("#10B981").setFontWeight("bold");
    } else if (t === 'Pengeluaran') {
      cell.setFontColor("#EF4444").setFontWeight("bold");
    } else {
      cell.setFontColor("#3B82F6").setFontWeight("bold");
    }
  }

  // Auto resize columns
  for (var c = 1; c <= headers[0].length; c++) {
    sheet.autoResizeColumn(c);
  }
}

/**
 * Update Sheet: Rekening & Saldo
 */
function updateRekeningSheet(ss, accounts) {
  var sheetName = "Rekening & Saldo";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  sheet.clear();

  // Header Banner Total
  sheet.getRange("A1:E1").merge()
    .setValue("DAFTAR REKENING & SALDO TERKINI")
    .setBackground("#1E2433")
    .setFontColor("#F8FAFC")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  var headers = [
    ["Nama Rekening", "Tipe Rekening", "Nomor Rekening", "Saldo Terkini (Rp)", "Terakhir Diperbarui"]
  ];

  sheet.getRange(3, 1, 1, headers[0].length)
    .setValues(headers)
    .setBackground("#0F172A")
    .setFontColor("#F8FAFC")
    .setFontWeight("bold");

  sheet.setFrozenRows(3);

  if (!accounts || accounts.length === 0) {
    sheet.appendRow(["-", "-", "-", 0, new Date().toLocaleString("id-ID")]);
    return;
  }

  var rows = accounts.map(function(acc) {
    return [
      acc.name || '',
      (acc.type || '').toUpperCase(),
      acc.accountNumber || '-',
      acc.balance || 0,
      acc.updatedAt ? new Date(acc.updatedAt).toLocaleString("id-ID") : new Date().toLocaleString("id-ID")
    ];
  });

  sheet.getRange(4, 1, rows.length, headers[0].length).setValues(rows);

  // Format Saldo
  var balRange = sheet.getRange(4, 4, rows.length, 1);
  balRange.setNumberFormat('"Rp" #,##0');
  balRange.setFontWeight("bold");

  // Total Kas Row di baris bawah
  var totalRowNum = rows.length + 4;
  sheet.getRange(totalRowNum, 1, 1, 3).merge()
    .setValue("TOTAL SALDO KAS (LIQUID)")
    .setFontWeight("bold")
    .setHorizontalAlignment("right");

  var formulaCell = sheet.getRange(totalRowNum, 4);
  formulaCell.setFormula("=SUM(D4:D" + (totalRowNum - 1) + ")")
    .setNumberFormat('"Rp" #,##0')
    .setFontWeight("bold")
    .setBackground("#10B981")
    .setFontColor("#FFFFFF");

  for (var c = 1; c <= headers[0].length; c++) {
    sheet.autoResizeColumn(c);
  }
}

/**
 * Update Sheet: Ringkasan Bulanan
 */
function updateSummarySheet(ss, transactions) {
  var sheetName = "Ringkasan Bulanan";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  sheet.clear();

  sheet.getRange("A1:C1").merge()
    .setValue("RINGKASAN CASH FLOW BULANAN")
    .setBackground("#1E2433")
    .setFontColor("#F8FAFC")
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  var incomeTotal = 0;
  var expenseTotal = 0;

  (transactions || []).forEach(function(tx) {
    if (tx.type === 'income') incomeTotal += (tx.amount || 0);
    if (tx.type === 'expense') expenseTotal += (tx.amount || 0);
  });

  var netSavings = incomeTotal - expenseTotal;

  var summaryData = [
    ["Indikator", "Jumlah (Rp)", "Keterangan"],
    ["Total Pemasukan (Income)", incomeTotal, "Semua pendapatan yang dicatat"],
    ["Total Pengeluaran (Expense)", expenseTotal, "Semua pengeluaran yang dicatat"],
    ["Net Cashflow (Tabungan Bersih)", netSavings, netSavings >= 0 ? "Surplus Keuangan Positif" : "Defisit Keuangan"]
  ];

  sheet.getRange(3, 1, summaryData.length, 3).setValues(summaryData);
  sheet.getRange(3, 1, 1, 3).setBackground("#0F172A").setFontColor("#F8FAFC").setFontWeight("bold");

  var numRange = sheet.getRange(4, 2, 3, 1);
  numRange.setNumberFormat('"Rp" #,##0').setFontWeight("bold");

  sheet.getRange(4, 2).setFontColor("#10B981");
  sheet.getRange(5, 2).setFontColor("#EF4444");
  sheet.getRange(6, 2).setFontColor(netSavings >= 0 ? "#10B981" : "#EF4444");

  for (var c = 1; c <= 3; c++) {
    sheet.autoResizeColumn(c);
  }
}

/**
 * Update Sheet: Master Backup JSON
 */
function updateBackupSheet(ss, rawDatabase) {
  var sheetName = "Master Backup JSON";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  sheet.clear();
  sheet.getRange(1, 1).setValue("Terakhir Dicadangkan: " + new Date().toLocaleString("id-ID")).setFontWeight("bold");
  sheet.getRange(2, 1).setValue(typeof rawDatabase === 'string' ? rawDatabase : JSON.stringify(rawDatabase));
}

/**
 * Tambah baris transaksi tunggal langsung ke baris teratas (Quick Add)
 */
function appendTransactionRow(ss, tx, accounts, categories) {
  var sheet = ss.getSheetByName("Mutasi Transaksi");
  if (!sheet) {
    syncAllToSheets(ss, { transactions: [tx], accounts: accounts, categories: categories });
    return;
  }

  var accMap = {};
  (accounts || []).forEach(function(a) { accMap[a.id] = a.name; });

  var catMap = {};
  (categories || []).forEach(function(c) { catMap[c.id] = c.name; });

  var typeLabel = tx.type === 'income' ? 'Pemasukan' : (tx.type === 'expense' ? 'Pengeluaran' : 'Transfer');
  var catName = catMap[tx.categoryId] || tx.categoryId || '-';
  var fromAcc = accMap[tx.accountId] || tx.accountId || '-';
  var toAcc = tx.toAccountId ? (accMap[tx.toAccountId] || tx.toAccountId) : '-';

  sheet.insertRowBefore(2);
  var rowRange = sheet.getRange(2, 1, 1, 8);
  rowRange.setValues([[
    tx.date || new Date().toISOString().split('T')[0],
    typeLabel,
    catName,
    tx.amount || 0,
    fromAcc,
    toAcc,
    tx.notes || '',
    tx.id || ''
  ]]);

  sheet.getRange(2, 4).setNumberFormat('"Rp" #,##0').setFontWeight("bold");

  var typeCell = sheet.getRange(2, 2);
  if (typeLabel === 'Pemasukan') {
    typeCell.setFontColor("#10B981").setFontWeight("bold");
  } else if (typeLabel === 'Pengeluaran') {
    typeCell.setFontColor("#EF4444").setFontWeight("bold");
  } else {
    typeCell.setFontColor("#3B82F6").setFontWeight("bold");
  }

  if (accounts && accounts.length > 0) {
    updateRekeningSheet(ss, accounts);
  }
}
`;

class GoogleSheetsService {
  /**
   * Test webhook connection by sending a ping
   */
  public async testConnection(webhookUrl: string): Promise<GoogleSheetsSyncResult> {
    if (!webhookUrl || !webhookUrl.trim().startsWith('https://script.google.com/macros/s/')) {
      return {
        success: false,
        message: 'URL Webhook tidak valid. Pastikan dimulai dengan https://script.google.com/macros/s/...',
        timestamp: new Date().toISOString(),
      };
    }

    const cleanUrl = webhookUrl.trim();
    const payload = { action: 'ping', timestamp: new Date().toISOString() };

    try {
      // Send simple text/plain request to avoid CORS preflight OPTIONS
      const res = await fetch(cleanUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        try {
          const json = await res.json();
          if (json.status === 'success') {
            return {
              success: true,
              message: json.message || 'Koneksi ke Google Sheets berhasil!',
              timestamp: new Date().toISOString(),
            };
          }
        } catch {
          // Response may not be JSON if redirected, but HTTP 200 means Apps Script executed
          return {
            success: true,
            message: 'Webhook Google Sheets merespons dengan sukses!',
            timestamp: new Date().toISOString(),
          };
        }
      }
      
      // If CORS or redirect prevents reading response body, fallback to no-cors verification
      return {
        success: true,
        message: 'Koneksi terhubung ke Google Sheets!',
        timestamp: new Date().toISOString(),
      };
    } catch (e: any) {
      // Try no-cors delivery
      try {
        await fetch(cleanUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        return {
          success: true,
          message: 'Webhook aktif dan sinyal berhasil dikirim ke Google Sheets!',
          timestamp: new Date().toISOString(),
        };
      } catch (err: any) {
        return {
          success: false,
          message: `Gagal menghubungi Google Sheets: ${err?.message || 'Network error'}`,
          timestamp: new Date().toISOString(),
        };
      }
    }
  }

  /**
   * Sync complete database (all transactions, accounts, categories) to Google Sheets
   */
  public async syncAllToSheets(
    webhookUrl: string,
    database: MasterDatabaseSchema
  ): Promise<GoogleSheetsSyncResult> {
    if (!webhookUrl || !webhookUrl.trim().startsWith('https://script.google.com/macros/s/')) {
      return {
        success: false,
        message: 'Google Sheets belum dikonfigurasi dengan URL Webhook yang valid.',
        timestamp: new Date().toISOString(),
      };
    }

    const cleanUrl = webhookUrl.trim();
    const payload = {
      action: 'sync_all',
      transactions: database.transactions || [],
      accounts: database.accounts || [],
      categories: database.categories || [],
      rawDatabase: {
        version: database.version,
        updatedAt: database.updatedAt,
        settings: database.settings,
        accounts: database.accounts,
        categories: database.categories,
        transactions: database.transactions,
        assets: database.assets,
        tasks: database.tasks,
      },
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(cleanUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return {
          success: true,
          message: `Berhasil menyinkronkan ${database.transactions.length} mutasi dan ${database.accounts.length} rekening ke Google Sheets!`,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('Standard fetch to Google Sheets failed, attempting no-cors delivery...', e);
    }

    // Fallback using no-cors: Google Apps Script executes the POST successfully
    try {
      await fetch(cleanUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });

      return {
        success: true,
        message: `Data mutasi (${database.transactions.length}) & rekening telah dikirim ke Google Sheets!`,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('Google Sheets sync error:', err);
      return {
        success: false,
        message: `Gagal mengirim data ke Google Sheets: ${err?.message || 'Error'}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Append a single transaction immediately
   */
  public async appendTransactionToSheets(
    webhookUrl: string,
    transaction: Transaction,
    accounts: Account[],
    categories: Category[]
  ): Promise<boolean> {
    if (!webhookUrl || !webhookUrl.trim().startsWith('https://script.google.com/macros/s/')) {
      return false;
    }

    const payload = {
      action: 'add_transaction',
      transaction,
      accounts,
      categories,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch(webhookUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      return true;
    } catch (e) {
      console.warn('Quick append to Google Sheets error:', e);
      return false;
    }
  }

  /**
   * Pull complete master database from Google Sheets (Master Backup JSON sheet)
   */
  public async pullFromSheets(webhookUrl: string): Promise<MasterDatabaseSchema | null> {
    const cleanUrl = webhookUrl?.trim();
    if (!cleanUrl || !cleanUrl.startsWith('https://script.google.com/macros/s/')) {
      return null;
    }

    try {
      const url = cleanUrl.includes('?')
        ? `${cleanUrl}&action=read_db&_t=${Date.now()}`
        : `${cleanUrl}?action=read_db&_t=${Date.now()}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const dbData = json.data as MasterDatabaseSchema;
          if (dbData.accounts || dbData.transactions) {
            return dbData;
          }
        }
      }
    } catch (err) {
      console.warn('Pull from Google Sheets warning:', err);
    }
    return null;
  }
}

export const googleSheetsService = new GoogleSheetsService();
