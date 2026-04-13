import { portfolioData } from '../store/portfolio.js';
import { updateDatabase } from '../services/portfolioService.js';
import { renderPage } from '../pages/Home/Home.js';

let draggedIndex = null;

export function dragStart(event) {
  const card = event.currentTarget;
  draggedIndex = parseInt(card.dataset.index, 10);
  card.classList.add("dragging");
}

export function dragOver(event) {
  event.preventDefault();
}

export function drop(event) {
  event.preventDefault();
  const card = event.currentTarget;
  card.classList.remove("dragging");
  const afterElement = getDragAfterElement(event.clientY);
  let insertIndex;
  if (afterElement == null) {
    insertIndex = portfolioData.cards.length - 1;
  } else {
    insertIndex = parseInt(afterElement.dataset.index, 10);
    if (insertIndex > draggedIndex) {
      insertIndex--;
    }
  }
  if (draggedIndex !== null && draggedIndex !== insertIndex) {
    const [removed] = portfolioData.cards.splice(draggedIndex, 1);
    portfolioData.cards.splice(insertIndex, 0, removed);
    updateDatabase(portfolioData);
    renderPage();
  }
}

export function dragEnd(event) {
  event.target.classList.remove("dragging");
  draggedIndex = null;
}

function getDragAfterElement(y) {
  const draggableElements = [
    ...document.querySelectorAll(".card:not(.dragging)"),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}
