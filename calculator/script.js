var displayEl = document.getElementById('display');
var historyEl = document.getElementById('history');
var keys = document.querySelectorAll('#keys button');

var current = '0';       // number being typed
var previous = null;     // first number
var operator = null;     // + - * /
var justCalculated = false;

var symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

function updateScreen() {
  displayEl.textContent = current;
  if (operator !== null && previous !== null) {
    historyEl.textContent = previous + ' ' + symbols[operator];
  } else {
    historyEl.textContent = '';
  }
}

function calculate(a, b, op) {
  a = parseFloat(a);
  b = parseFloat(b);
  var result;
  if (op === '+') {
    result = a + b;
  } else if (op === '-') {
    result = a - b;
  } else if (op === '*') {
    result = a * b;
  } else if (op === '/') {
    if (b === 0) { return 'Error'; }
    result = a / b;
  } else {
    return b;
  }
  // round to avoid 0.1 + 0.2 = 0.30000000000000004
  return String(parseFloat(result.toFixed(10)));
}

function inputNumber(n) {
  if (current === 'Error' || justCalculated) {
    current = n;
    justCalculated = false;
  } else if (current === '0') {
    current = n;
  } else if (current.length < 15) {
    current += n;
  }
}

function inputDecimal() {
  if (current === 'Error' || justCalculated) {
    current = '0.';
    justCalculated = false;
  } else if (current.indexOf('.') === -1) {
    current += '.';
  }
}

function chooseOperator(op) {
  if (current === 'Error') { return; }
  if (operator !== null && !justCalculated && previous !== null) {
    // chain: 2 + 3 + ... calculates 2 + 3 first
    previous = calculate(previous, current, operator);
    if (previous === 'Error') {
      current = 'Error'; previous = null; operator = null;
      return;
    }
  } else {
    previous = current;
  }
  operator = op;
  current = previous;
  justCalculated = true;   // next digit starts a new number
}

function equals() {
  if (operator === null || previous === null) { return; }
  var result = calculate(previous, current, operator);
  historyEl.textContent = previous + ' ' + symbols[operator] + ' ' + current + ' =';
  current = result;
  previous = null;
  operator = null;
  justCalculated = true;
  displayEl.textContent = current;
}

function clearAll() {
  current = '0'; previous = null; operator = null; justCalculated = false;
}

function deleteLast() {
  if (current === 'Error' || justCalculated) { clearAll(); return; }
  if (current.length > 1) {
    current = current.slice(0, -1);
    if (current === '-') { current = '0'; }
  } else {
    current = '0';
  }
}

function percent() {
  if (current === 'Error') { return; }
  current = String(parseFloat(current) / 100);
}

function toggleSign() {
  if (current === 'Error' || current === '0') { return; }
  if (current.charAt(0) === '-') {
    current = current.slice(1);
  } else {
    current = '-' + current;
  }
}

function handle(action, value) {
  if (action === 'number') { inputNumber(value); }
  else if (action === 'decimal') { inputDecimal(); }
  else if (action === 'operator') { chooseOperator(value); }
  else if (action === 'equals') { equals(); }
  else if (action === 'clear') { clearAll(); }
  else if (action === 'delete') { deleteLast(); }
  else if (action === 'percent') { percent(); }
  else if (action === 'sign') { toggleSign(); }
  if (action !== 'equals') { updateScreen(); }
}

// loop: attach a click listener to every button
for (var i = 0; i < keys.length; i++) {
  keys[i].addEventListener('click', function () {
    handle(this.dataset.action, this.dataset.value);
  });
}

// keyboard support
document.addEventListener('keydown', function (e) {
  var k = e.key;
  if (k >= '0' && k <= '9') { handle('number', k); }
  else if (k === '.') { handle('decimal'); }
  else if (k === '+' || k === '-' || k === '*' || k === '/') { e.preventDefault(); handle('operator', k); }
  else if (k === 'Enter' || k === '=') { e.preventDefault(); handle('equals'); }
  else if (k === 'Backspace') { handle('delete'); }
  else if (k === 'Escape') { handle('clear'); }
  else if (k === '%') { handle('percent'); }
});

updateScreen();