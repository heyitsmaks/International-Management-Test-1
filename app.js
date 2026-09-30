'use strict';

const $ = (id) => document.getElementById(id);
const bank = window.QUESTION_BANK || [];

let mode = 'mcq';
let order = [];
let index = 0;
let answered = false;
let correctCount = 0;

function normalize(s='') {
  return s.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function start(newMode) {
  mode = newMode;
  order = shuffled(bank.map((_, i) => i));
  index = 0;
  correctCount = 0;
  $('home').hidden = true;
  $('quiz').hidden = false;
  render();
}

function current() {
  return bank[order[index]];
}

function setProgress() {
  $('progressText').textContent = `Question ${index + 1} / ${order.length}`;
  $('scoreText').textContent = `Score: ${correctCount}`;
  $('progressFill').style.width = `${((index + 1) / order.length) * 100}%`;
}

function render() {
  answered = false;
  const q = current();
  setProgress();

  $('section').textContent = q.section;
  $('topic').textContent = q.topic;
  $('question').textContent = mode === 'mcq' ? q.mcq : q.written;
  $('feedback').hidden = true;
  $('feedback').className = 'feedback';
  $('nextBtn').hidden = true;
  $('answerArea').replaceChildren();

  if (mode === 'mcq') {
    q.options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.className = 'option';
      b.textContent = opt;
      b.addEventListener('click', () => checkMCQ(i, b));
      $('answerArea').appendChild(b);
    });
  } else {
    const input = document.createElement('textarea');
    input.id = 'writtenInput';
    input.rows = 4;
    input.placeholder = 'Type your answer in English...';
    input.autocomplete = 'off';

    const check = document.createElement('button');
    check.className = 'primary';
    check.textContent = 'Check answer';
    check.addEventListener('click', checkWritten);

    $('answerArea').append(input, check);
    setTimeout(() => input.focus(), 50);
  }
}

function showFeedback(isCorrect, userText='') {
  const q = current();
  if (isCorrect) correctCount++;
  answered = true;

  $('result').textContent = isCorrect ? 'Correct' : 'Not quite';
  $('correctAnswer').textContent = `Correct answer: ${q.answer}`;
  $('explanationRu').textContent = q.ru;
  $('explanationEn').textContent = q.en;
  $('source').textContent = q.source ? `Basis: ${q.source}` : '';

  if (mode === 'written' && userText) {
    $('yourAnswer').textContent = `Your answer: ${userText}`;
    $('yourAnswer').hidden = false;
  } else {
    $('yourAnswer').hidden = true;
  }

  $('feedback').className = `feedback ${isCorrect ? 'good' : 'bad'}`;
  $('feedback').hidden = false;
  $('nextBtn').hidden = false;
  $('scoreText').textContent = `Score: ${correctCount}`;
}

function checkMCQ(choice, clicked) {
  if (answered) return;
  const q = current();
  const buttons = [...document.querySelectorAll('.option')];
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === q.correct) b.classList.add('correct');
    if (i === choice && i !== q.correct) b.classList.add('wrong');
  });
  showFeedback(choice === q.correct);
}

function checkWritten() {
  if (answered) return;
  const q = current();
  const raw = $('writtenInput').value.trim();
  if (!raw) return;

  const a = normalize(raw);
  const matches = (q.accepted || []).some(x => {
    const n = normalize(x);
    return a === n || a.includes(n) || n.includes(a);
  });

  $('writtenInput').disabled = true;
  document.querySelector('#answerArea .primary').disabled = true;
  showFeedback(matches, raw);
}

$('mcqMode').addEventListener('click', () => start('mcq'));
$('writtenMode').addEventListener('click', () => start('written'));
$('nextBtn').addEventListener('click', () => {
  if (!answered) return;
  if (index + 1 >= order.length) {
    $('quiz').hidden = true;
    $('finish').hidden = false;
    $('finalScore').textContent = `${correctCount} / ${order.length}`;
  } else {
    index++;
    render();
  }
});
$('restartBtn').addEventListener('click', () => {
  $('finish').hidden = true;
  $('home').hidden = false;
});
$('homeBtn').addEventListener('click', () => {
  $('quiz').hidden = true;
  $('home').hidden = false;
});
