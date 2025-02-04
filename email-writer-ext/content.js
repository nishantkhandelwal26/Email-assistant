console.log("Send reply to emails using AI!");
function createAIReplyButton() {
  const button = document.createElement("div");
  button.className = "T-I J-J5-Ji aoO v7 T-I-atl L3";
  button.style.marginRight = "8px";
  button.innerHTML = "AI Reply";
  button.setAttribute("role", "button");
  button.setAttribute("data-tooltip", "Generate AI Reply");
  button.classList.add("ai-reply-button");
  return button;
}

function getEmailContentElement() {
  const selectors = [".h7", ".a3s.aiL", "gmail_quote", '[role="presentation"]'];
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }
  return null;
}

function findComposeToolbar() {
  const selectors = [".btC", ".aDh", '[role="toolbar"]', ".gU.Up"];
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }
  return null;
}

function injectAIReplyButton() {
  const existingButton = document.querySelector(".ai-reply-button");
  if (existingButton) existingButton.remove();

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.error("Compose toolbar not found. Cannot inject AI Reply button.");
    return;
  }

  if (!(toolbar instanceof HTMLElement)) {
    console.error("Toolbar element is not a valid HTML element.");
    return;
  }

  console.log(
    "Compose toolbar found. Creating and injecting AI Reply button..."
  );

  const button = createAIReplyButton();

  button.addEventListener("click", async () => {
    try {
      button.innerHTML = "Generating...";
      button.disabled = true;

      const emailContentElement = getEmailContentElement();
      if (!emailContentElement) {
        throw new Error("Email content element not found.");
      }

      const emailContent = emailContentElement.textContent;
      console.log(`Email content: ${emailContent}`);

      if (!emailContent || typeof emailContent !== "string") {
        throw new Error("Invalid email content.");
      }

      const response = await fetch("http://localhost:8080/api/email/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: emailContent,
          tone: "Professional",
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const generatedReply = await response.text();
      console.log(`Generated reply: ${generatedReply}`);

      const composeBox = document.querySelector(
        '[role="textbox"][g_editable="true"]'
      );
      if (composeBox) {
        // **Alternative to document.execCommand for better security:**
        const textNode = document.createTextNode(generatedReply);
        composeBox.focus();
        const range = window.getSelection();
        range.collapse(composeBox, 0);
        composeBox.appendChild(textNode);
      } else {
        console.log("Compose box not found. Cannot insert generated reply.");
      }
    } catch (error) {
      console.error("Error generating AI reply:", error.message);
      alert(
        "Failed to generate reply. Please check the console for more information."
      );
    } finally {
      button.innerHTML = "AI Reply";
      button.disabled = false;
    }
  });

  toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    const addedNodes = Array.from(mutation.addedNodes);

    const hasComposeElements = addedNodes.some(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        (node.matches('.aDh, .btC, [role="dialog"]') ||
          node.querySelector('.aDh, .btC, [role="dialog"]'))
    );

    if (hasComposeElements) {
      console.log("Compose Window Detected");
      setTimeout(injectAIReplyButton, 500);
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
