// Initialize button with user's preferred color
let processButton = document.getElementById("process");
let timeLog = document.getElementById('timeLog');
let issueListInput = document.getElementById('issueList');
let durationInMinutes = document.getElementById('durationInMinutes');
let workLogDescriptionInput = document.getElementById('workLogDescription');
let submitGenerate = document.getElementById('generate');
let generatedOutput = document.getElementById('generated');

workLogDescriptionInput.addEventListener('change', function() {
    let workLogDescriptionValue = workLogDescriptionInput.value;
    chrome.storage.sync.set({ workLogDescriptionValue });
})

durationInMinutes.addEventListener('change', function() {
    let durationInMinutesValue = durationInMinutes.value;
    chrome.storage.sync.set({ durationInMinutesValue });
});

issueListInput.addEventListener('change', function() {
    let issueListValue = issueListInput.value;
    chrome.storage.sync.set({ issueListValue });
});

chrome.storage.sync.get(['timeLogValue', 'issueListValue', 'durationInMinutesValue', 'workLogDescriptionValue'], function (result) {
    timeLog.value = result.timeLogValue;
    issueListInput.innerHTML = result.issueListValue;
    durationInMinutes.value = result.durationInMinutesValue;
    workLogDescriptionInput.value = result.workLogDescriptionValue;
});

submitGenerate.addEventListener('click', function() {
    let issueListValue = issueListInput.value;
    let durationInMinutesValue = durationInMinutes.value;
    let workLogDescriptionValue = workLogDescriptionInput.value;

    let issueList = issueListValue.split('\n');
    let issueCount = issueList.length;

    let equalMinutes = Math.floor(parseInt(durationInMinutesValue) / issueCount);
    let remainderMinutes = parseInt(durationInMinutesValue) % issueCount;

    let issueDuration = [];

    for(let i = 0; i < issueList.length; i++) {
        issueDuration[issueList[i]] = equalMinutes;
    }

     while(remainderMinutes > 0) {
        for (let i = 0; i < issueList.length; i++) {
            if (remainderMinutes > 0) {
                issueDuration[issueList[i]] += 1;

                remainderMinutes--;
            }
        }
     }

    let issues = Object.keys(issueDuration);
    let output = '';

    for(const issue of issues) {
        let minutes = issueDuration[issue];

        if(minutes > 0) {
            if(minutes < 10) {
                minutes = '0' + minutes;
            }

            output += '10:00 - 10:' + minutes + ' - ' + issue + ' - ' + workLogDescriptionValue + '\n\n';
        }
    }

    generatedOutput.innerHTML = output;
});

processButton.addEventListener("click", async () => {
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