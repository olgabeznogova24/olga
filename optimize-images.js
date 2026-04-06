const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'images');
const BACKUP_DIR = path.join(IMAGES_DIR, '_originals');
const MAX_SIZE = 2000;   // px по большей стороне
const JPEG_QUALITY = 82; // 0-100
const PNG_QUALITY = 80;

const EXTENSIONS = ['.jpg', '.jpeg', '.png'];

// Сколько байт сэкономлено
let totalSaved = 0;
let totalOriginal = 0;
let processed = 0;
let skipped = 0;

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function getAllImages(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Пропускаем папку с бэкапами
      if (entry.name === '_originals') continue;
      getAllImages(fullPath, results);
    } else if (EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = fs.statSync(filePath).size;
  totalOriginal += originalSize;

  // Бэкап оригинала (сохраняем относительную структуру)
  const rel = path.relative(IMAGES_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, rel);
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }

  // Обработка
  const img = sharp(filePath);
  const meta = await img.metadata();

  const needsResize = (meta.width > MAX_SIZE || meta.height > MAX_SIZE);
  const resizeOpts = needsResize
    ? { width: MAX_SIZE, height: MAX_SIZE, fit: 'inside', withoutEnlargement: true }
    : null;

  let pipeline = img;
  if (resizeOpts) {
    pipeline = pipeline.resize(resizeOpts);
  }

  // Сохраняем во временный файл, потом перезаписываем
  const tmpPath = filePath + '.tmp';

  if (ext === '.png') {
    await pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 }).toFile(tmpPath);
  } else {
    await pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true }).toFile(tmpPath);
  }

  const newSize = fs.statSync(tmpPath).size;

  // Перезаписываем только если новый файл меньше
  if (newSize < originalSize) {
    fs.renameSync(tmpPath, filePath);
    const saved = originalSize - newSize;
    totalSaved += saved;
    console.log(`✓ ${rel.padEnd(55)} ${formatMB(originalSize)} → ${formatMB(newSize)}  (−${formatMB(saved)})`);
  } else {
    fs.unlinkSync(tmpPath);
    console.log(`– ${rel.padEnd(55)} ${formatMB(originalSize)} (пропущен — уже оптимален)`);
    skipped++;
  }

  processed++;
}

async function main() {
  console.log('=== Оптимизация изображений ===\n');
  console.log(`Параметры: max ${MAX_SIZE}px, JPEG quality ${JPEG_QUALITY}, PNG quality ${PNG_QUALITY}`);
  console.log(`Оригиналы сохраняются в: images/_originals/\n`);

  const images = getAllImages(IMAGES_DIR);
  console.log(`Найдено изображений: ${images.length}\n`);

  for (const img of images) {
    await optimizeImage(img);
  }

  console.log('\n=== Итог ===');
  console.log(`Обработано: ${processed} файлов (${skipped} пропущено)`);
  console.log(`Было: ${formatMB(totalOriginal)}`);
  console.log(`Экономия: ${formatMB(totalSaved)}`);
  console.log(`Стало: ${formatMB(totalOriginal - totalSaved)}`);
}

main().catch(console.error);
