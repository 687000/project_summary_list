export function renderSection(content) {
  switch (content.type) {
    case "text":
      return `<p>${content.text}</p>`;
    case "list":
      return `<ul class="bullet-list">${content.items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
    case "star":
      return `
        <div class="star-block">
          ${content.items
            .map(
              (item) => `
            <div class="star-item">
              <span class="star-label">${item.label}</span>
              <p>${item.text}</p>
            </div>
          `,
            )
            .join("")}
        </div>
      `;
    case "arc":
      return `
        <div class="arc-block">
          ${content.items
            .map(
              (item) => `
            <div class="arc-item">
              <span class="arc-label">${item.label}</span>
              <p>${item.text}</p>
            </div>
          `,
            )
            .join("")}
        </div>
      `;
    case "questions":
      return content.items
        .map(
          (item) => `
          <div class="question-item">
            <p class="question-text">${item.question}</p>
            <p class="question-intent">${item.intent}</p>
            <ul class="answer-frames">${item.answer_frames.map((frame) => `<li>${frame}</li>`).join("")}</ul>
          </div>
        `,
        )
        .join("");
    case "roles":
      return content.items
        .map(
          (item) => `
          <div class="role-item">
            <span class="role-label">${item.label}</span>
            <ul class="bullet-list">${item.items.map((entry) => `<li>${entry}</li>`).join("")}</ul>
          </div>
        `,
        )
        .join("");
    default:
      return "";
  }
}

export function createCardHtml(card, index) {
  const tagsHtml =
    card.tags
      .map(
        (tag, tagIndex) =>
          `<span class="tag" data-card-index="${index}" data-tag-index="${tagIndex}" onclick="editTag(event, ${index}, ${tagIndex})">${tag}<span class="delete-tag" onclick="deleteTag(event, ${index}, ${tagIndex})">×</span></span>`,
      )
      .join("") +
    `<span class="add-tag" data-card-index="${index}" onclick="addTag(${index})">+</span>`;

  const sourceLinks = Array.isArray(card.source_link)
    ? card.source_link
    : card.source_link
      ? [card.source_link]
      : [];

  const sourceLinkHtml = sourceLinks.length
    ? `<div class="link-row">
        ${sourceLinks
          .map(
            (link, linkIndex) =>
              `<a class="source-link" href="${link}" target="_blank" rel="noreferrer">View Source ${sourceLinks.length > 1 ? linkIndex + 1 : ""} ↗</a>`,
          )
          .join("")}
      </div>`
    : "";

  const sectionsHtml = card.sections
    .map(
      (section) => `
        <div class="section">
          <div class="section-label">${section.label}</div>
          <div class="section-body">${renderSection(section.content)}</div>
        </div>
      `,
    )
    .join("");

  return `
    <details class="card" draggable="true" data-index="${index}" ondragstart="dragStart(event)" ondragover="dragOver(event)" ondrop="drop(event)" ondragend="dragEnd(event)">
      <summary>
        <div class="card-header">
          <div class="card-title-row">
            <h2 class="card-title" onclick="editTitle(event, ${index})">${card.title}</h2>
            <span class="chevron">›</span>
          </div>
          <div class="tags">${tagsHtml}</div>
        </div>
        <div class="card-preview">
          <p class="summary-text" onclick="editSummary(event, ${index})">${card.summary_text}</p>
          <p class="summary-bullet"><span class="bullet-arrow">→</span><span onclick="editBullet(event, ${index})">${card.summary_bullet.slice(2)}</span></p>
          ${sourceLinkHtml}
        </div>
      </summary>
      <div class="card-expanded">
        <div class="divider"></div>
        ${sectionsHtml}
      </div>
    </details>
  `;
}
