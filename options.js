let issueCodeOverrides = document.getElementById('issueCodeOverrides');
let submitIssueCodeOverrides = document.getElementById('submitIssueCodeOverrides');
let defaultWorkLogDescription = document.getElementById('defaultWorkLogDescription');
let submitDefaultWorkLogDescription = document.getElementById('submitDefaultWorkLogDescription');
let workLogOrderSubmit = document.getElementById('submitWorkLogOrder');
let timeSeparatorSubmit = document.getElementById('submitTimeSeparator');
let elementSeparatorSubmit = document.getElementById('submitElementSeparator');
let jiraUrlPartInput = document.getElementById('jiraUrlPart');
let submitJiraUrlPart = document.getElementById('submitJiraUrlPart');

submitJiraUrlPart.addEventListener('click', function() {
    let jiraUrlPart = jiraUrlPartInput.value;
    chrome.storage.sync.set({ jiraUrlPart }, function() {
        alert('Jira url part set, requests will be sent to ' + 'https://jira.' + jiraUrlPart + '.com please make sure this matches.')
    });
});

submitDefaultWorkLogDescription.addEventListener('click', function() {
    let defaultWorkLogDescriptionValue = defaultWorkLogDescription.value;
    chrome.storage.sync.set({ defaultWorkLogDescriptionValue }, function() {
        alert('Default work log description stored.');
    });
});

submitIssueCodeOverrides.addEventListener('click', function() {
    if(syntaxCheckIssueCodeOverrides()) {
        let issueCodeOverridesValues = issueCodeOverrides.value;
        chrome.storage.sync.set({ issueCodeOverridesValues }, function() {
            alert('Overrides stored');
        });
    }
});

workLogOrderSubmit.addEventListener('click', function() {
    let workLogOrder = document.querySelector('input[name="workLogOrder"]:checked');
    let workLogOrderValue = workLogOrder.value;
    chrome.storage.sync.set({ workLogOrderValue }, function() {
        alert('Work Log order stored.');
    });
});

timeSeparatorSubmit.addEventListener('click', function() {
    let timeSeparator = document.querySelector('input[name="timeSeparator"]:checked');
    let timeSeparatorValue = timeSeparator.value;
    chrome.storage.sync.set({ timeSeparatorValue }, function() {
        alert('Time Separator stored');
    });
});

elementSeparatorSubmit.addEventListener('click', function() {
    let elementSeparator = document.querySelector('input[name="elementSeparator"]:checked');
    let elementSeparatorValue = elementSeparator.value;
    chrome.storage.sync.set({ elementSeparatorValue }, function() {
        alert('Element Separator stored.');
        chrome.storage.sync.get(['issueCodeOverridesValues', 'defaultWorkLogDescriptionValue', 'workLogOrderValue', 'timeSeparatorValue', 'elementSeparatorValue'], function(result) {
            console.log(result);
        });
    });
});

chrome.storage.sync.get(['issueCodeOverridesValues', 'defaultWorkLogDescriptionValue', 'workLogOrderValue', 'timeSeparatorValue', 'elementSeparatorValue', 'jiraUrlPart'], function(result) {
    issueCodeOverrides.innerHTML = result.issueCodeOverridesValues;
    defaultWorkLogDescription.innerHTML = result.defaultWorkLogDescriptionValue;
    jiraUrlPartInput.value = result.jiraUrlPart;

    document.getElementById(result.workLogOrderValue).checked = true;
    document.getElementById(result.timeSeparatorValue).checked = true;
    document.getElementById(result.elementSeparatorValue).checked = true;

    let timeSeparator = ':';
    let elementSeparator = '-';
    if (result.timeSeparatorValue !== 'colonTimeSeparator') {
        timeSeparator = '.';
    }
    if(result.elementSeparatorValue !== 'dashElementSeparator') {
        elementSeparator = '/';
    }

    let exampleFormatTimes = '10' + timeSeparator + '00 ' + elementSeparator + ' 10' + timeSeparator + '30';
    let exampleFormatText = '';
    if (result.workLogOrderValue === 'startEndIssueCode') {
        exampleFormatText = exampleFormatTimes + ' ' + elementSeparator + ' ISSUE-123 ' + elementSeparator + ' message';
    } else {
        exampleFormatText = 'ISSUE-123 ' + elementSeparator + ' ' + exampleFormatTimes + ' ' + elementSeparator + ' message';
    }

    let exampleFormatSpan = document.getElementById('exampleFormat');
    exampleFormatSpan.innerText = exampleFormatText;
});

function syntaxCheckIssueCodeOverrides() {
    let issueCodeOverridesValue = issueCodeOverrides.value;

    let issueCodeOverrideLines = issueCodeOverridesValue.split('\n');

    for(let i = 0; i < issueCodeOverrideLines.length; i++) {
        let issueCodeOverride = issueCodeOverrideLines[i].split(':');

        if (issueCodeOverride.length !== 2) {
            alert('Unable to save the overrides, found a line does not have 2 elements. Please use a colon to split the overrides. Make sure there are no empty lines.')
            return false;
        }
    }
    return true;
}

// Reacts to a button click by marking the selected button and saving
// the selection
function handleButtonClick(event) {
    // Remove styling from the previously selected color
    // let current = event.target.parentElement.querySelector(
    //     `.${selectedClassName}`
    // );
    // if (current && current !== event.target) {
    //     current.classList.remove(selectedClassName);
    // }
    //
    // // Mark the button as selected
    // let color = event.target.dataset.color;
    // event.target.classList.add(selectedClassName);
    // chrome.storage.sync.set({ color });
}

// Add a button to the page for each supplied color
function constructOptions(buttonColors) {
    // chrome.storage.sync.get("color", (data) => {
    //     let currentColor = data.color;
    //     // For each color we were provided…
    //     for (let buttonColor of buttonColors) {
    //         // …create a button with that color…
    //         let button = document.createElement("button");
    //         button.dataset.color = buttonColor;
    //         button.style.backgroundColor = buttonColor;
    //
    //         // …mark the currently selected color…
    //         if (buttonColor === currentColor) {
    //             button.classList.add(selectedClassName);
    //         }
    //
    //         // …and register a listener for when that button is clicked
    //         // button.addEventListener("click", handleButtonClick);
    //         // page.appendChild(button);
    //     }
    // });
}

// Initialize the page by constructing the color options
// constructOptions(presetButtonColors);