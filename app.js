'use strict';
const chapterNames={1:'Globalization & international linkages',2:'Politics, law & technology',3:'Ethics, CSR & sustainability',4:'Culture & management'};
const el=id=>document.getElementById(id);
let queue=[],current=null,lastId=null,answered=false;
function shuffle(items){for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items;}
function refill(){
  const concepts=shuffle([...QUESTION_BANK]);
  if(concepts.length>1&&concepts[0].id===lastId)[concepts[0],concepts[1]]=[concepts[1],concepts[0]];
  const truths=shuffle(concepts.map((_,i)=>i%2===0));
  queue=concepts.map((q,i)=>({...q,truth:truths[i],statement:truths[i]?q.t:q.f}));
}
function nextQuestion(focus=false){
  if(!queue.length)refill();
  current=queue.shift();lastId=current.id;answered=false;
  el('chapter').textContent=`Chapter ${current.ch} · ${chapterNames[current.ch]}`;
  el('question').textContent=current.statement;
  el('questionRu').textContent=`(${current.truth?current.tRu:current.fRu})`;
  for(const id of ['trueBtn','falseBtn']){el(id).disabled=false;el(id).className='answer';}
  el('feedback').hidden=true;el('feedback').className='feedback';
  el('termsSection').hidden=true;el('terms').replaceChildren();
  for(const id of ['result','ru','en','source'])el(id).textContent='';
  el('nextBtn').disabled=true;
  el('hint').textContent='Выбери ответ, чтобы увидеть объяснение.';
  if(focus)el('question').focus();
}
function choose(value){
  if(answered||!current)return;
  answered=true;
  for(const [id,v] of [['trueBtn',true],['falseBtn',false]]){
    el(id).disabled=true;
    if(v===current.truth)el(id).classList.add('correct');
    else if(v===value)el(id).classList.add('wrong');
  }
  const correct=value===current.truth;
  el('result').textContent=`${correct?'Correct':'Incorrect'} · Answer: ${current.truth?'True':'False'}`;
  el('ru').textContent=current.ru;el('en').textContent=current.en;
  for(const term of current.terms){
    const name=document.createElement('dt');name.textContent=term.name;
    const definition=document.createElement('dd');definition.textContent=term.definition;
    el('terms').append(name,definition);
  }
  el('termsSection').hidden=current.terms.length===0;
  el('source').textContent=`Source: Chapter ${current.ch} · ${current.source}`;
  el('feedback').className=`feedback ${correct?'ok':'bad'}`;el('feedback').hidden=false;
  el('hint').textContent='Прочитай объяснение и переходи дальше.';
  el('nextBtn').disabled=false;
}
el('trueBtn').addEventListener('click',()=>choose(true));
el('falseBtn').addEventListener('click',()=>choose(false));
el('nextBtn').addEventListener('click',()=>{if(answered)nextQuestion(true);});
document.addEventListener('keydown',event=>{
  if(event.repeat||event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.target.closest('input,textarea,select,[contenteditable],summary,a'))return;
  const key=event.key.toLowerCase();
  if(!answered&&(key==='t'||key==='f')){event.preventDefault();choose(key==='t');}
  else if(answered&&key==='enter'){event.preventDefault();nextQuestion(true);}
});
nextQuestion();
