import { portfolioData } from '../store/portfolio.js';
import { updateDatabase } from '../services/portfolioService.js';
import { renderPage } from '../pages/Home/Home.js';

export function editTitle(event, index) {
  const titleEl = event.target;
  const currentText = titleEl.textContent;
  const input = document.createElement("input");
  input.className = "edit-input";
  input.value = currentText;
  input.onblur = () => saveTitle(index, input.value);
  input.onkeydown = (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") {
      input.value = currentText;
      input.blur();
    }
  };
  titleEl.replaceWith(input);
  input.focus();
}

function saveTitle(index, newTitle) {
  portfolioData.cards[index].title = newTitle;
  updateDatabase(portfolioData);
  renderPage();
}

export function editSummary(event, index) {
  const summaryEl = event.target;
  const currentText = summaryEl.textContent;
  const input = document.createElement("textarea");
  input.className = "edit-input";
  input.value = currentText;
  input.rows = 3;
  input.onblur = () => saveSummary(index, input.value);
  input.onkeydown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) input.blur();
    if (e.key === "Escape") {
      input.value = currentText;
      input.blur();
    }
  };
  summaryEl.replaceWith(input);
  input.focus();
}

function saveSummary(index, newSummary) {
  portfolioData.cards[index].summary_text = newSummary;
  updateDatabase(portfolioData);
  renderPage();
}

export function editBullet(event, index) {
  const bulletEl = event.target;
  const currentText = bulletEl.textContent;
  const input = document.createElement("input");
  input.className = "edit-input";
  input.value = currentText;
  input.onblur = () => saveBullet(index, input.value);
  input.onkeydown = (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") {
      input.value = currentText;
      input.blur();
    }
  };
  bulletEl.replaceWith(input);
  input.focus();
}

function saveBullet(index, newBullet) {
  portfolioData.cards[index].summary_bullet = "→ " + newBullet;
  updateDatabase(portfolioData);
  renderPage();
}
