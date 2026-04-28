function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('DAFTAR PEMINJAMAN RUANG - FIA UB')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0]; 
    var rawData = sheet.getDataRange().getValues();
    var timeZone = ss.getSpreadsheetTimeZone();
    if (rawData.length < 2) return []; 

    // Ambil tanggal hari ini (set jam ke 00:00:00 untuk perbandingan murni tanggal)
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    // Batas akhir tampilan (2 bulan ke depan)
    var lastLimit = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    var header = rawData[0].map(function(h) { 
      return String(h).toUpperCase().trim(); 
    });

    var idx = {
      tanggal: header.indexOf("TANGGAL KEGIATAN"),
      kegiatan: header.indexOf("NAMA KEGIATAN"),
      pemohon: header.indexOf("NAMA PEMOHON"),
      hp: header.indexOf("NO HP (WA)"),
      ruang: header.indexOf("RUANG"),
      mulai: header.indexOf("JAM MULAI"),
      selesai: header.indexOf("JAM SELESAI"),
      verifUlt: header.indexOf("VERIFULT"),    
      verifKaur: header.indexOf("VERIFKAUR")   
    };

    var results = [];
    for (var i = 1; i < rawData.length; i++) {
      var row = rawData[i];
      if (idx.tanggal === -1 || !row[idx.tanggal] || !row[idx.ruang]) continue;
      var tglRaw = row[idx.tanggal];
      var rowDate = (tglRaw instanceof Date) ? tglRaw : new Date(tglRaw);
      if (isNaN(rowDate.getTime())) continue;

      // FILTER: Hanya Hari Ini dan Masa Depan
      if (rowDate < today) continue;
      var verifUlt = String(row[idx.verifUlt] || "").trim().toUpperCase();
      if (verifUlt !== "DIAJUKAN" && verifUlt !== "") continue;
      var tglFormatted = Utilities.formatDate(rowDate, timeZone, "yyyy-MM-dd");

      results.push({
        id: i + 1,
        namaKegiatan: String(row[idx.kegiatan] || "-"),
        pemohon: String(row[idx.pemohon] || "-"),
        noHp: String(row[idx.hp] || "-"),
        ruang: String(row[idx.ruang] || "-").trim(),
        tanggal: String(tglFormatted),
        mulai: formatWaktu(row[idx.mulai]),
        selesai: formatWaktu(row[idx.selesai]),
        verifUlt: verifUlt,            
        verifKaur: String(row[idx.verifKaur] || "").trim()
      });
    }

    // Sortir hasil: Tanggal terdekat muncul duluan
    results.sort(function(a, b) {
      return new Date(a.tanggal) - new Date(b.tanggal);
    });

    return results;
  } catch (e) {
    console.log("Error: " + e.message);
    return [];
  }
}

function formatWaktu(waktu) {
  if (waktu instanceof Date) return Utilities.formatDate(waktu, Session.getScriptTimeZone(), "HH:mm");
  if (typeof waktu === 'number') {
    var totalMenit = Math.round(waktu * 24 * 60);
    var jam = Math.floor(totalMenit / 60);
    var menit = totalMenit % 60;
    return jam.toString().padStart(2, '0') + ":" + menit.toString().padStart(2, '0');
  }

  var strWaktu = String(waktu).trim();
  if (strWaktu.includes(':')) {
    var parts = strWaktu.split(':');
    return parts[0].padStart(2, '0') + ":" + parts[1].substring(0,2).padStart(2, '0');
  }
  return "00:00";
}
