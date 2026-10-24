import {evaluate,rollD6,flavor} from './rules.mjs';
const $=id=>document.getElementById(id), form=$('form'), count=$('count');
let current=null,history=[];
try{const data=JSON.parse(localStorage.getItem('blades68-harm-history')||sessionStorage.getItem('blades68-harm-history')||'[]');history=data.slice(0,50).map(x=>({...evaluate(x.level,x.dice),time:x.time}));}catch{}
const level=()=>Number(form.elements.level.value);
function sync(){count.min=level();if(Number(count.value)<level())count.value=level();$('minus').disabled=Number(count.value)<=level();$('plus').disabled=Number(count.value)>=100;}
function step(n){count.value=Math.max(level(),Math.min(100,(Number(count.value)||level())+n));sync();}
$('minus').onclick=()=>step(-1);$('plus').onclick=()=>step(1);
form.querySelectorAll('[name=level]').forEach(el=>el.addEventListener('change',sync));count.addEventListener('input',()=>{count.setCustomValidity('');$('minus').disabled=Number(count.value)<=level();$('plus').disabled=Number(count.value)>=100;});
function display(r){current=r;$('result').hidden=false;$('result').dataset.critical=String(r.critical);$('result-label').textContent=r.critical?'КРИТИЧЕСКИЙ БРОСОК':'';$('result-pool').textContent=`${r.dice.length}d6 · уровень ${r.level}`;$('dice').replaceChildren(...r.dice.map(value=>{const el=document.createElement('span');el.className='die'+(value===r.highest?' high':'');el.textContent=value;return el;}));$('result-title').textContent=r.title;$('result-flavor').textContent=flavor[r.title]||'';$('result-text').textContent=r.text;$('copy-status').textContent='';}
function renderHistory(){
 $('history-wrap').hidden=false;$('history-count').textContent=`(${history.length}/50)`;
 $('history-empty').hidden=history.length>0;$('clear').disabled=!history.length;
 $('history').replaceChildren(...history.map(r=>{
 const li=document.createElement('li');const head=document.createElement('strong');head.textContent=r.title;
 const small=document.createElement('small');small.textContent=`${new Date(r.time).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · Уровень ${r.level} · ${r.dice.length}d6: ${r.dice.join(', ')} → ${r.critical?'КРИТ':r.highest}`;
 const prose=document.createElement('p');prose.className='history-flavor';prose.textContent=flavor[r.title]||'';
 const mechanics=document.createElement('p');mechanics.className='history-mechanics';mechanics.textContent=r.text;
 li.append(head,small,prose,mechanics);return li;
 }));
 try{localStorage.setItem('blades68-harm-history',JSON.stringify(history));sessionStorage.removeItem('blades68-harm-history');$('history-storage').textContent='Личная история сохраняется в этом браузере.';}catch{$('history-storage').textContent='Браузер запретил сохранение. История доступна до закрытия панели.';}
}
form.addEventListener('submit',event=>{event.preventDefault();const n=Number(count.value);if(!Number.isInteger(n)||n<level()||n>100){count.setCustomValidity(`Выберите целое число от ${level()} до 100.`);count.reportValidity();return;}const r={...evaluate(level(),Array.from({length:n},()=>rollD6())),time:Date.now()};display(r);history.unshift(r);history=history.slice(0,50);renderHistory();});
$('copy').onclick=async()=>{if(!current)return;try{await navigator.clipboard.writeText(current.text);$('copy-status').textContent='Скопировано';}catch{const range=document.createRange();range.selectNodeContents($('result-text'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('copy-status').textContent='Нажмите Ctrl+C / ⌘C';}};
$('clear').onclick=()=>{history=[];current=null;$('result').hidden=true;renderHistory();};sync();renderHistory();if(history.length)display(history[0]);

const viceOutcomes=[
 {title:'Сорвался с цепи',flavor:'Утро началось с сирены и осколков витрины.',text:'Вы устроили погром или напугали окружающих. Повредите имущество или перепугайте граждан. Ведущий вводит последствия этого поступка в игру.'},
 {title:'Широкий жест',flavor:'Всю ночь шампанское лилось за ваш счёт.',text:'Потратьте ещё 1 монету на роскошный запой.'},
 {title:'Разболтал лишнее',flavor:'Кто-то записал ваши откровения на плёнку.',text:'Команда получает +1 розыск (Heat).'},
 {title:'Непрошеные гости',flavor:'Вы дали кому-то понять, где вас искать.',text:'Получите дополнительную неприятность (entanglement); ведущий вводит её в игру.'},
 {title:'Дверь закрыта',flavor:'Ваш постоянный поставщик больше не берёт трубку.',text:'Ваш поставщик порока отказывает вам. Найдите нового.'},
 {title:'Потерянное время',flavor:'Неон погас. До дел дошли только к вечеру.',text:'Запой занимает одно из ваших действий этой передышки.'}
];
let viceHistory=[];try{viceHistory=JSON.parse(localStorage.getItem('blades68-vice-history')||'[]').filter(x=>Number.isInteger(x.die)&&x.die>=1&&x.die<=6).slice(0,50);}catch{}
function showVice(die){const item=viceOutcomes[die-1];$('vice-result').hidden=false;$('vice-die').replaceChildren();const el=document.createElement('span');el.className='die high';el.textContent=die;$('vice-die').append(el);$('vice-title').textContent=item.title;$('vice-flavor').textContent=item.flavor;$('vice-mechanics').textContent=item.text;$('vice-copy-status').textContent='';}
function renderVice(){ $('vice-history-count').textContent=`(${viceHistory.length}/50)`;$('vice-empty').hidden=viceHistory.length>0;$('vice-clear').disabled=!viceHistory.length;$('vice-history').replaceChildren(...viceHistory.map(x=>{const li=document.createElement('li');li.textContent=`${new Date(x.time).toLocaleString('ru-RU')} · ${x.die} — ${viceOutcomes[x.die-1].title}: ${viceOutcomes[x.die-1].text}`;return li;}));try{localStorage.setItem('blades68-vice-history',JSON.stringify(viceHistory));}catch{}}
$('vice-roll').onclick=()=>{const die=rollD6();showVice(die);viceHistory.unshift({die,time:Date.now()});viceHistory=viceHistory.slice(0,50);renderVice();};
$('vice-copy').onclick=async()=>{try{await navigator.clipboard.writeText($('vice-mechanics').textContent);$('vice-copy-status').textContent='Скопировано';}catch{const range=document.createRange();range.selectNodeContents($('vice-mechanics'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('vice-copy-status').textContent='Нажмите Ctrl+C / ⌘C';}};
$('vice-clear').onclick=()=>{viceHistory=[];$('vice-result').hidden=true;renderVice();};renderVice();if(viceHistory.length)showVice(viceHistory[0].die);
function tab(name){const vice=name==='vice';$('harm-panel').hidden=vice;$('vice-panel').hidden=!vice;for(const [id,active] of [['tab-harm',!vice],['tab-vice',vice]]){$(id).classList.toggle('active',active);$(id).setAttribute('aria-selected',String(active));}try{localStorage.setItem('blades68-active-tab',name);}catch{}}
$('tab-harm').onclick=()=>tab('harm');$('tab-vice').onclick=()=>tab('vice');try{tab(localStorage.getItem('blades68-active-tab')==='vice'?'vice':'harm');}catch{tab('harm');}
