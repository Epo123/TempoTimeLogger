let issueCodeOverride = 'INT-2:INTBBBBBZJ-2\n' +
    'INT-12:INTBBBBBZJ-12\n' +
    'INT-8:INTBBBBBZJ-8\n' +
    'INT-19:INTBBBBBZJ-19\n' +
    'INT-5:INTBBBBBZJ-5\n' +
    'INT-22:INTBBBBBZJ-22';
let defaultWorkLogDescription = 'Working on ';

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ issueCodeOverride });
    chrome.storage.sync.set({ defaultWorkLogDescription });
});