import {evaluate,rollD6,flavor} from './rules.mjs';
const $=id=>document.getElementById(id), form=$('form'), count=$('count');
let current=null,history=[];
try{const data=JSON.parse(localStorage.getItem('blades68-harm-history')||sessionStorage.getItem('blades68-harm-history')||'[]');history=data.slice(0,50).map(x=>({...evaluate(x.level,x.dice),time:x.time}));}catch{}
const level=()=>Number(form.elements.level.value);
function sync(){count.min=level();if(Number(count.value)<level())count.value=level();$('minus').disabled=Number(count.value)<=level();$('plus').disabled=Number(count.value)>=100;}
function step(n){count.value=Math.max(level(),Math.min(100,(Number(count.value)||level())+n));sync();}
$('minus').onclick=()=>step(-1);$('plus').onclick=()=>step(1);
form.querySelectorAll('[name=level]').forEach(el=>el.addEventListener('change',sync));count.addEventListener('input',()=>{count.setCustomValidity('');$('minus').disabled=Number(count.value)<=level();$('plus').disabled=Number(count.value)>=100;});
function display(r){current=r;$('result').hidden=false;$('result').dataset.critical=String(r.critical);$('result-label').textContent=r.critical?'КРИТИЧЕСКИЙ РЕЗУЛЬТАТ':`РЕЗУЛЬТАТ: ${r.highest}`;$('result-pool').textContent=`${r.dice.length}d6 · уровень ${r.level}`;$('dice').replaceChildren(...r.dice.map(value=>{const el=document.createElement('span');el.className='die'+(value===r.highest?' high':'');el.textContent=value;return el;}));$('result-title').textContent=r.title;$('result-flavor').textContent=flavor[r.title]||'';$('result-text').textContent=r.text;$('copy-status').textContent='';}
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
$('copy').onclick=async()=>{if(!current)return;const r=current;const text=`Осложнения травм · Blades ’68 + Deep Cuts\nМаксимальная травма: ${r.level}. Пул: ${r.dice.length}d6.\nКубы: ${r.dice.join(', ')} → ${r.critical?'КРИТ':r.highest}\n${r.title}: ${r.text}`;try{await navigator.clipboard.writeText(text);$('copy-status').textContent='Скопировано';}catch{const range=document.createRange();range.selectNodeContents($('result'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('copy-status').textContent='Нажмите Ctrl+C / ⌘C';}};
$('clear').onclick=()=>{history=[];current=null;$('result').hidden=true;renderHistory();};sync();renderHistory();if(history.length)display(history[0]);
