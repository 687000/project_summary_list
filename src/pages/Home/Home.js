import { portfolioData } from '../../store/portfolio.js';
import { createCardHtml } from '../../components/Card/Card.js';

export function renderPage() {
  document.querySelector(".page-header h1").textContent =
    portfolioData.page_header.title;
  document.querySelector(".page-header p").textContent =
    portfolioData.page_header.subtitle;

  const container = document.getElementById("cards-container");
  container.innerHTML = portfolioData.cards
    .map((card, index) => createCardHtml(card, index))
    .join("");
}
