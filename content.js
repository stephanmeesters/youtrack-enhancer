setTimeout(scanAndAddCommitCopyElement(), 100);

function scanAndAddCommitCopyElement() {
    const template = getTemplate();
    let keyboardListener;
    let cbrowser = chrome ?? browser;
    checkElement(template.issueBody).then(async (element) => {
        const newElement = document.createElement("div");
        newElement.className = 'yt-enhancer-row';

        const inputElement = document.createElement("div");
        const inputIdName = "yt-enhancer-input-peer";
        inputElement.innerHTML = `Peer: <input id=${inputIdName} style="width: 30px"/>`;
        newElement.appendChild(inputElement);

        const copyButton = generateButton();
        newElement.appendChild(copyButton);

        let copyFunc = async () => {
            try {
                const innerIdElement = await checkElement(template.issueId);
                const issueId = innerIdElement.innerText;

                const innerIssueElement = await checkElement(template.issueName);
                const issueName = innerIssueElement.innerText;

                const peer = document.getElementById(inputIdName).value.toUpperCase();
                let txt = `${issueName} [Peer: ${peer}]\nIssue: ${issueId}`;

                await copyToClipboard(txt);
            } catch (error) {
                console.info(error);
            }
        };
        keyboardListener = (command) => {
            if (command === "copy-commit-to-clipboard") {
                copyFunc();
            }
        };

        copyButton.onclick = copyFunc;
        cbrowser?.commands.onCommand.addListener(keyboardListener);
        element.parentNode.insertBefore(newElement, element);

        const observer = new MutationObserver(function (_mutations) {
            if (!document.contains(newElement)) {
                observer.disconnect();
                if (cbrowser?.commands.onCommand.hasListener(keyboardListener)) {
                    cbrowser?.commands.onCommand.removeListener(keyboardListener);
                }
                scanAndAddCommitCopyElement();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    })
        .catch((error) => {
            console.info(error);
            if (cbrowser?.commands.onCommand.hasListener(keyboardListener)) {
                cbrowser?.commands.onCommand.removeListener(keyboardListener);
            }
            scanAndAddCommitCopyElement();
        });
}

function getTemplate() {
    if (isLiteMode()) {
        if (window.location && window.location.href.includes('/agiles/')) {
            return {
                issueBody: "yt-issue-body",
                issueId: ".js-issue-id",
                issueName: ".yt-issue-body__summary.yt-issue-body__summary-common.yt-vgutter-bottom-2"
            }
        }
        else {
            return {
                issueBody: "span.highlighter__d45",
                issueId: "span.ring-ui-inner_e3ba.__singleValue__",
                issueName: `h1[data-test="ticket-summary"]`
            }
        }
    }
    else {
        return {
            issueBody: "yt-issue-body",
            issueId: ".js-issue-id",
            issueName: ".yt-issue-body__summary.yt-issue-body__summary-common.yt-vgutter-bottom-2"
        }
    }
}

function isLiteMode() {
    if (document.body.classList.contains("global_simplified-ui")) {
        return true;
    } else {
        return false;
    }
}

function checkElement(selector, timeout = 1000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element !== null) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver((_mutations, me) => {
            const element = document.querySelector(selector);
            if (element !== null) {
                me.disconnect();
                resolve(element);
            }
        });

        observer.observe(document, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} was not found within ${timeout}ms`));
        }, timeout);
    });
}
function generateButton() {
    const button = document.createElement("button");

    button.style.backgroundImage = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNMTEgNVYxSDF2MTBoNHY0aDEwVjV6TTIuNCA5LjZWMi40aDcuMnY3LjJ6bTExLjIgNEg2LjRWMTFIMTFWNi40aDIuNnoiPjwvcGF0aD48L3N2Zz4=")';
    button.className = 'yt-enhancer-copy-button';
    button.title = "Copy to clipboard";
    button.innerText = "Copy commit message";

    return button;
}

async function copyToClipboard(textToCopy) {
    // Navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
    } else {
        // Use the 'out of viewport hidden text area' trick
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;

        // Move textarea out of the viewport so it's not visible
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";

        document.body.prepend(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
        } catch (error) {
            console.error(error);
        } finally {
            textArea.remove();
        }
    }
}
