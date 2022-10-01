chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
        if (key === 'timeLogValue' && newValue !== '') {
            prepareCombinedLogs();
        }
    }
});

function prepareCombinedLogs() {
    let workLogFrame = document.querySelector("iframe[src^='/secure/GlobalWorklogDialog.jspa']");

    let workLogForm = workLogFrame.contentWindow.document.getElementById('worklogForm');

    if (!workLogForm) {
        alert('Please open the Log Time window (press \'w\')');
        return;
    }

    chrome.storage.sync.get(['timeLogValue', 'issueCodeOverridesValues', 'defaultWorkLogDescriptionValue'], function (result) {
        let report = getReport(result.timeLogValue, result.issueCodeOverridesValues);

        let timeCardGroupAndSorter = new TimeCardGroupAndSorter();
        let groupedReport = timeCardGroupAndSorter.groupAndSort(report);
        let issueCodes = timeCardGroupAndSorter.getIssueCodes(report);

        setupWorkLogBlocks(groupedReport, issueCodes, workLogForm, result.defaultWorkLogDescriptionValue);

        setupWorkLogHeaderBlock(groupedReport, issueCodes, workLogForm);
    });
}

function setupWorkLogHeaderBlock(groupedReport, issueCodes, workLogForm) {
    let totalDuration = 0;
    let workLogFrame = document.querySelector("iframe[src^='/secure/GlobalWorklogDialog.jspa']");

    for(let i = 0; i < issueCodes.length; i++) {
        let issueCode = issueCodes[i];

        for(let j = 0; j < groupedReport[issueCode].length; j++) {
            let timeCard = groupedReport[issueCode][j];

            let {diffHours, diffMinutes, diffJiraMinutes, diffSeconds} = getDurationVariables(timeCard.startTime, timeCard.endTime);

            totalDuration += parseFloat(diffHours + '.' + diffJiraMinutes);
        }
    }

    let headerBlockHtml = 'Total duration: ' + totalDuration + '<div class="sc-iwsKbI dVrytV"><button class="sc-iELTvK dSVjNn" height="default" type="button" id="submitAll"><span class="sc-cmTdod exoBPf"><span class="sc-jwKygS cWUQDR">Log all</span></span></button></div><div class="sc-gJWqzi IWPGt" type="default"></div><span style="position: relative; top: -10px;"><hr class="sc-laTMn dLgYsV"></span>';

    workLogForm.querySelector('header').insertAdjacentHTML('afterend', headerBlockHtml);

    let logAllButton = workLogFrame.contentWindow.document.getElementById('submitAll');

    logAllButton.dataset.issueCodes = JSON.stringify(issueCodes);

    logAllButton.addEventListener('click', submitAllTimeLogs);
}

function setupWorkLogBlocks(groupedReport, issueCodes, workLogForm, defaultWorkLogDescriptionValue) {
    let workLogFrame = document.querySelector("iframe[src^='/secure/GlobalWorklogDialog.jspa']");

    for(let i = 0; i < issueCodes.length; i++) {
        let issueCode = issueCodes[i];
        let duplicateHeaderMessage = [];
        let finalCharacters = ' & ';
        let totalDurationInSeconds = 0;
        let totalDuration = 0;
        let completeDescription = '';

        for(let j = 0; j < groupedReport[issueCode].length; j++) {
            let timeCard = groupedReport[issueCode][j];
            if (timeCard.headerMessage !== '') {
                if (!duplicateHeaderMessage.includes(timeCard.headerMessage)) {
                    duplicateHeaderMessage.push(timeCard.headerMessage);
                    completeDescription += (timeCard.headerMessage + finalCharacters);
                }
            }

            let {diffHours, diffMinutes, diffJiraMinutes, diffSeconds} = getDurationVariables(timeCard.startTime, timeCard.endTime);

            totalDuration += parseFloat(diffHours + '.' + diffJiraMinutes);
            totalDurationInSeconds += diffSeconds;
        }

        if (completeDescription.slice(-finalCharacters.length) === finalCharacters) {
            completeDescription = completeDescription.slice(0, -finalCharacters.length);
        }

        if (completeDescription === "") {
            completeDescription = defaultWorkLogDescriptionValue + issueCode;
        }

        let issueCodeInputHtml = '<input value="' + issueCode + ': " id="issueCode' + issueCode + '" type="text" width="100%" height="auto" autocomplete="off" style="overflow-wrap: break-word;" class="sc-TOsTZ jTRkRQ sc-gojNiO blRVhp" disabled><div class="sc-gJWqzi IWPGt" type="default"></div>';

        let workLogDescriptionInputHtml = '<textarea rows="5" id="workLogDescription' + issueCode + '" width="100%" class="sc-cJSrbW fjRQxI" style="overflow-x: hidden; overflow-wrap: break-word; height: auto; min-height: 80px">' + completeDescription + '</textarea><div class="sc-gJWqzi IWPGt" type="default"></div>';

        let totalDurationHtml = 'Total duration: ' + totalDuration;

        let logTimeButtonHtml = '<div class="sc-iwsKbI dVrytV"><button class="sc-iELTvK dSVjNn" height="default" type="button" id="submit' + issueCode + '"><span class="sc-cmTdod exoBPf"><span class="sc-jwKygS cWUQDR">Log Time</span></span></button></div><div class="sc-gJWqzi IWPGt" type="default"></div><span style="position: relative; top: -10px;"><hr class="sc-laTMn dLgYsV"></span>';

        let workLogInputHtml = issueCodeInputHtml + workLogDescriptionInputHtml + totalDurationHtml + logTimeButtonHtml;

        workLogForm.querySelector('header').insertAdjacentHTML('afterend', workLogInputHtml);

        let issueCodeInput = workLogForm.querySelector('#issueCode' + issueCode);

        let logTimeButton = workLogFrame.contentWindow.document.getElementById('submit' + issueCode);

        logTimeButton.addEventListener('click', submitTimeLog);
        logTimeButton.issueCode = issueCode;

        issueCodeInput.dataset.durationSeconds = '' + totalDurationInSeconds;

        searchIssueApi(issueCode);
    }
}

function searchIssueApi(issueCode) {
    let searchUrl = 'https://jira.youweagency.com/rest/api/2/search/';

    let xhrSearch = new XMLHttpRequest();

    xhrSearch.onreadystatechange = function () {
        if (this.readyState !== 4) return;

        if (this.status === 200) {
            let data = JSON.parse(this.responseText);

            let issueId = data.issues[0].id;

            let workLogFrame = document.querySelector("iframe[src^='/secure/GlobalWorklogDialog.jspa']");

            let issueCodeInput = workLogFrame.contentWindow.document.getElementById('issueCode' + issueCode);

            issueCodeInput.value = issueCodeInput.value + data.issues[0].fields.summary;

            issueCodeInput.dataset.issueId = issueId;
        }
    }

    xhrSearch.open('POST', searchUrl, true);
    xhrSearch.setRequestHeader('Content-Type', 'application/json');
    xhrSearch.send(JSON.stringify({
        jql: 'issue in(\"' + issueCode + '\")',
        fields: ['issuetype', 'summary'],
        maxResults: 1,
        startAt: 0
    }));
}

function submitAllTimeLogs(event) {
    let workLogFrame = document.querySelector("iframe[src^='/secure/GlobalWorklogDialog.jspa']");

    let logAllButton = workLogFrame.contentWindow.document.getElementById('submitAll');

    let issueCodes = JSON.parse(logAllButton.dataset.issueCodes);
    for(let i = 0; i < issueCodes.length; i++) {
        submitIssueTimeLog(issueCodes[i]);
    }
    logAllButton.innerHTML = '<span class="sc-cmTdod exoBPf"><span class="sc-jwKygS cWUQDR">Logged!</span></span>';
    logAllButton.setAttribute('disabled', '');
}

function submitIssueTimeLog(issueCode) {
    let submitUrl = 'https://jira.youweagency.com/rest/tempo-timesheets/4/worklogs/';

    let xhr = new XMLHttpRequest();

    let worker = document.head.querySelector('meta[name="ajs-tempo-user-key"]').content;

    let workLogFrame = document.querySelector("iframe[src^='/secure/GlobalWorklogDialog.jspa']");

    let submitButton = workLogFrame.contentWindow.document.getElementById('submit' + issueCode);

    xhr.onreadystatechange = function () {
        if (this.readyState !== 4) return;

        if (this.status === 200) {
            let data = JSON.parse(this.responseText);

            submitButton.setAttribute('disabled', '');
            submitButton.innerHTML = '<span class="sc-cmTdod exoBPf"><span class="sc-jwKygS cWUQDR">Logged!</span></span>';
        }
    }

    let commentInput = workLogFrame.contentWindow.document.getElementById('workLogDescription' + issueCode);
    let issueCodeInput = workLogFrame.contentWindow.document.getElementById('issueCode' + issueCode);
    let issueId = issueCodeInput.dataset.issueId;

    let selectedDateInput = workLogFrame.contentWindow.document.getElementById('started');
    let selectedDate = new Date(selectedDateInput.value);

    let selectedDay = selectedDate.getDate();
    if (selectedDay < 10) {
        selectedDay = '0' + selectedDay;
    }
    let selectedMonth = selectedDate.getMonth() + 1;
    if (selectedMonth < 10) {
        selectedMonth = '0' + selectedMonth;
    }
    let selectedYear = selectedDate.getFullYear();

    xhr.open('POST', submitUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        attributes: {},
        billableSeconds: null,
        worker: worker,
        comment: commentInput.value,
        started: selectedYear + '-' + selectedMonth + '-' + selectedDay,
        timeSpentSeconds: issueCodeInput.dataset.durationSeconds,
        originTaskId: parseInt(issueId),
        remainingEstimate: 0,
        endDate: null,
        includeNonWorkingDays: false
    }));
}

function submitTimeLog(event) {
    let issueCode = event.currentTarget.issueCode;

    submitIssueTimeLog(issueCode);
}

function getReport(timeLogValue, issueCodeOverridesValues) {
    let timeCardBuilder = new TimeCardBuilder();
    timeCardBuilder.setissueCodeOverridesValues(issueCodeOverridesValues);

    let reportToSort = [];

    let timeLogLines = timeLogValue.split('\n');

    for (let i = 0; i < timeLogLines.length; i++) {
        timeCardBuilder.addLine(timeLogLines[i]);
        if (timeCardBuilder.isCardComplete) {
            reportToSort.push(timeCardBuilder.currentTimeCard);
            timeCardBuilder.clearContent();
        }
    }
    if (timeCardBuilder.nextTimeCard != null) {
        reportToSort.push(timeCardBuilder.nextTimeCard);
    }

    return reportToSort;
}

function getDurationVariables(startTimeString, endTimeString) {
    let startTime = new Date('1970/01/01 ' + startTimeString);
    let endTime = new Date('1970/01/01 ' + endTimeString);
    let diffMs = (endTime - startTime);

    let diffHours = Math.floor((diffMs % 86400000) / 3600000);
    let diffMinutes = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    let diffJiraMinutes = Math.round((diffMinutes / 60) * 100);
    let diffSeconds = Math.abs(diffMs / 1000);
    return {diffHours, diffMinutes, diffJiraMinutes, diffSeconds};
}

class TimeCard {
    startTime = '';
    endTime = '';
    issueCode = '';
    headerMessage = '';
    content = '';
    headerIsSet = false;

    setStartTime(startTime) {
        this.startTime = startTime;
    }

    setEndTime(endTime) {
        this.endTime = endTime;
    }

    setIssueCode(issueCode) {
        this.issueCode = issueCode;
    }

    setHeaderMessage(headerMessage) {
        this.headerMessage = headerMessage;
    }

    addLine(line) {
        this.content += line + '\n';
    }

    setHeaderIsSet() {
        this.headerIsSet = true;
    }

    getDuration() {
        let {diffHours, diffMinutes, diffJiraMinutes} = getDurationVariables(this.startTime, this.endTime);

        return diffHours + '.' + diffJiraMinutes + ' - ' + diffHours + ':' + diffMinutes;
    }

    getDurationInJiraMinutes() {
        let {diffHours, diffMinutes, diffJiraMinutes} = getDurationVariables(this.startTime, this.endTime);

        return diffHours + '.' + diffJiraMinutes;
    }
}

class TimeCardHeaderBuilder {
    issueCodeHeaderWithMessageRegex = '^(?<startTime>\\d+:\\d+)(?:\\s*)-(?:\\s*)(?<endTime>\\d+:\\d+)(?:\\s*)-(?:\\s*)(?<issueCode>[A-Za-z]+\\d*-\\d+)(?:\\s*)-(?:\\s*)(?<message>.+)';
    issueCodeHeaderRegex = '^(?<startTime>\\d+:\\d+)(?:\\s*)-(?:\\s*)(?<endTime>\\d+:\\d+)(?:\\s*)-(?:\\s*)(?<issueCode>[A-Za-z0-9]+\\d*-\\d+)';
    timeCardHeaderRegex = '^(?<startTime>\\d+:\\d+)(?:\\s*)-(?:\\s*)(?<endTime>\\d+:\\d+)';
    issueCodeOverridesValues = [];

    setIssueCodeOverridesValues(issueCodeOverridesValues) {
        let issueCodeOverridesValueLines = issueCodeOverridesValues.split('\n');
        let newIssueCodeOverridesValues = [];

        for (let i = 0; i < issueCodeOverridesValueLines.length; i++) {
            newIssueCodeOverridesValues.push(issueCodeOverridesValueLines[i].split(':'));
        }

        this.issueCodeOverridesValues = newIssueCodeOverridesValues;
    }

    build(input) {
        if (this.isIssueCodeHeaderWithMessage(input)) {
            return this.createIssueCodeHeaderWithMessageTimeCard(input);
        }
        if (this.isIssueCodeHeader(input)) {
            return this.createIssueCodeHeaderTimeCard(input);
        }
        if (this.isTimeCardHeader(input)) {
            return this.createTimeCardHeader(input);
        }
        return false;
    }

    isIssueCodeHeaderWithMessage(input) {
        let matches = input.match(this.issueCodeHeaderWithMessageRegex);
        if (matches) {
            return true;
        }
        return false;
    }

    getReplacedIssueCode(match) {
        for (let i = 0; i < this.issueCodeOverridesValues.length; i++) {
            if (this.issueCodeOverridesValues[i][0] === match) {
                return this.issueCodeOverridesValues[i][1];
            }
        }
        return match;
    }

    createIssueCodeHeaderWithMessageTimeCard(input) {
        let timeCard = new TimeCard();
        let matches = input.match(this.issueCodeHeaderWithMessageRegex);
        timeCard.setStartTime(matches[1]);
        timeCard.setEndTime(matches[2]);
        timeCard.setIssueCode(this.getReplacedIssueCode(matches[3]));
        timeCard.setHeaderMessage(matches[4]);

        timeCard.setHeaderIsSet();

        return timeCard;
    }

    isIssueCodeHeader(input) {
        let matches = input.match(this.issueCodeHeaderRegex);
        if (matches) {
            return true;
        }
        return false;
    }

    createIssueCodeHeaderTimeCard(input) {
        let timeCard = new TimeCard();
        let matches = input.match(this.issueCodeHeaderRegex);
        timeCard.setStartTime(matches[1]);
        timeCard.setEndTime(matches[2]);
        timeCard.setIssueCode(this.getReplacedIssueCode(matches[3]));

        timeCard.setHeaderIsSet();

        return timeCard;
    }

    isTimeCardHeader(input) {
        let matches = input.match(this.timeCardHeaderRegex);
        if (matches) {
            return true;
        }
        return false;
    }

    createTimeCardHeader(input) {
        let timeCard = new TimeCard();
        let matches = input.match(this.timeCardHeaderRegex);
        timeCard.setStartTime(matches[1]);
        timeCard.setEndTime(matches[2]);

        timeCard.setHeaderIsSet();

        return timeCard;
    }
}

class TimeCardBuilder {
    timeCardHeaderBuilder = new TimeCardHeaderBuilder();
    isCardComplete = false;
    currentTimeCard = null;
    nextTimeCard = null;
    issueCodeOverridesValues = '';

    setissueCodeOverridesValues(issueCodeOverridesValues) {
        this.timeCardHeaderBuilder.setIssueCodeOverridesValues(issueCodeOverridesValues);
    }

    addLine(input) {
        if (this.nextTimeCard != null) {
            this.currentTimeCard = this.nextTimeCard;
        }
        if (this.currentTimeCard == null) {
            this.currentTimeCard = new TimeCard();
        }

        let isHeader = this.timeCardHeaderBuilder.isTimeCardHeader(input);
        if (this.currentTimeCard.headerIsSet && isHeader) {
            this.nextTimeCard = this.timeCardHeaderBuilder.build(input);
            this.nextTimeCard.addLine(input);
            this.isCardComplete = true;
        } else if (isHeader) {
            this.currentTimeCard = this.timeCardHeaderBuilder.build(input);
            this.currentTimeCard.addLine(input);
        } else {
            this.currentTimeCard.addLine(input);
        }
    }

    clearContent() {
        this.currentTimeCard = null;
        this.isCardComplete = false;
    }
}

class TimeCardGroupAndSorter {
    groupAndSort(report) {
        let newReport = [];
        for (let i = 0; i < report.length; i++) {
            if (report[i].issueCode !== '') {
                newReport.push(report[i]);
            }
        }

        // Accepts the array and key
        const groupBy = (array, key) => {
            // Return the end result
            return array.reduce((result, currentValue) => {
                // If an array already present for key, push it to the array. Else create an array and push the object
                (result[currentValue[key]] = result[currentValue[key]] || []).push(
                    currentValue
                );
                // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
                return result;
            }, {}); // empty object is the initial value for result object
        };

        return groupBy(newReport, 'issueCode');
    }

    getIssueCodes(report) {
        let newReport = [];
        for (let i = 0; i < report.length; i++) {
            if (report[i].issueCode !== '') {
                newReport.push(report[i]);
            }
        }

        let issueCodes = [];
        for (let i = 0; i < newReport.length; i++) {
            if (newReport[i].issueCode !== '') {
                issueCodes.push(newReport[i].issueCode);
            }
        }

        issueCodes = [...new Set(issueCodes)];
        issueCodes.sort();

        return issueCodes;
    }
}


