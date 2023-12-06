setTimeout(scanAndAddCommitCopyElement(), 100);

function scanAndAddCommitCopyElement() {
  const template = getTemplate();
  checkElement(template.issueBody)
    .then(async (element) => {
      const newElement = document.createElement("div");
      newElement.className = "yt-enhancer-row";

      const inputElement = document.createElement("div");
      const inputIdName = "yt-enhancer-input-peer";
      inputElement.innerHTML = `Peer: <input id=${inputIdName} style="width: 30px"/>`;
      newElement.appendChild(inputElement);

      const copyButton = generateButton();
      newElement.appendChild(copyButton);

      const copyFunc = async () => {
        try {
          const innerIdElement =
            typeof template.issueId === 'string'
              ? await checkElement(template.issueId)
              : await checkElement(
                  template.issueId.elem,
                  template.issueId.parent,
                );
          const issueId = innerIdElement.innerText;

          const innerIssueElement = await checkElement(template.issueName);
          const issueName = innerIssueElement.innerText;

          const peer = document.getElementById(inputIdName).value.toUpperCase();
          const txt = `${issueName} [Peer: ${peer}]\nIssue: ${issueId}`;

          await copyToClipboard(txt);
        } catch (error) {
          console.info(error);
        }
      };

      copyButton.onclick = copyFunc;
      element.parentNode.insertBefore(newElement, element);

      const observer = new MutationObserver(function (_mutations) {
        if (!document.contains(newElement)) {
          observer.disconnect();
          scanAndAddCommitCopyElement();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    })
    .catch((error) => {
      console.info(error);
      setTimeout(scanAndAddCommitCopyElement, 3000);
    });
}

function getTemplate() {
  if (isLiteMode()) {
    if (window.location?.href.includes("/agiles/")) {
      return {
        issueBody: "yt-issue-body",
        issueId: ".js-issue-id",
        issueName:
          ".yt-issue-body__summary.yt-issue-body__summary-common.yt-vgutter-bottom-2",
      };
    } else {
      return {
        issueBody: "span.highlighter__d45",
        issueId: {
          elem: ".ring-ui-inner_e3ba.__singleValue__",
          parent: ".idLink__a4b",
        },
        issueName: `h1[data-test="ticket-summary"]`,
      };
    }
  } else {
    return {
      issueBody: "yt-issue-body",
      issueId: ".js-issue-id",
      issueName:
        ".yt-issue-body__summary.yt-issue-body__summary-common.yt-vgutter-bottom-2",
    };
  }
}

function isLiteMode() {
  if (document.body.classList.contains("global_simplified-ui")) {
    return true;
  } else {
    return false;
  }
}

function checkElement(selector, parentSelector = undefined, timeout = 3000) {
  return new Promise((resolve, reject) => {
    let element;

    if (parentSelector !== undefined) {
      try {
        const parentElement = document.querySelector(parentSelector);
        element = parentElement?.querySelector(selector);
        if (element !== null) {
          resolve(element);
          return;
        }
      } catch (e) {
        console.warn(`could not find parent element: ${parentElement}`);
      }
    } else {
      element = document.querySelector(selector);
      if (element !== null) {
        resolve(element);
        return;
      }
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
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(
        new Error(`Element ${selector} was not found within ${timeout}ms`),
      );
    }, timeout);
  });
}
function generateButton() {
  const button = document.createElement("button");

  button.style.backgroundImage =
    'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij48cGF0aCBkPSJNMTEgNVYxSDF2MTBoNHY0aDEwVjV6TTIuNCA5LjZWMi40aDcuMnY3LjJ6bTExLjIgNEg2LjRWMTFIMTFWNi40aDIuNnoiPjwvcGF0aD48L3N2Zz4=")';
  button.className = "yt-enhancer-copy-button";
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
      document.execCommand("copy");
    } catch (error) {
      console.error(error);
    } finally {
      textArea.remove();
    }
  }
}
