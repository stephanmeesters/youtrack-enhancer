// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === "copyYouTrackInfo") {
//     const peerText = request.peer ? ` ${request.peer} ` : ' ';
//     chrome.scripting.executeScript({
//       target: { tabId: sender.tab.id },
//       function: getIssueInfo,
//       args: [peerText]
//     }).then(result => {
//       const issueInfo = result[0].result;
//       if (issueInfo) {
//         copyTextToClipboard(issueInfo);
//         sendResponse({issueInfo: issueInfo});
//       }
//     }).catch(err => {
//       console.error(err);
//     });
//   }
//   return true;  // To allow async sendResponse
// });
//
// function getIssueInfo(peerText) {
//     console.log("my document:");
//     console.log(document);
//   const issueID = document.querySelector('a[data-test="ring-link"] span')?.textContent || '';
//   const issueName = document.querySelector('h1[data-test="ticket-summary"]')?.textContent || '';
//   return issueName + peerText + 'issue: ' + issueID;
// }
//
// function copyTextToClipboard(text) {
//   navigator.clipboard.writeText(text).then(() => {
//     console.log('Text successfully copied');
//   }).catch(err => {
//     console.error('Unable to copy text', err);
//   });
// }
//
