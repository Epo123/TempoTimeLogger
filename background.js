let issueCodeOverrideValues = 'INT-2:INTBBBBBZJ-2\n' +
    'INT-12:INTBBBBBZJ-12\n' +
    'INT-8:INTBBBBBZJ-8\n' +
    'INT-19:INTBBBBBZJ-19\n' +
    'INT-5:INTBBBBBZJ-5\n' +
    'INT-22:INTBBBBBZJ-22';
let defaultWorkLogDescriptionValue = 'Working on ';
let workLogOrderValue = 'startEndIssueCode';
let timeSeparatorValue = 'colonTimeSeparator';
let elementSeparatorValue = 'dashElementSeparator';
let jiraUrlPart = 'youweagency';
let timeLogValue = 'Enter time log here';
let issueListValue = 'ISSUE-123\n' +
    'ISSUE-234';
let durationInMinutesValue = 0;
let workLogDescriptionValue = '';

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ issueCodeOverrideValues });
    chrome.storage.sync.set({ defaultWorkLogDescriptionValue });
    chrome.storage.sync.set({ workLogOrderValue });
    chrome.storage.sync.set({ timeSeparatorValue });
    chrome.storage.sync.set({ elementSeparatorValue });
    chrome.storage.sync.set({ jiraUrlPart });
    chrome.storage.sync.set({ timeLogValue });
    chrome.storage.sync.set({ issueListValue });
    chrome.storage.sync.set({ durationInMinutesValue });
    chrome.storage.sync.set({ workLogDescriptionValue });
});