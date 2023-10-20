function checkElement(selector) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element !== null) {
            resolve(element);
        }
        else {
            const observer = new MutationObserver((mutations, me) => {
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
        }
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

checkElement("yt-issue-body").then(async (element) => {
    const newElement = document.createElement("div");
    newElement.className = 'yt-enhancer-row';

    var innerIdElement = await checkElement(".js-issue-id");
    var issueId = innerIdElement.innerText;

    var innerIssueElement = await checkElement(".yt-issue-body__summary.yt-issue-body__summary-common.yt-vgutter-bottom-2");
    var issueName = innerIssueElement.innerText;

    var inputElement = document.createElement("div");
    inputElement.innerHTML = `Peer: <input id="yt-enhancer-input-peer" style="width: 30px"/>`;
    newElement.appendChild(inputElement);

    var copyButton = generateButton();
    copyButton.onclick = async () => {
        var peer = document.getElementById("yt-enhancer-input-peer").value.toUpperCase();
        var txt;
        if (peer.length > 0) {
            txt = `${issueName} [Peer: ${peer}]\nIssue: ${issueId}`;
        }
        else {
            txt = `${issueName}\nIssue: ${issueId}`;
        }

        try {
            await copyToClipboard(txt);
        } catch (error) {
            console.error(error);
        }
    };
    newElement.appendChild(copyButton);

    element.parentNode.insertBefore(newElement, element);
});
