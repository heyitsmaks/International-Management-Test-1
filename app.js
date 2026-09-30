'use strict';
const $=id=>document.getElementById(id);
const concepts=window.REVIEW_CONCEPTS||[];

function norm(s=''){return s.toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function distractors(i,field){
  const same=concepts.map((x,j)=>({x,j})).filter(o=>o.j!==i&&o.x.section===concepts[i].section);
  const pool=same.length>=3?same:concepts.map((x,j)=>({x,j})).filter(o=>o.j!==i);
  return shuffle(pool).slice(0,3).map(o=>o.x[field]);
}
function buildBank(){
  const out=[];
  concepts.forEach((c,i)=>{
    const defs=shuffle([c.def,...distractors(i,'def')]);
    const terms=shuffle([c.term,...distractors(i,'term')]);
    const make=(n,mcq,opts,correct,written)=>({id:`${i}-${n}`,section:c.section,topic:c.term,mcq,options:opts,correct,written,accepted:c.aliases,answer:c.term,ru:c.ru,en:c.en});
    out.push(make(1,`Which description best matches “${c.term}”?`,defs,defs.indexOf(c.def),`Write the term described here: ${c.def}`));
    out.push(make(2,`Which term best matches this description? ${c.def}`,terms,terms.indexOf(c.term),`What concept is described here? ${c.def}`));
    const defs2=shuffle([c.def,...distractors(i,'def')]);
    out.push(make(3,`Choose the most accurate statement about “${c.term}”.`,defs2,defs2.indexOf(c.def),`Recall the concept from this definition: ${c.def}`));
    const terms2=shuffle([c.term,...distractors(i,'term')]);
    out.push(make(4,`Identify the concept: ${c.def}`,terms2,terms2.indexOf(c.term),`Type the matching concept: ${c.def}`));
  });
  return shuffle(out).slice(0,100);
}

let mode='mcq',bank=[],idx=0,score=0,answered=false;

function home(){
  $('home').hidden=false;$('quiz').hidden=true;$('finish').hidden=true;
}
function start(m){
  mode=m;bank=buildBank();idx=0;score=0;
  $('home').hidden=true;$('finish').hidden=true;$('quiz').hidden=false;render();
}
function render(){
  answered=false;
  const q=bank[idx];
  $('section').textContent=q.section;
  $('topic').textContent=q.topic;
  $('progressText').textContent=`Question ${idx+1} / 100`;
  $('scoreText').textContent=`Score: ${score}`;
  $('progressFill').style.width=`${idx+1}%`;
  $('question').textContent=mode==='mcq'?q.mcq:q.written;
  $('feedback').hidden=true;$('nextBtn').hidden=true;
  const area=$('answerArea');area.replaceChildren();
  if(mode==='mcq'){
    q.options.forEach((o,i)=>{
      const b=document.createElement('button');b.className='option';b.textContent=o;
      b.onclick=()=>checkChoice(i,b);area.appendChild(b);
    });
  }else{
    const ta=document.createElement('textarea');ta.id='writtenInput';ta.rows=4;ta.placeholder='Type your answer in English...';
    const b=document.createElement('button');b.className='primary';b.textContent='Check answer';b.onclick=checkWritten;
    area.append(ta,b);setTimeout(()=>ta.focus(),30);
  }
}
function show(ok,user=''){
  const q=bank[idx];answered=true;if(ok)score++;
  $('result').textContent=ok?'Correct':'Not quite';
  $('yourAnswer').hidden=!user;$('yourAnswer').textContent=user?`Your answer: ${user}`:'';
  $('correctAnswer').textContent=`Correct answer: ${q.answer}`;
  $('explanationRu').textContent=q.ru;$('explanationEn').textContent=q.en;
  $('source').textContent='Based on a topic named in the supplied MAN 4602 study guide; explanation is generated review wording.';
  $('feedback').className=`feedback ${ok?'good':'bad'}`;$('feedback').hidden=false;
  $('nextBtn').hidden=false;$('scoreText').textContent=`Score: ${score}`;
}
function checkChoice(choice){
  if(answered)return;const q=bank[idx];const buttons=[...document.querySelectorAll('.option')];
  buttons.forEach((b,i)=>{b.disabled=true;if(i===q.correct)b.classList.add('correct');if(i===choice&&i!==q.correct)b.classList.add('wrong');});
  show(choice===q.correct);
}
function checkWritten(){
  if(answered)return;const ta=$('writtenInput');const raw=ta.value.trim();if(!raw)return;
  const a=norm(raw);const q=bank[idx];
  const ok=(q.accepted||[]).some(x=>{const n=norm(x);return a===n||a.includes(n)||n.includes(a);});
  ta.disabled=true;show(ok,raw);
}
$('mcqMode').onclick=()=>start('mcq');
$('writtenMode').onclick=()=>start('written');
$('homeBtn').onclick=home;
$('nextBtn').onclick=()=>{if(!answered)return;if(idx===99){$('quiz').hidden=true;$('finish').hidden=false;$('finalScore').textContent=`${score} / 100`;}else{idx++;render();}};
$('restartBtn').onclick=home;
home();
