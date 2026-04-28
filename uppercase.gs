function formatUpperSpesifik(e) {
  var sheet = e.range.getSheet();
  var row = e.range.getRow();
  
  // Ambil data dari baris yang baru saja masuk
  // Kolom D (Nama Pemohon) dan Kolom G (Nama Kegiatan)
  // Sesuaikan angka 4 dan 7 jika urutan kolom di sheet Anda berbeda
  var colNamaPemohon = 4; 
  var colNamaKegiatan = 7; 
  
  var namaPemohon = sheet.getRange(row, colNamaPemohon).getValue();
  var namaKegiatan = sheet.getRange(row, colNamaKegiatan).getValue();
  
  // Ubah menjadi uppercase jika datanya berupa teks
  if (typeof namaPemohon == 'string') {
    sheet.getRange(row, colNamaPemohon).setValue(namaPemohon.toUpperCase());
  }
  
  if (typeof namaKegiatan == 'string') {
    sheet.getRange(row, colNamaKegiatan).setValue(namaKegiatan.toUpperCase());
  }
}
