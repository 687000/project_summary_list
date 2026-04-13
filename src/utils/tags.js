import { portfolioData } from '../store/portfolio.js';
import { updateDatabase } from '../services/portfolioService.js';
import { renderPage } from '../pages/Home/Home.js';

export function editTag(event, cardIndex, tagIndex) {
  const tagEl = event.target.closest(".tag");
  const currentText = tagEl.textContent.replace("×", "").trim();
  const input = document.createElement("input");
  input.className = "edit-input";
  input.value = currentText;
  input.onblur = () => saveTag(cardIndex, tagIndex, input.value);
  input.onkeydown = (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") {
      input.value = currentText;
      input.blur();
    }
  };
  tagEl.replaceWith(input);
  input.focus();
}

function saveTag(cardIndex, tagIndex, newTag) {
  if (newTag.trim()) {
    portfolioData.cards[cardIndex].tags[tagIndex] = newTag.trim();
  }
  updateDatabase(portfolioData);
  renderPage();
}

export function deleteTag(event, cardIndex, tagIndex) {
  event.stopPropagation();
  portfolioData.cards[cardIndex].tags.splice(tagIndex, 1);
  updateDatabase(portfolioData);
  renderPage();
}

export function addTag(cardIndex) {
  const newTag = prompt("Enter new tag:");
  if (newTag && newTag.trim()) {
    portfolioData.cards[cardIndex].tags.push(newTag.trim());
    updateDatabase(portfolioData);
    renderPage();
  }
}
