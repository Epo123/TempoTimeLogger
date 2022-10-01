// Initialize button with user's preferred color
let processButton = document.getElementById("process");
let timeLog = document.getElementById('timeLog');
let autoLog = document.getElementById('autoLog');

// chrome.storage.sync.set({'timeLogValue': ''});

// timeLog.addEventListener('change', function() {
//     let timeLogValue = timeLog.value;
//     chrome.storage.sync.set({timeLogValue});
// });

autoLog.addEventListener('change', function() {
    let autoLogValue = autoLog.checked;
    chrome.storage.sync.set({autoLogValue});
})

chrome.storage.sync.get(['timeLogValue', 'autoLogValue'], function (result) {
    timeLog.value = result.timeLogValue;
    autoLog.checked = result.autoLogValue;
});

// TODO: Set correct default values in 'onInstalled'
// TODO: Allow for different formats (issue code first, then time start + end + message
// TODO: Allow hours minutes separated by . instead of : also with -  ( configurable )

// When the button is clicked, inject setPageBackgroundColor into current page
processButton.addEventListener("click", async () => {
    // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     func: checkCanProcess,
    // });

    processTimeLog();
});

// The body of this function will be executed as a content script inside the
// current page
function processTimeLog() {
    let timeLogInputValue = timeLog.value;
    chrome.storage.sync.get(['timeLogValue'], function(result) {
        if (timeLogInputValue === result.timeLogValue) {
            alert('Please update the input field before pressing the Process button');
        } else {
            chrome.storage.sync.set({'timeLogValue': timeLogInputValue}, function() {
                console.log('timeLogValue stored in storage');

                window.close();
            });
        }
    });
}

// chrome.storage.sync.get("color", ({ color }) => {
//     document.body.style.backgroundColor = color;
// });