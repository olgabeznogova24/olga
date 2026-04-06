const fs = require('fs');
const json = fs.readFileSync('D:/Ceramica Decor/Сайт/style-review-data.json', 'utf8');

const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Inter, sans-serif; background: #111; color: #eee; padding: 20px 20px 80px; }
h1 { font-size: 1.2rem; margin-bottom: 8px; }
.info { font-size: 0.85rem; color: #aaa; margin-bottom: 16px; }
.progress { background: #222; border-radius: 8px; height: 8px; margin-bottom: 6px; }
.progress__bar { background: #3a6a9a; height: 8px; border-radius: 8px; transition: width 0.3s; }
.progress__text { font-size: 0.8rem; color: #aaa; margin-bottom: 16px; }
.controls { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
.controls input[type=text] { background: #222; border: 1px solid #333; color: #eee; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; width: 240px; }
.filter-bar { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.filter-btn { font-size: 0.78rem; padding: 4px 12px; border-radius: 20px; border: 1px solid #444; background: #222; color: #aaa; cursor: pointer; }
.filter-btn.active { background: #3a6a9a; border-color: #3a6a9a; color: #fff; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
.card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 10px; overflow: hidden; }
.card.done { border-color: #2a4a6a; }
.card.auto { border-color: #2a3a2a; }
.card__img { aspect-ratio: 1/1; overflow: hidden; background: #222; position: relative; }
.card__img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.card__num { position: absolute; top: 5px; left: 5px; background: rgba(0,0,0,0.75); font-size: 0.68rem; padding: 2px 6px; border-radius: 4px; color: #ccc; }
.card__auto { position: absolute; top: 5px; right: 5px; background: rgba(40,80,40,0.85); font-size: 0.62rem; padding: 2px 6px; border-radius: 4px; color: #8fc; max-width: 120px; text-align: right; line-height: 1.3; }
.card__body { padding: 8px; }
.card__name { font-size: 0.72rem; color: #bbb; line-height: 1.4; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.card__styles { display: flex; flex-wrap: wrap; gap: 3px; }
.btn-style { font-size: 0.64rem; padding: 3px 8px; border-radius: 20px; border: 1px solid #3a3a3a; background: #222; color: #999; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.btn-style:hover { border-color: #888; color: #fff; }
.btn-style.active { color: #fff; border-color: transparent; }
.btn-style[data-s="арт нуво"].active    { background: #6a3a6a; }
.btn-style[data-s="голландский"].active { background: #1a4a7a; }
.btn-style[data-s="гжель"].active       { background: #1a5a8a; }
.btn-style[data-s="прованс"].active     { background: #4a6a2a; }
.btn-style[data-s="русский"].active     { background: #7a2a1a; }
.btn-style[data-s="модерн"].active      { background: #4a3a6a; }
.btn-style[data-s="современный"].active { background: #1a4a4a; }
.btn-style[data-s="классика"].active    { background: #5a4a1a; }
.btn-style[data-s="без стиля"].active   { background: #3a3a3a; border-color: #555; }
.bottom { position: fixed; bottom: 0; left: 0; right: 0; background: #1a1a1a; border-top: 1px solid #333; padding: 10px 20px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.btn-save { background: #3a6a9a; color: #fff; border: none; padding: 9px 22px; border-radius: 8px; font-size: 0.88rem; cursor: pointer; font-weight: 600; }
.btn-save:hover { background: #4a7aaa; }
.btn-reset { background: #2a2a2a; color: #aaa; border: 1px solid #444; padding: 9px 16px; border-radius: 8px; font-size: 0.82rem; cursor: pointer; }
.save-info { font-size: 0.8rem; color: #666; }
label.chk { display:flex; align-items:center; gap:6px; cursor:pointer; font-size:0.83rem; color:#aaa; }
.legend { font-size:0.75rem; color:#555; }
.legend span { display:inline-block; width:10px; height:10px; border-radius:2px; margin-right:4px; vertical-align:middle; }
`;

const js = `
var STYLES = ['арт нуво','голландский','гжель','прованс','русский','модерн','современный','классика','без стиля'];
var LABELS_KEY = 'styleReview_v1';
var data = DATA_PLACEHOLDER;
var labels = {};
var activeFilter = 'all';
var searchVal = '';

// userEdits — только то, что пользователь менял вручную
var userEdits = {};
try { userEdits = JSON.parse(localStorage.getItem(LABELS_KEY) || '{}'); } catch(e) {}
Object.assign(labels, userEdits);

function saveLabels() {
  localStorage.setItem(LABELS_KEY, JSON.stringify(userEdits));
}

function updateProgress() {
  var edited = Object.keys(userEdits).length;
  var total = data.length;
  document.getElementById('pbar').style.width = (edited/total*100).toFixed(1) + '%';
  document.getElementById('ptxt').textContent = 'Размечено: ' + edited + ' / ' + total;
}

function getVisible() {
  return data.filter(function(item) {
    var lbl = labels[item.a] || null;
    if (activeFilter === 'unlabeled' && lbl) return false;
    if (activeFilter === 'edited' && !userEdits[item.a]) return false;
    if (activeFilter === 'unlabeled' && labels[item.a]) return false;
    if (STYLES.indexOf(activeFilter) !== -1 && lbl !== activeFilter) return false;
    if (searchVal && item.n.toLowerCase().indexOf(searchVal.toLowerCase()) === -1) return false;
    return true;
  });
}

function renderCard(item, num) {
  var lbl = labels[item.a] || null;
  var isEdited = !!userEdits[item.a];
  var imgUrl = 'https://ceramicadecor.ru/userdata/product/preview/' + item.img + '_500.jpg';
  var btns = STYLES.map(function(s) {
    return '<button class="btn-style' + (lbl===s?' active':'') + '" data-a="' + item.a + '" data-s="' + s + '">' + s + '</button>';
  }).join('');
  var autoTag = '';
  var cardClass = 'card' + (isEdited ? ' done' : '');
  return '<div class="' + cardClass + '" id="c_' + num + '">'
    + '<div class="card__img"><span class="card__num">#' + num + '</span>' + autoTag
    + '<img src="' + imgUrl + '" loading="lazy" alt=""></div>'
    + '<div class="card__body"><div class="card__name">' + item.n + '</div>'
    + '<div class="card__styles">' + btns + '</div></div></div>';
}

function render() {
  var visible = getVisible();
  var html = '';
  for (var i = 0; i < visible.length; i++) {
    html += renderCard(visible[i], data.indexOf(visible[i]) + 1);
  }
  document.getElementById('grid').innerHTML = html || '<p style="color:#555;padding:40px 0;">Ничего не найдено.</p>';
  updateProgress();
}

document.addEventListener('click', function(e) {
  var btn = e.target.closest('.btn-style');
  if (!btn) return;
  var a = btn.getAttribute('data-a');
  var s = btn.getAttribute('data-s');
  // Если нажат уже активный — снять выбор
  if (labels[a] === s) {
    delete labels[a];
    delete userEdits[a];
  } else {
    labels[a] = s;
    userEdits[a] = s;
  }
  saveLabels();
  updateProgress();
  var cardNum = null;
  for (var i=0; i<data.length; i++) { if (data[i].a===a) { cardNum=i+1; break; } }
  var card = document.getElementById('c_' + cardNum);
  if (card) {
    var lbl = labels[a] || null;
    var isEdited = !!userEdits[a];
    var isAuto = !!data[cardNum-1].autoStyle && !isEdited;
    card.className = 'card' + (isEdited ? ' done' : (isAuto ? ' auto' : ''));
    card.querySelectorAll('.btn-style').forEach(function(b){
      b.className = 'btn-style' + (b.getAttribute('data-s')===lbl ? ' active' : '');
    });
  }
  document.getElementById('saveInfo').textContent = 'Сохранено';
  setTimeout(function(){ document.getElementById('saveInfo').textContent = ''; }, 1200);
});

document.getElementById('filterBar').addEventListener('click', function(e) {
  var btn = e.target.closest('.filter-btn');
  if (!btn) return;
  activeFilter = btn.getAttribute('data-f');
  document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.toggle('active', b===btn); });
  render();
});

document.getElementById('search').addEventListener('input', function() { searchVal = this.value; render(); });

document.getElementById('hideLabeled').addEventListener('change', function() {
  activeFilter = this.checked ? 'unlabeled' : 'all';
  document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-f')===activeFilter); });
  render();
});

document.getElementById('btnDownload').addEventListener('click', function() {
  var result = data.map(function(item) {
    return { a: item.a, n: item.n, style: labels[item.a] || null, edited: !!userEdits[item.a] };
  });
  var blob = new Blob([JSON.stringify(result, null, 2)], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a'); a.href=url; a.download='style-labels.json'; a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('btnReset').addEventListener('click', function() {
  if (!confirm('Сбросить все ручные изменения?')) return;
  userEdits = {};
  labels = {};
  saveLabels();
  render();
});

render();
`;

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Разметка стиля товаров</title>
<style>${css}</style>
</head>
<body>
<h1>Разметка стиля — голландский (92)</h1>
<div class="info">
  Товары, отмеченные как «голландский». Можно изменить стиль или переназначить.<br>
  Синяя рамка — стиль назначен вручную. Повторный клик на активный стиль — снять. Прогресс сохраняется в браузере.
</div>
<div class="progress"><div class="progress__bar" id="pbar"></div></div>
<div class="progress__text" id="ptxt">Загрузка...</div>
<div class="controls">
  <input type="text" id="search" placeholder="Поиск по названию...">
  <label class="chk"><input type="checkbox" id="hideLabeled"> Показать только без стиля</label>
</div>
<div class="filter-bar" id="filterBar">
  <button class="filter-btn active" data-f="all">Все</button>
  <button class="filter-btn" data-f="unlabeled">Без стиля</button>
  <button class="filter-btn" data-f="edited">Изменённые</button>
  <button class="filter-btn" data-f="арт нуво">Арт Нуво</button>
  <button class="filter-btn" data-f="голландский">Голландский</button>
  <button class="filter-btn" data-f="гжель">Гжель</button>
  <button class="filter-btn" data-f="прованс">Прованс</button>
  <button class="filter-btn" data-f="русский">Русский</button>
  <button class="filter-btn" data-f="модерн">Модерн</button>
  <button class="filter-btn" data-f="современный">Современный</button>
  <button class="filter-btn" data-f="классика">Классика</button>
</div>
<div class="grid" id="grid"></div>
<div class="bottom">
  <button class="btn-save" id="btnDownload">Скачать JSON</button>
  <button class="btn-reset" id="btnReset">Сбросить правки</button>
  <span class="save-info" id="saveInfo"></span>
</div>
<script>${js.replace('DATA_PLACEHOLDER', json)}</script>
</body>
</html>`;

fs.writeFileSync('D:/Ceramica Decor/Сайт/style-review.html', html, 'utf8');
console.log('Done, size:', html.length);
