let enterPressed = false;
let lastOperation = null;
let finalCalculation = null;

const toastContainer = document.getElementById('toast-container');
const equal = document.getElementById("equal");
const clear = document.getElementById("clear");
const remove = document.getElementById("remove");
const undo = document.getElementById("undo");
const input = document.getElementById("input");


const input_button = document.querySelectorAll(".input-button");

// initialize EventListener and configuration
document.addEventListener("DOMContentLoaded", function () {

    input_button.forEach((buttonClass) => {
        buttonClass.addEventListener("click", () => procInputKey(buttonClass.value));
    });

    clear.addEventListener("click", () => input.value = "");

    remove.addEventListener("click", () => input.value = input.value.substring(0, input.value.length - 1));

    equal.addEventListener("click", () => procEnterKey());

    undo.addEventListener("click", () => procUndoKey());

    toastContainer.classList.add('toast-container-hidden');
});


function procInputKey(value) {
    if (enterPressed) {
        enterPressed = false;
        lastOperation = null;
        // leave current value if it is only digit and input value is operator.
        if (!(isOnlyDigit(input.value) && isOperator(value))) {
            input.value = "";
        }
    }
    if (checkValidity(value)) {
        input.value += value;
        //console.log(input.value);
    }
}

function procEnterKey() {
    if (!checkValidity("=")) {
        return false;
    }
    // Save last operation for consective enter operation
    if (enterPressed && lastOperation !== null) {
        input.value += lastOperation;
    }
    lastOperation = extractLastOperatorAndNumber(input.value);

    //Adding processing for parenthesis
    if (lastOperation !== null && (lastOperation.includes(')') || lastOperation.includes('('))) lastOperation = null;
    for (let i = hasMatchingParenthesis(input.value); i > 0; i--) {
        input.value += ')';
    }

    enterPressed = true;
    try {
        //console.log(eval("3.*(2+3)+(2*(2+2))"));
        let tmpInput = input.value;
        input.value = eval(input.value);
        finalCalculation = tmpInput;
        if (!isFinite(input.value)) {
            showToast("Error: divide by zero");
            input.value = null;
        }
    }
    catch (error) {
        showToast(error.message);
    }
}

function procUndoKey() {
    if (finalCalculation !== null && (input.value === "" || enterPressed)) {
        input.value = finalCalculation;
        enterPressed = false;
    }
}

function checkValidity(value) {
    let lastChar = input.value.substring(input.value.length - 1);

    switch (value) {
        case '/': case '*': case '+': case '-':
            if (lastChar === "") {
                if (value === "/" || value === "*") {
                    showToast("Invalid format used");
                    //console.log("invalid operation I");
                    return false;
                }
                else {
                    input.value += '(';
                }
            }
            else if (lastChar === "(") {
                if (value === "/" || value === "*") {
                    showToast("Invalid format used");
                    return false;
                }
            }
            else if (isOperator(lastChar)) {
                //replace operator with value
                input.value = input.value.slice(0, -1);
            }
            break;
        case '.':
            let numbers = input.value.split(/[\+\-\*\/\(\)]/);
            if (numbers[numbers.length - 1].includes('.')) {
                //aleady exist '.'
                //console.log("aleady exist '.'");
                return false;
            }
            //console.log(input.value.includes('.'));
            if (lastChar === "" || isOperator(lastChar)) {
                input.value += "0";
            }
            break;
        case '=':
            if (lastChar === "" || lastChar === '(') {
                return false;
            }
            else if (isOperator(lastChar)) {
                showToast("Invalid operation");
                //console.log("invalid operation II");
                return false;
            }
            break;
        case "( )":
            if (lastChar === "" || isOperator(lastChar)) {
                input.value += '(';
            }
            else if (isOnlyDigit(lastChar)) {
                if (hasMatchingParenthesis(input.value) === 0) {
                    input.value += "*(";
                }
                else {
                    input.value += ')';
                }
            }
            return false;
        default:
            if (lastChar === ')') {
                input.value += '*';
            }
            break;
    }

    return true;
}

// Additional tool functions 
//  - checking operators, checking digits and extracting last operation
function isOperator(value) {
    const operators = ['/', '*', '-', '+'];
    return operators.includes(value);
}

function isOnlyDigit(value) {
    return /^[0-9\.]+$/.test(value);
}

function extractLastOperatorAndNumber(str) {
    const operators = ['/', '*', '-', '+'];
    for (let i = str.length - 1; i >= 0; i--) {
        if (operators.includes(str[i])) {
            return str.slice(i);
        }
    }
    return null;
}

function hasMatchingParenthesis(str) {
    const stack = [];

    for (let char of str) {
        if (char === '(') {
            stack.push(char);
        } else if (char === ')') {
            if (stack.length === 0) return -1; // no matching '('
            stack.pop();
        }
    }

    return stack.length; // all '(' were matched with ')'
}

// Showing toast message
let showToastExist = false;
let timeOutId = null;

function showToast(message) {
    const toastElement = document.createElement('div');

    if (showToastExist) {
        //This is the case of recall showToast, while toast popup is active.
        while (toastContainer.firstChild) {
            toastContainer.removeChild(toastContainer.firstChild);
        }
        if (timeOutId !== null) {
            clearTimeout(timeOutId);
            timeOutId = null;
        }
        //console.log("Timer canceled!!");
    }
    toastElement.textContent = message;
    toastElement.className = 'toast';
    toastContainer.appendChild(toastElement);

    toastContainer.classList.remove('toast-container-hidden');
    showToastExist = true;
    timeOutId = setTimeout(() => {
        toastContainer.classList.add('toast-container-hidden');
        toastContainer.removeChild(toastElement);
        showToastExist = false;
    }, 2000); // fade out after 3 seconds
    //console.log(toastContainer);
}