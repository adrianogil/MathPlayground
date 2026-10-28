"use strict";

// Fixed colors spaced across OKLab hue, lightness, and saturation so distinct
// primes do not merely get near-identical pastel hex values. Repeated factors
// repeat their bands. The first 25 colors match the original 1–100 page;
// the additional 53 colors extend the palette to the primes through 400.
const palette = [
  "#8fb8ec", "#f1a38e", "#e6c563", "#a8c88d", "#b6a0da",
  "#79c7c8", "#e69dbb", "#005500", "#5500bb", "#bb0011",
  "#0077aa", "#bb33bb", "#339900", "#663355", "#aa7733",
  "#ff3377", "#7766ff", "#88ee22", "#ff66ee", "#004488",
  "#995577", "#ff6600", "#559988", "#775500", "#0099ff",
  "#00ffdd", "#00cc66", "#eeccff", "#880099", "#117755",
  "#0044dd", "#553300", "#bb77ff", "#99aa00", "#8877bb",
  "#550077", "#aa0066", "#0000bb", "#cc7788", "#880000",
  "#dd9900", "#6655aa", "#ee1100", "#115555", "#8833dd",
  "#bbee99", "#ee99ff", "#cc4488", "#00aacc", "#99ddff",
  "#bb9977", "#ffccbb", "#777700", "#22bb99", "#dd66bb",
  "#1166ff", "#aacc22", "#bb5544", "#ffdd00", "#44ddaa",
  "#ff7788", "#00ff99", "#8899ff", "#663388", "#00ccff",
  "#770066", "#332288", "#884444", "#dd44dd", "#007700",
  "#88aa77", "#dd0055", "#9955aa", "#5544ee", "#445577",
  "#aa55ee", "#4488cc", "#3366cc"
];

function primeFactors(number) {
  const factors = [];
  for (let divisor = 2; divisor * divisor <= number; divisor += 1) {
    while (number % divisor === 0) {
      factors.push(divisor);
      number /= divisor;
    }
  }
  if (number > 1) factors.push(number);
  return factors;
}

const numbers = Array.from({ length: maximum }, (_, index) => {
  const value = index + 1;
  return { value, factors: primeFactors(value) };
});
const primes = numbers.filter(number => number.factors.length === 1).map(number => number.value);
const colors = new Map(primes.map((prime, index) => [prime, palette[index]]));
const grid = document.querySelector("#number-grid");
const primeGrid = document.querySelector("#prime-grid");
const numberGrids = [grid, primeGrid];
const legend = document.querySelector("#prime-legend");
let selectedNumber = 60;
let highlightedNumber = null;

function addBands(element, number) {
  const bands = document.createElement("span");
  bands.className = "bands";
  bands.setAttribute("aria-hidden", "true");
  number.factors.forEach(factor => {
    const band = document.createElement("span");
    band.className = "band";
    band.style.setProperty("--color", colors.get(factor));
    bands.append(band);
  });
  const label = document.createElement("span");
  label.className = "number-label";
  label.textContent = number.value;
  element.append(bands, label);
}

function describe(number) {
  if (number.value === 1) return t("oneLabel");
  if (number.factors.length === 1) return t("primeLabel", { value: number.value });
  return `${number.value} = ${number.factors.join(" × ")}`;
}

function selectNumber(value) {
  selectedNumber = selectedNumber === value ? null : value;
  renderSelection();
  highlightRelated(selectedNumber);
}

function renderSelection() {
  const value = selectedNumber;
  for (const button of numberGrids.flatMap(container => Array.from(container.children))) {
    button.setAttribute("aria-pressed", String(Number(button.dataset.number) === selectedNumber));
  }
  const preview = document.querySelector("#selected-tile");
  preview.replaceChildren();
  const chips = document.querySelector("#factor-chips");
  chips.replaceChildren();
  if (selectedNumber === null) {
    preview.textContent = "—";
    document.querySelector("#number-kind").textContent = t("noSelection");
    document.querySelector("#equation").textContent = t("pick");
    document.querySelector("#explanation").textContent = t("pickExplanation");
    return;
  }
  const number = numbers[value - 1];
  const isPrime = number.factors.length === 1;
  addBands(preview, number);
  document.querySelector("#number-kind").textContent = t(value === 1 ? "unit" : isPrime ? "prime" : "composite");
  document.querySelector("#equation").textContent = value === 1 ? t("oneEquation") : isPrime ? t("primeEquation", { value }) : `${value} = ${number.factors.join(" × ")}`;
  for (const factor of [...new Set(number.factors)]) {
    const chip = document.createElement("span");
    chip.className = "factor-chip";
    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.setProperty("--color", colors.get(factor));
    const count = number.factors.filter(item => item === factor).length;
    chip.append(swatch, t(count === 1 ? "bandOne" : "bandMany", { factor, count }));
    chips.append(chip);
  }
  document.querySelector("#explanation").textContent = value === 1
    ? t("oneExplanation")
    : isPrime
      ? t("primeExplanation", { value })
      : t("compositeExplanation", {
        value, count: number.factors.length,
        colors: t(new Set(number.factors).size === 1 ? "colorOne" : "colorMany", { count: new Set(number.factors).size })
      });
}

function highlightRelated(value) {
  // 1 acts as a shortcut to all primes; it still has no prime factors.
  highlightedNumber = value;
  const number = highlightedNumber === null ? null : numbers[highlightedNumber - 1];
  const isPrime = number?.factors.length === 1;
  const factors = new Set(number?.factors ?? []);
  for (const button of numberGrids.flatMap(container => Array.from(container.children))) {
    const candidate = Number(button.dataset.number);
    const related = number !== null && (value === 1 ? primes.includes(candidate) : isPrime ? candidate % value === 0 : factors.has(candidate));
    const selectedSource = number !== null && !isPrime && candidate === value;
    button.classList.toggle("is-related", related);
    button.classList.toggle("is-muted", number !== null && !related && !selectedSource);
  }
  for (const button of legend.children) {
    const prime = Number(button.dataset.prime);
    button.setAttribute("aria-pressed", String(Boolean(isPrime && prime === value)));
    button.classList.toggle("is-factor", Boolean(number && !isPrime && (value === 1 || factors.has(prime))));
  }
  document.querySelector("#clear-filter").disabled = number === null;
  document.querySelector("#filter-status").textContent = number === null
    ? t("showAll")
    : value === 1
      ? t("allPrimes", { count: primes.length })
    : isPrime
      ? t(Math.floor(maximum / value) === 1 ? "multiplesOne" : "multiplesMany", { value, count: Math.floor(maximum / value) })
      : t("factorsStatus", { value, factors: [...factors].join(", ") });
}

function filterPrime(prime) {
  highlightRelated(highlightedNumber === prime ? null : prime);
}

function populateGrid(container, entries) {
  entries.forEach((number, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `number-tile${number.factors.length === 1 ? " is-prime" : ""}`;
    button.dataset.number = number.value;
    button.setAttribute("aria-label", describe(number));
    button.title = describe(number);
    addBands(button, number);
    button.addEventListener("click", () => selectNumber(number.value));
    // Arrow keys follow the visible column count; Tab also reaches every tile.
    button.addEventListener("keydown", event => {
      const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -gridSize, ArrowDown: gridSize }[event.key];
      if (offset === undefined) return;
      event.preventDefault();
      const target = Math.max(0, Math.min(entries.length - 1, index + offset));
      container.children[target].focus();
    });
    container.append(button);
  });
}

populateGrid(grid, numbers);
populateGrid(primeGrid, numbers.filter(number => number.factors.length === 1));

for (const prime of primes) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "prime-key";
  button.dataset.prime = prime;
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", t("highlightPrime", { value: prime }));
  const swatch = document.createElement("span");
  swatch.className = "swatch";
  swatch.style.setProperty("--color", colors.get(prime));
  button.append(swatch, String(prime));
  button.addEventListener("click", () => filterPrime(prime));
  legend.append(button);
}

document.querySelector("#clear-filter").addEventListener("click", () => highlightRelated(null));

function setLanguage(locale) {
  language = Object.hasOwn(translations, locale) ? locale : "pt-BR";
  document.documentElement.lang = language;
  document.title = `${t("title")} · ${gridSize}×${gridSize}`;
  document.querySelector('meta[name="description"]').content = t("description");
  document.querySelector("#language").value = language;
  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
  grid.setAttribute("aria-label", t("gridLabel"));
  for (const button of numberGrids.flatMap(container => Array.from(container.children))) {
    const label = describe(numbers[Number(button.dataset.number) - 1]);
    button.setAttribute("aria-label", label);
    button.title = label;
  }
  for (const button of legend.children) {
    button.setAttribute("aria-label", t("highlightPrime", { value: button.dataset.prime }));
  }
  // Translate the current view without toggling its selection or highlights.
  renderSelection();
  highlightRelated(highlightedNumber);
}

document.querySelector("#language").addEventListener("change", event => setLanguage(event.target.value));
setLanguage("pt-BR");
