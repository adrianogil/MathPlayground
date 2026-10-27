"use strict";

// Fixed colors spaced across OKLab hue, lightness, and saturation so distinct
// primes do not merely get near-identical pastel hex values. Repeated factors
// repeat their bands. The first seven familiar colors stay unchanged.
const palette = [
  "#8fb8ec", "#f1a38e", "#e6c563", "#a8c88d", "#b6a0da",
  "#79c7c8", "#e69dbb", "#005500", "#5500bb", "#bb0011",
  "#0077aa", "#bb33bb", "#339900", "#663355", "#aa7733",
  "#ff3377", "#7766ff", "#88ee22", "#ff66ee", "#004488",
  "#995577", "#ff6600", "#559988", "#775500", "#0099ff"
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

const numbers = Array.from({ length: 100 }, (_, index) => {
  const value = index + 1;
  return { value, factors: primeFactors(value) };
});
const primes = numbers.filter(number => number.factors.length === 1).map(number => number.value);
const colors = new Map(primes.map((prime, index) => [prime, palette[index]]));
const grid = document.querySelector("#number-grid");
const legend = document.querySelector("#prime-legend");
let selectedNumber = 60;
let activePrime = null;

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
  if (number.value === 1) return "1, neither prime nor composite; no prime factors";
  if (number.factors.length === 1) return `${number.value}, prime`;
  return `${number.value} = ${number.factors.join(" × ")}`;
}

function selectNumber(value) {
  selectedNumber = value;
  const number = numbers[value - 1];
  const isPrime = number.factors.length === 1;
  for (const button of grid.children) {
    button.setAttribute("aria-pressed", String(Number(button.dataset.number) === selectedNumber));
  }
  const preview = document.querySelector("#selected-tile");
  preview.replaceChildren();
  addBands(preview, number);
  document.querySelector("#number-kind").textContent = value === 1 ? "The unit" : isPrime ? "Prime number" : "Composite";
  document.querySelector("#equation").textContent = value === 1 ? "1 has no prime factors" : isPrime ? `${value} is prime` : `${value} = ${number.factors.join(" × ")}`;
  const chips = document.querySelector("#factor-chips");
  chips.replaceChildren();
  for (const factor of [...new Set(number.factors)]) {
    const chip = document.createElement("span");
    chip.className = "factor-chip";
    const swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.setProperty("--color", colors.get(factor));
    const count = number.factors.filter(item => item === factor).length;
    chip.append(swatch, `${factor}${count > 1 ? ` × ${count} bands` : " · 1 band"}`);
    chips.append(chip);
  }
  document.querySelector("#explanation").textContent = value === 1
    ? "Every prime factorization starts with primes. The number 1 has none, so its square stays neutral."
    : isPrime
      ? `Only 1 and ${value} divide ${value} exactly. It gets one color, which appears in every multiple of ${value}.`
      : `${number.factors.length} prime factors, ${new Set(number.factors).size} ${new Set(number.factors).size === 1 ? "color" : "colors"}. Each band is one factor; repeated primes repeat the same color. Multiply the factors to get ${value}.`;
}

function filterPrime(prime) {
  activePrime = activePrime === prime ? null : prime;
  for (const button of grid.children) {
    button.classList.toggle("is-muted", activePrime !== null && Number(button.dataset.number) % activePrime !== 0);
  }
  for (const button of legend.children) {
    button.setAttribute("aria-pressed", String(Number(button.dataset.prime) === activePrime));
  }
  document.querySelector("#clear-filter").disabled = activePrime === null;
  document.querySelector("#filter-status").textContent = activePrime === null
    ? "Showing all 100 numbers"
    : `Highlighting ${Math.floor(100 / activePrime)} multiples of ${activePrime} · select the prime again to clear`;
}

for (const number of numbers) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `number-tile${number.factors.length === 1 ? " is-prime" : ""}`;
  button.dataset.number = number.value;
  button.setAttribute("aria-label", describe(number));
  button.title = describe(number);
  addBands(button, number);
  button.addEventListener("click", () => selectNumber(number.value));
  // Arrow keys follow the visible ten-column layout; Tab also reaches every tile.
  button.addEventListener("keydown", event => {
    const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -10, ArrowDown: 10 }[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    const target = Math.max(1, Math.min(100, number.value + offset));
    grid.children[target - 1].focus();
  });
  grid.append(button);
}

for (const prime of primes) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "prime-key";
  button.dataset.prime = prime;
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", `Highlight multiples of ${prime}`);
  const swatch = document.createElement("span");
  swatch.className = "swatch";
  swatch.style.setProperty("--color", colors.get(prime));
  button.append(swatch, String(prime));
  button.addEventListener("click", () => filterPrime(prime));
  legend.append(button);
}

document.querySelector("#clear-filter").addEventListener("click", () => filterPrime(null));
selectNumber(selectedNumber);
