import { listenToPortfolio } from './services/portfolioService.js';
import { renderPage } from './pages/Home/Home.js';
import { dragStart, dragOver, drop, dragEnd } from './utils/dragDrop.js';
import { editTitle, editSummary, editBullet } from './utils/editing.js';
import { editTag, deleteTag, addTag } from './utils/tags.js';

Object.assign(window, {
  editTitle,
  editSummary,
  editBullet,
  editTag,
  deleteTag,
  addTag,
  dragStart,
  dragOver,
  drop,
  dragEnd,
});

listenToPortfolio(
  () => renderPage(),
  (err) => {
    document.getElementById("cards-container").innerHTML =
      `<pre>Failed to sync Firestore: ${err.message}</pre>`;
  },
);
