(function () {
  "use strict";

  const elements = {
    multiplicand: document.getElementById("multiplicand"),
    multiplier: document.getElementById("multiplier"),
    loadProblem: document.getElementById("loadProblem"),
    loadGifted: document.getElementById("loadGifted"),
    problemError: document.getElementById("problemError"),
    stepCount: document.getElementById("stepCount"),
    progress: document.querySelector("[role='progressbar']"),
    progressFill: document.getElementById("progressFill"),
    digitRail: document.getElementById("digitRail"),
    multiplierRail: document.getElementById("multiplierRail"),
    answerRail: document.getElementById("answerRail"),
    outsideExpression: document.getElementById("outsideExpression"),
    outsideValue: document.getElementById("outsideValue"),
    insideExpression: document.getElementById("insideExpression"),
    insideValue: document.getElementById("insideValue"),
    carryExpression: document.getElementById("carryExpression"),
    localTotal: document.getElementById("localTotal"),
    writeInstruction: document.getElementById("writeInstruction"),
    stepExplanation: document.getElementById("stepExplanation"),
    previousStep: document.getElementById("previousStep"),
    playSteps: document.getElementById("playSteps"),
    nextStep: document.getElementById("nextStep")
  };

  let trace = Trachtenberg.buildTrace(135, 57);
  let currentStep = 0;
  let playTimer = null;

  function digitCell(value, className, label) {
    const cell = document.createElement("span");
    cell.className = `digit ${className || ""}`.trim();
    cell.textContent = value;
    if (label) {
      cell.setAttribute("aria-label", label);
    }
    return cell;
  }

  function stopPlayback() {
    if (playTimer !== null) {
      window.clearInterval(playTimer);
      playTimer = null;
    }
    elements.playSteps.textContent = "Play steps";
    elements.playSteps.setAttribute("aria-pressed", "false");
  }

  function renderDigitRail(step) {
    const rawDigits = String(trace.multiplicand).split("");
    const displayDigits = ["0", "0", ...rawDigits, "0"];
    const outsideIndex = rawDigits.length + 1 - step.position;
    const insideIndex = outsideIndex + 1;

    elements.digitRail.replaceChildren();
    displayDigits.forEach((digit, index) => {
      let className = "";
      let label = `Digit ${digit}`;
      if (index === outsideIndex) {
        className = "is-outside";
        label = `Outside digit ${digit}`;
      } else if (index === insideIndex) {
        className = "is-inside";
        label = `Inside digit ${digit}`;
      } else if (index < 2 || index === displayDigits.length - 1) {
        className = "is-padding";
        label = `Padding zero`;
      }
      elements.digitRail.appendChild(digitCell(digit, className, label));
    });
  }

  function renderMultiplier(step) {
    elements.multiplierRail.replaceChildren(
      digitCell(step.tensMultiplier, "is-inside", `Inside multiplier ${step.tensMultiplier}`),
      digitCell(step.unitsMultiplier, "is-outside", `Outside multiplier ${step.unitsMultiplier}`)
    );
  }

  function renderAnswer() {
    elements.answerRail.replaceChildren();
    const reversed = trace.outputDigits.slice().reverse();
    reversed.forEach((digit, displayIndex) => {
      const sourceStep = reversed.length - 1 - displayIndex;
      const revealed = sourceStep <= currentStep;
      const className = sourceStep === currentStep ? "is-current-answer" : "";
      elements.answerRail.appendChild(
        digitCell(revealed ? digit : "·", className, revealed ? `Answer digit ${digit}` : "Unrevealed answer digit")
      );
    });
  }

  function describeStep(step) {
    if (step.position === 0) {
      return "Begin at the right edge. The missing neighbor contributes zero.";
    }
    if (step.outsideDigit === 0 && step.insideDigit === 0) {
      return "Both digit pairs are finished. Write the remaining carry as the leading digit.";
    }
    if (step.outsideDigit === 0) {
      return "The leading zero keeps the same pair rule valid for the final column.";
    }
    return "Move both pairs one place left, then include the carry from the previous column.";
  }

  function render() {
    const step = trace.steps[currentStep];
    const totalSteps = trace.steps.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    elements.stepCount.textContent = `Step ${currentStep + 1} of ${totalSteps}`;
    elements.progress.setAttribute("aria-valuemax", String(totalSteps));
    elements.progress.setAttribute("aria-valuenow", String(currentStep + 1));
    elements.progressFill.style.width = `${progress}%`;

    renderDigitRail(step);
    renderMultiplier(step);
    renderAnswer();

    elements.outsideExpression.textContent = `${step.outsideDigit} × ${step.unitsMultiplier}`;
    elements.outsideValue.textContent = step.outsideValue;
    elements.insideExpression.textContent = `${step.insideDigit} × ${step.tensMultiplier}`;
    elements.insideValue.textContent = step.insideValue;
    elements.carryExpression.textContent = step.incomingCarry;
    elements.localTotal.textContent = step.total;
    elements.writeInstruction.textContent = `Write ${step.outputDigit} · carry ${step.outgoingCarry}`;
    elements.stepExplanation.textContent = describeStep(step);

    elements.previousStep.disabled = currentStep === 0;
    elements.nextStep.disabled = currentStep === totalSteps - 1;
    elements.nextStep.textContent = currentStep === totalSteps - 1 ? "Complete ✓" : "Next →";
  }

  function loadProblem(multiplicand, multiplier) {
    try {
      trace = Trachtenberg.buildTrace(multiplicand, multiplier);
      currentStep = 0;
      elements.problemError.hidden = true;
      stopPlayback();
      render();
    } catch (error) {
      elements.problemError.textContent = error.message;
      elements.problemError.hidden = false;
    }
  }

  function next() {
    if (currentStep < trace.steps.length - 1) {
      currentStep += 1;
      render();
    } else {
      stopPlayback();
    }
  }

  function previous() {
    if (currentStep > 0) {
      currentStep -= 1;
      render();
    }
  }

  elements.loadProblem.addEventListener("click", function () {
    loadProblem(elements.multiplicand.value, elements.multiplier.value);
  });

  elements.loadGifted.addEventListener("click", function () {
    elements.multiplicand.value = "135";
    elements.multiplier.value = "57";
    loadProblem(135, 57);
  });

  elements.previousStep.addEventListener("click", function () {
    stopPlayback();
    previous();
  });

  elements.nextStep.addEventListener("click", function () {
    stopPlayback();
    next();
  });

  elements.playSteps.addEventListener("click", function () {
    if (playTimer !== null) {
      stopPlayback();
      return;
    }
    if (currentStep === trace.steps.length - 1) {
      currentStep = 0;
      render();
    }
    elements.playSteps.textContent = "Pause";
    elements.playSteps.setAttribute("aria-pressed", "true");
    playTimer = window.setInterval(next, 1400);
  });

  document.addEventListener("keydown", function (event) {
    if (event.target instanceof HTMLInputElement) {
      return;
    }
    if (event.key === "ArrowRight") {
      stopPlayback();
      next();
    } else if (event.key === "ArrowLeft") {
      stopPlayback();
      previous();
    }
  });

  render();
}());
