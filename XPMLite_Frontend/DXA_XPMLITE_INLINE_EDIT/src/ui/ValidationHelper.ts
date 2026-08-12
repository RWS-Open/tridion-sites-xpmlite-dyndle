export class ValidationHelper {
  private static DEFAULT_ERROR_CLASS = "xpm-form-error";

  static showError(
    element: HTMLElement,
    message: string,
    className: string = ValidationHelper.DEFAULT_ERROR_CLASS
  ): void {
    this.clearError(element, className);

    const error = document.createElement("div");
    error.className = className;
    error.textContent = message;

    Object.assign(error.style, {
      color: "#dc3545",
      fontSize: "12px",
      marginTop: "4px",
      width: "100%",
      display: "block"
    });

    const targetContainer = element.closest(".xpm-field") || element.parentElement;
    targetContainer?.appendChild(error);

    element.classList.add("xpm-input-error");
    element.style.borderColor = "#dc3545";
  }

  static clearError(
    element: HTMLElement,
    className: string = ValidationHelper.DEFAULT_ERROR_CLASS
  ): void {
    const container = element.closest(".xpm-field") || element.parentElement;
    container?.querySelector(`.${className}`)?.remove();

    element.classList.remove("xpm-input-error");
    element.style.borderColor = "";
  }

  static validate(element: HTMLElement, isValid: boolean, message: string): boolean {
    if (isValid) {
      this.clearError(element);
      return true;
    }

    this.showError(element, message);
    return false;
  }

  static validateForm(form: HTMLFormElement): boolean {
    let isValid = true;
    const requiredFields = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      "[data-required='true']"
    );

    requiredFields.forEach((input) => {
      let isFieldValid = false;

      if (input.type === "file") {
        const fileInput = input as HTMLInputElement;
        isFieldValid = Boolean(fileInput.files && fileInput.files.length > 0);
      } else {
        isFieldValid = input.value.trim() !== "";
      }

      const labelEl = input.labels?.[0];
      const fieldLabel = labelEl
        ? labelEl.innerText.replace("*", "").trim()
        : input.name || "Field";

      if (!this.validate(input, isFieldValid, `${fieldLabel} is required.`)) {
        isValid = false;
      }
    });

    return isValid;
  }
}
