const fs = require('fs');
const json = fs.readFileSync('D:/Ceramica Decor/Сайт/color-review-inline.json', 'utf8');

const css = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Inter, sans-serif; background: #111; color: #eee; padding: 20px 20px 80px; }
h1 { font-size: 1.2rem; margin-bottom: 8px; }
.info { font-size: 0.85rem; color: #aaa; margin-bottom: 16px; }
.progress { background: #222; border-radius: 8px; height: 8px; margin-bottom: 6px; }
.progress__bar { background: #cb3b25; height: 8px; border-radius: 8px; transition: width 0.3s; }
.progress__text { font-size: 0.8rem; color: #aaa; margin-bottom: 16px; }
.controls { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
.controls input[type=text] { background: #222; border: 1px solid #333; color: #eee; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; width: 240px; }
.filter-bar { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
.filter-btn { font-size: 0.78rem; padding: 4px 12px; border-radius: 20px; border: 1px solid #444; background: #222; color: #aaa; cursor: pointer; }
.filter-btn.active { background: #cb3b25; border-color: #cb3b25; color: #fff; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }
.card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 10px; overflow: hidden; }
.card.done { border-color: #2a5a2a; }
.card__img { aspect-ratio: 1/1; overflow: hidden; background: #222; position: relative; }
.card__img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.card__num { position: absolute; top: 5px; left: 5px; background: rgba(0,0,0,0.75); font-size: 0.68rem; padding: 2px 6px; border-radius: 4px; color: #ccc; }
.card__body { padding: 8px; }
.card__name { font-size: 0.72rem; color: #bbb; line-height: 1.4; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.card__colors { display: flex; flex-wrap: wrap; gap: 3px; }
.btn-color { font-size: 0.64rem; padding: 3px 7px; border-radius: 20px; border: 1px solid #3a3a3a; background: #222; color: #999; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.btn-color:hover { border-color: #888; color: #fff; }
.btn-color.active { color: #fff; border-color: transparent; }
.btn-color[data-c="белые/бежевые"].active  { background: #7a6a4a; }
.btn-color[data-c="зелёные"].active        { background: #2a5a2a; }
.btn-color[data-c="синие"].active          { background: #1a3a7a; }
.btn-color[data-c="голубые"].active        { background: #1a6a8a; }
.btn-color[data-c="красные/оранжевые"].active { background: #7a1a0a; }
.btn-color[data-c="коричневые"].active     { background: #5a3010; }
.btn-color[data-c="жёлтые"].active         { background: #7a6a00; }
.btn-color[data-c="серые"].active          { background: #3a3a3a; }
.btn-color[data-c="чёрные"].active         { background: #111; border: 1px solid #555; }
.btn-color[data-c="мультицвет"].active     { background: #5a1a5a; }
.bottom { position: fixed; bottom: 0; left: 0; right: 0; background: #1a1a1a; border-top: 1px solid #333; padding: 10px 20px; display: flex; gap: 10px; align-items: center; }
.btn-save { background: #cb3b25; color: #fff; border: none; padding: 9px 22px; border-radius: 8px; font-size: 0.88rem; cursor: pointer; font-weight: 600; }
.btn-save:hover { background: #e04030; }
.btn-reset { background: #2a2a2a; color: #aaa; border: 1px solid #444; padding: 9px 16px; border-radius: 8px; font-size: 0.82rem; cursor: pointer; }
.save-info { font-size: 0.8rem; color: #666; }
label.chk { display:flex; align-items:center; gap:6px; cursor:pointer; font-size:0.83rem; color:#aaa; }
`;

const js = `
var COLORS = ['белые/бежевые','зелёные','синие','голубые','красные/оранжевые','коричневые','жёлтые','серые','чёрные','мультицвет'];
var LABELS_KEY = 'colorReview_v3';
var data = DATA_PLACEHOLDER;
var labels = {};
var activeFilter = 'all';
var searchVal = '';
try { labels = JSON.parse(localStorage.getItem(LABELS_KEY) || '{}'); } catch(e) {}

function saveLabels() { localStorage.setItem(LABELS_KEY, JSON.stringify(labels)); }

function updateProgress() {
  var done = data.filter(function(item){ return (labels[item.a]||[]).length > 0; }).length;
  var total = data.length;
  document.getElementById('pbar').style.width = (done/total*100).toFixed(1) + '%';
  document.getElementById('ptxt').textContent = 'Размечено: ' + done + ' / ' + total;
}

function getVisible() {
  return data.filter(function(item) {
    var lbls = labels[item.a] || [];
    if (activeFilter === 'unlabeled' && lbls.length > 0) return false;
    if (activeFilter !== 'all' && activeFilter !== 'unlabeled' && lbls.indexOf(activeFilter) === -1) return false;
    if (searchVal && item.n.toLowerCase().indexOf(searchVal.toLowerCase()) === -1) return false;
    return true;
  });
}

function renderCard(item, num) {
  var lbls = labels[item.a] || [];
  var imgUrl = 'https://ceramicadecor.ru/userdata/product/preview/' + item.img + '_500.jpg';
  var btns = COLORS.map(function(c) {
    var short = c.replace('белые/бежевые','белые').replace('красные/оранжевые','красн/ор.');
    return '<button class="btn-color' + (lbls.indexOf(c)!==-1?' active':'') + '" data-a="' + item.a + '" data-c="' + c + '">' + short + '</button>';
  }).join('');
  return '<div class="card' + (lbls.length>0?' done':'') + '" id="c_' + num + '">'
    + '<div class="card__img"><span class="card__num">#' + num + '</span>'
    + '<img src="' + imgUrl + '" loading="lazy" alt=""></div>'
    + '<div class="card__body"><div class="card__name">' + item.n + '</div>'
    + '<div class="card__colors">' + btns + '</div></div></div>';
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
  var btn = e.target.closest('.btn-color');
  if (!btn) return;
  var a = btn.getAttribute('data-a');
  var c = btn.getAttribute('data-c');
  var lbls = labels[a] ? labels[a].slice() : [];
  var idx = lbls.indexOf(c);
  if (idx !== -1) { lbls.splice(idx, 1); } else { lbls.push(c); }
  if (lbls.length > 0) { labels[a] = lbls; } else { delete labels[a]; }
  saveLabels();
  updateProgress();
  var cardNum = null;
  for (var i=0; i<data.length; i++) { if (data[i].a===a) { cardNum=i+1; break; } }
  var card = document.getElementById('c_' + cardNum);
  if (card) {
    var current = labels[a] || [];
    card.className = 'card' + (current.length > 0 ? ' done' : '');
    card.querySelectorAll('.btn-color').forEach(function(b){
      b.className = 'btn-color' + (current.indexOf(b.getAttribute('data-c'))!==-1 ? ' active' : '');
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
  var result = data.map(function(item) { return { a: item.a, n: item.n, colors: labels[item.a] || [] }; });
  var blob = new Blob([JSON.stringify(result, null, 2)], {type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a'); a.href=url; a.download='color-labels.json'; a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('btnReset').addEventListener('click', function() {
  if (!confirm('Сбросить всю разметку?')) return;
  labels = {}; saveLabels(); render();
});

render();
`;

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Разметка цвета товаров</title>
<style>${css}</style>
</head>
<body>
<h1>Разметка цвета — товары без категории</h1>
<div class="info">Нажмите цвет под карточкой. Прогресс сохраняется в браузере автоматически. Когда закончите — нажмите «Скачать JSON».</div>
<div class="progress"><div class="progress__bar" id="pbar"></div></div>
<div class="progress__text" id="ptxt">Размечено: 0 / 0</div>
<div class="controls">
  <input type="text" id="search" placeholder="Поиск по названию...">
  <label class="chk"><input type="checkbox" id="hideLabeled"> Скрыть размеченные</label>
</div>
<div class="filter-bar" id="filterBar">
  <button class="filter-btn active" data-f="all">Все</button>
  <button class="filter-btn" data-f="unlabeled">Без цвета</button>
  <button class="filter-btn" data-f="белые/бежевые">Белые/бежевые</button>
  <button class="filter-btn" data-f="зелёные">Зелёные</button>
  <button class="filter-btn" data-f="синие">Синие</button>
  <button class="filter-btn" data-f="голубые">Голубые</button>
  <button class="filter-btn" data-f="красные/оранжевые">Красные/оранжевые</button>
  <button class="filter-btn" data-f="коричневые">Коричневые</button>
  <button class="filter-btn" data-f="жёлтые">Жёлтые</button>
  <button class="filter-btn" data-f="серые">Серые</button>
  <button class="filter-btn" data-f="чёрные">Чёрные</button>
  <button class="filter-btn" data-f="мультицвет">Мультицвет</button>
</div>
<div class="grid" id="grid"></div>
<div class="bottom">
  <button class="btn-save" id="btnDownload">Скачать JSON</button>
  <button class="btn-reset" id="btnReset">Сбросить всё</button>
  <span class="save-info" id="saveInfo"></span>
</div>
<script>${js.replace('DATA_PLACEHOLDER', json)}</script>
</body>
</html>`;

fs.writeFileSync('D:/Ceramica Decor/Сайт/color-review.html', html, 'utf8');
console.log('Done, size:', html.length);
