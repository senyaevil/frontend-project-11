// src/view.js - метод createPostElement
createPostElement(post, isRead) {
  const postElement = document.createElement('div');
  postElement.className = 'list-group-item';
  
  const titleClass = isRead ? 'fw-normal' : 'fw-bold';
  
  // Простая структура без лишних оберток
  postElement.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
      <a href="${post.link}" class="${titleClass} me-3" target="_blank" rel="noopener noreferrer">
        ${post.title}
      </a>
      <div class="btn-group">
        <button type="button" class="btn btn-outline-primary btn-sm preview-btn" data-post-id="${post.id}">
          ${i18n.t('ui.preview')}
        </button>
        <a href="${post.link}" class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">
          ${i18n.t('ui.read')}
        </a>
      </div>
    </div>
  `;
  
  const previewBtn = postElement.querySelector('.preview-btn');
  previewBtn.addEventListener('click', (e) => {
    e.preventDefault();
    this.handlePreviewClick(post);
  });
  
  return postElement;
}
