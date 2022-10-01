let issueCodeOverrides = document.getElementById('issueCodeOverrides');
let submitIssueCodeOverrides = document.getElementById('submitIssueCodeOverrides');
let defaultWorkLogDescription = document.getElementById('defaultWorkLogDescription');
let submitDefaultWorkLogDescription = document.getElementById('submitDefaultWorkLogDescription');

submitDefaultWorkLogDescription.addEventListener('click', function() {
    let defaultWorkLogDescriptionValue = defaultWorkLogDescription.value;
    chrome.storage.sync.set({defaultWorkLogDescriptionValue});
    alert('Default work log description stored.');
});

submitIssueCodeOverrides.addEventListener('click', function () {
    if(syntaxCheckIssueCodeOverrides()) {
        let issueCodeOverridesValues = issueCodeOverrides.value;
        chrome.storage.sync.set({issueCodeOverridesValues});
        alert('Overrides stored');
    }
});

chrome.storage.sync.get(['issueCodeOverridesValues', 'defaultWorkLogDescriptionValue'], function(result) {
    issueCodeOverrides.innerHTML = result.issueCodeOverridesValues;
    defaultWorkLogDescription.innerHTML = result.defaultWorkLogDescriptionValue;
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