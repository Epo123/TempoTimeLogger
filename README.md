# Tempo Time Logger

## How to use  the tool
After installing the extension, open Tempo (https://jira.examplecompany.com/secure/Tempo.jspa)

Right-click the extension and select 'options'.
Make sure the Jira url part is set up, so it matches your jira tempo url.

After this is set up, go to Tempo and press 'w' to open the Log Time dialog.
Optionally select a different date and write your time logs in the following format for best results:

{startTime} - {endTime} - {issueCode} - {message}

Example:

10:00 - 10:15 - ISSUE-123 - Making a call

10:15 - 10:45 - PROJECT-345 - Doing the work

Paste your work log into the text area and click on the 'Process' button at the bottom.

Your work logs have been grouped and total duration calculated.
An issue description will be retrieved if the issue could be found, and you are able to review all your 
descriptions formed by adding together all the messages in your work logs. When you're ready either log the time by
clicking each Log Time button or simply use the 'Log all' button at the top.

## Known issues
* Some options on the options page are not working properly yet.