export class FormStatusNotifier {
  public static show(form: HTMLFormElement, message: string, type: "success" | "error"): void {
    let statusDiv = form.querySelector<HTMLElement>(".xpm-status-message");
    if (!statusDiv) {
      statusDiv = document.createElement("div");
      statusDiv.className = "xpm-status-message";
      statusDiv.style.marginBottom = "12px";
      statusDiv.style.padding = "8px 12px";
      statusDiv.style.borderRadius = "4px";
      statusDiv.style.fontWeight = "bold";

      const actionsDiv = form.querySelector(".xpm-actions");
      if (actionsDiv) {
        form.insertBefore(statusDiv, actionsDiv);
      } else {
        form.appendChild(statusDiv);
      }
    }

    statusDiv.style.backgroundColor = type === "success" ? "#d4edda" : "#f8d7da";
    statusDiv.style.color = type === "success" ? "#155724" : "#721c24";
    statusDiv.style.border = type === "success" ? "1px solid #c3e6cb" : "1px solid #f5c6cb";
    statusDiv.innerText = message;
  }

  public static clear(form: HTMLFormElement): void {
    form.querySelector(".xpm-status-message")?.remove();
  }
}
