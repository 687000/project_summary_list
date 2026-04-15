// ── Store ──
var portfolioData = null;
var isEditMode = false;

function setPortfolioData(data) {
  portfolioData = data;
}

// ── Mode & Auth ──
function detectEditRoute() {
  var path = window.location.pathname;
  return path === '/edit' || path === '/edit/';
}

function showLoginModal() {
  document.getElementById('login-modal').classList.add('visible');
  ui.start('#firebaseui-auth-container', uiConfig);
}

function hideLoginModal() {
  document.getElementById('login-modal').classList.remove('visible');
  ui.reset();
}

function enterEditMode() {
  isEditMode = true;
  hideLoginModal();
  document.getElementById('edit-banner').classList.add('visible');
  document.body.classList.add('edit-active');
  if (portfolioData) renderPage();
}

function exitEditMode() {
  isEditMode = false;
  document.getElementById('edit-banner').classList.remove('visible');
  document.body.classList.remove('edit-active');
  if (portfolioData) renderPage();
}

function logout() {
  // Push to '/' before signOut so onAuthStateChanged sees '/' and skips the modal
  window.history.pushState({}, '', '/');
  firebase.auth().signOut();
}

// ── Firebase ──
var firebaseConfig = {
  apiKey: "AIzaSyCXSS72HgGD_8swIahYtNgSlqXvnKhPxuQ",
  authDomain: "project-summary-data.firebaseapp.com",
  projectId: "project-summary-data",
  storageBucket: "project-summary-data.firebasestorage.app",
  messagingSenderId: "1089446666374",
  appId: "1:1089446661374:web:b1bf3beacdf29272767107",
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

// ── FirebaseUI ──
var ui = new firebaseui.auth.AuthUI(firebase.auth());
var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function() {
      return false;
    },
    signInFailure: function(error) {
      console.error('FirebaseUI sign-in failure:', error.code, error.message, error);
      return Promise.resolve();
    }
  },
  signInFlow: 'popup',
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false,
      disableSignUp: { status: true }
    }
  ]
};

// ── Portfolio Service ──
var portfolioDoc = db.collection("portfolio").doc("data");
var unsubscribeSnapshot = null;

function updateDatabase(data) {
  portfolioDoc.set(data).catch(function(err) {
    console.warn("Firestore save failed:", err);
  });
}

function listenToPortfolio(onData, onError) {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
  }
  unsubscribeSnapshot = portfolioDoc.onSnapshot(
    function(doc) {
      if (doc.exists) {
        setPortfolioData(doc.data());
        onData();
      }
    },
    function(err) {
      onError(err);
    }
  );
}

// ── Card Component ──
// Sections whose labels match these filters are shown in display mode
var DISPLAY_SECTION_FILTERS = ['owner', 'technical', 'highlight'];

function isDisplaySection(label) {
  var lower = label.toLowerCase();
  return DISPLAY_SECTION_FILTERS.some(function(keyword) {
    return lower.indexOf(keyword) !== -1;
  });
}

function createDisplayCardHtml(card, index) {
  var tagsHtml = card.tags.map(function(tag) {
    return '<span class="tag display-tag">' + tag + '</span>';
  }).join('');

  var bulletText = card.summary_bullet ? card.summary_bullet.slice(2) : '';

  var filteredSections = card.sections.filter(function(section) {
    return isDisplaySection(section.label);
  });

  var sectionsHtml = filteredSections.map(function(section) {
    return '<div class="section">' +
      '<div class="section-label">' + section.label + '</div>' +
      '<div class="section-body">' + renderSection(section.content) + '</div>' +
      '</div>';
  }).join('');

  var hasExpand = filteredSections.length > 0;

  return '<details class="card" data-index="' + index + '">' +
    '<summary' + (!hasExpand ? ' onclick="event.preventDefault()" class="no-expand"' : '') + '>' +
      '<div class="card-header">' +
        '<div class="card-title-row">' +
          '<h2 class="card-title">' + card.title + '</h2>' +
          (hasExpand ? '<span class="chevron">›</span>' : '') +
        '</div>' +
        '<div class="tags">' + tagsHtml + '</div>' +
      '</div>' +
      '<div class="card-preview">' +
        '<p class="summary-text">' + card.summary_text + '</p>' +
        (bulletText
          ? '<div class="detail-row">' +
              '<span class="detail-label">Details</span>' +
              '<p class="summary-bullet"><span class="bullet-arrow">→</span><span>' + bulletText + '</span></p>' +
            '</div>'
          : '') +
      '</div>' +
    '</summary>' +
    (hasExpand ? '<div class="card-expanded"><div class="divider"></div>' + sectionsHtml + '</div>' : '') +
    '</details>';
}

function renderSection(content) {
  switch (content.type) {
    case "text":
      return '<p>' + content.text + '</p>';
    case "list":
      return '<ul class="bullet-list">' + content.items.map(function(item) { return '<li>' + item + '</li>'; }).join('') + '</ul>';
    case "star":
      return '<div class="star-block">' +
        content.items.map(function(item) {
          return '<div class="star-item"><span class="star-label">' + item.label + '</span><p>' + item.text + '</p></div>';
        }).join('') +
        '</div>';
    case "arc":
      return '<div class="arc-block">' +
        content.items.map(function(item) {
          return '<div class="arc-item"><span class="arc-label">' + item.label + '</span><p>' + item.text + '</p></div>';
        }).join('') +
        '</div>';
    case "questions":
      return content.items.map(function(item) {
        return '<div class="question-item">' +
          '<p class="question-text">' + item.question + '</p>' +
          '<p class="question-intent">' + item.intent + '</p>' +
          '<ul class="answer-frames">' + item.answer_frames.map(function(frame) { return '<li>' + frame + '</li>'; }).join('') + '</ul>' +
          '</div>';
      }).join('');
    case "roles":
      return content.items.map(function(item) {
        return '<div class="role-item">' +
          '<span class="role-label">' + item.label + '</span>' +
          '<ul class="bullet-list">' + item.items.map(function(entry) { return '<li>' + entry + '</li>'; }).join('') + '</ul>' +
          '</div>';
      }).join('');
    default:
      return '';
  }
}

function createCardHtml(card, index) {
  var tagsHtml = card.tags.map(function(tag, tagIndex) {
    return '<span class="tag" data-card-index="' + index + '" data-tag-index="' + tagIndex + '" onclick="editTag(event,' + index + ',' + tagIndex + ')">' +
      tag +
      '<span class="delete-tag" onclick="deleteTag(event,' + index + ',' + tagIndex + ')">×</span>' +
      '</span>';
  }).join('') + '<span class="add-tag" data-card-index="' + index + '" onclick="addTag(' + index + ')">+</span>';

  var sourceLinks = Array.isArray(card.source_link)
    ? card.source_link
    : card.source_link ? [card.source_link] : [];

  var sourceLinkHtml = sourceLinks.length
    ? '<div class="link-row">' +
      sourceLinks.map(function(link, linkIndex) {
        return '<a class="source-link" href="' + link + '" target="_blank" rel="noreferrer">View Source ' + (sourceLinks.length > 1 ? linkIndex + 1 : '') + ' ↗</a>';
      }).join('') +
      '</div>'
    : '';

  var sectionsHtml = card.sections.map(function(section) {
    return '<div class="section">' +
      '<div class="section-label">' + section.label + '</div>' +
      '<div class="section-body">' + renderSection(section.content) + '</div>' +
      '</div>';
  }).join('');

  return '<details class="card" draggable="true" data-index="' + index + '" ondragstart="dragStart(event)" ondragover="dragOver(event)" ondrop="drop(event)" ondragend="dragEnd(event)">' +
    '<summary>' +
      '<div class="card-header">' +
        '<div class="card-title-row">' +
          '<h2 class="card-title" onclick="editTitle(event,' + index + ')">' + card.title + '</h2>' +
          '<span class="chevron">›</span>' +
        '</div>' +
        '<div class="tags">' + tagsHtml + '</div>' +
      '</div>' +
      '<div class="card-preview">' +
        '<p class="summary-text" onclick="editSummary(event,' + index + ')">' + card.summary_text + '</p>' +
        '<p class="summary-bullet"><span class="bullet-arrow">→</span><span onclick="editBullet(event,' + index + ')">' + card.summary_bullet.slice(2) + '</span></p>' +
        sourceLinkHtml +
      '</div>' +
    '</summary>' +
    '<div class="card-expanded"><div class="divider"></div>' + sectionsHtml + '</div>' +
    '</details>';
}

// ── Home Page ──
function renderPage() {
  document.querySelector(".page-header h1").textContent = portfolioData.page_header.title;
  document.querySelector(".page-header p").textContent = portfolioData.page_header.subtitle;
  var container = document.getElementById("cards-container");
  container.innerHTML = portfolioData.cards.map(function(card, index) {
    return isEditMode ? createCardHtml(card, index) : createDisplayCardHtml(card, index);
  }).join('');
}

// ── Drag & Drop ──
var draggedIndex = null;

function dragStart(event) {
  var card = event.currentTarget;
  draggedIndex = parseInt(card.dataset.index, 10);
  card.classList.add("dragging");
}

function dragOver(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  var card = event.currentTarget;
  card.classList.remove("dragging");
  var afterElement = getDragAfterElement(event.clientY);
  var insertIndex;
  if (afterElement == null) {
    insertIndex = portfolioData.cards.length - 1;
  } else {
    insertIndex = parseInt(afterElement.dataset.index, 10);
    if (insertIndex > draggedIndex) {
      insertIndex--;
    }
  }
  if (draggedIndex !== null && draggedIndex !== insertIndex) {
    var removed = portfolioData.cards.splice(draggedIndex, 1)[0];
    portfolioData.cards.splice(insertIndex, 0, removed);
    updateDatabase(portfolioData);
    renderPage();
  }
}

function dragEnd(event) {
  event.target.classList.remove("dragging");
  draggedIndex = null;
}

function getDragAfterElement(y) {
  var draggableElements = Array.from(document.querySelectorAll(".card:not(.dragging)"));
  return draggableElements.reduce(function(closest, child) {
    var box = child.getBoundingClientRect();
    var offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ── Editing ──
function editTitle(event, index) {
  var titleEl = event.target;
  var currentText = titleEl.textContent;
  var input = document.createElement("input");
  input.className = "edit-input";
  input.value = currentText;
  input.onblur = function() {
    portfolioData.cards[index].title = input.value;
    updateDatabase(portfolioData);
    renderPage();
  };
  input.onkeydown = function(e) {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") { input.value = currentText; input.blur(); }
  };
  titleEl.replaceWith(input);
  input.focus();
}

function editSummary(event, index) {
  var summaryEl = event.target;
  var currentText = summaryEl.textContent;
  var input = document.createElement("textarea");
  input.className = "edit-input";
  input.value = currentText;
  input.rows = 3;
  input.onblur = function() {
    portfolioData.cards[index].summary_text = input.value;
    updateDatabase(portfolioData);
    renderPage();
  };
  input.onkeydown = function(e) {
    if (e.key === "Enter" && e.ctrlKey) input.blur();
    if (e.key === "Escape") { input.value = currentText; input.blur(); }
  };
  summaryEl.replaceWith(input);
  input.focus();
}

function editBullet(event, index) {
  var bulletEl = event.target;
  var currentText = bulletEl.textContent;
  var input = document.createElement("input");
  input.className = "edit-input";
  input.value = currentText;
  input.onblur = function() {
    portfolioData.cards[index].summary_bullet = "→ " + input.value;
    updateDatabase(portfolioData);
    renderPage();
  };
  input.onkeydown = function(e) {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") { input.value = currentText; input.blur(); }
  };
  bulletEl.replaceWith(input);
  input.focus();
}

// ── Tags ──
function editTag(event, cardIndex, tagIndex) {
  var tagEl = event.target.closest(".tag");
  var currentText = tagEl.textContent.replace("×", "").trim();
  var input = document.createElement("input");
  input.className = "edit-input";
  input.value = currentText;
  input.onblur = function() {
    if (input.value.trim()) {
      portfolioData.cards[cardIndex].tags[tagIndex] = input.value.trim();
    }
    updateDatabase(portfolioData);
    renderPage();
  };
  input.onkeydown = function(e) {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") { input.value = currentText; input.blur(); }
  };
  tagEl.replaceWith(input);
  input.focus();
}

function deleteTag(event, cardIndex, tagIndex) {
  event.stopPropagation();
  portfolioData.cards[cardIndex].tags.splice(tagIndex, 1);
  updateDatabase(portfolioData);
  renderPage();
}

function addTag(cardIndex) {
  var newTag = prompt("Enter new tag:");
  if (newTag && newTag.trim()) {
    portfolioData.cards[cardIndex].tags.push(newTag.trim());
    updateDatabase(portfolioData);
    renderPage();
  }
}

// ── Init ──
listenToPortfolio(
  function() { renderPage(); },
  function(err) {
    document.getElementById("cards-container").innerHTML =
      '<pre>Failed to sync Firestore: ' + err.message + '</pre>';
  }
);

var isInitialAuthCheck = true;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    enterEditMode();
  } else {
    // Capture route BEFORE exitEditMode, and only show modal on the first check
    // (not on explicit logout, where logout() already pushed '/' before signOut)
    var onEditRoute = isInitialAuthCheck && detectEditRoute();
    exitEditMode();
    if (onEditRoute) showLoginModal();
  }
  isInitialAuthCheck = false;
});
