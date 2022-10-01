// Initialize button with user's preferred color
let processButton = document.getElementById("process");
let timeLog = document.getElementById('timeLog');

// chrome.storage.sync.set({'timeLogValue': ''});

// timeLog.addEventListener('change', function() {
//     let timeLogValue = timeLog.value;
//     chrome.storage.sync.set({timeLogValue});
// });

chrome.storage.sync.get(['timeLogValue'], function (result) {
    timeLog.value = result.timeLogValue;
});

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
    chrome.storage.sync.set({timeLogValue: ''}, function() {
        chrome.storage.sync.set({'timeLogValue': timeLogInputValue}, function() {
            console.log('timeLogValue stored in storage');
            window.close();
        });
    });
}

// chrome.storage.sync.get("color", ({ color }) => {
//     document.body.style.backgroundColor = color;
// });