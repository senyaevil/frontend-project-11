// src/view.js
import onChange from 'on-change';
import i18n from 'i18next';
import { Modal } from 'bootstrap';

export default class View {
  constructor() {
    this.form = document.getElementById('rss-form');
    this.input = this.form.querySelector('input[name="url"]');
    this.submitButton = this.form.querySelector('button[type="submit"]');
    this.feedback = document.createElement('div');
    
    this.feedback.className = 'feedback mt-2 small';
    this.form.appendChild(this.feedback);
    
    this.createContainers();
    this.createModal();
    
    this.state = onChange({
      error: 'initial', // Начальное состояние не null
      valid: true,
      processed: false,
      feeds: [],
      posts: [],
      loading: false,
      readPosts: new Set()
    }, this.render.bind(this));
    
    this.modal = null;
  }

  createModal() {
    const modalHTML = `
      <div class="modal fade" id="postModal" tabindex="-1" aria-labelledby="postModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="postModalLabel"></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div id="postDescription"></div>
            </div>
            <div class="modal-footer">
              <a href="#" class="btn btn-primary" id="postLink" target="_blank" rel="noopener noreferrer">${i18n.t('ui.readFull')}</a>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${i18n.t('ui.close')}</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.modal = new Modal(document.getElementById('postModal'));
  }

  createContainers() {
    const container = document.querySelector('.container-fluid');
    
    this.feedsContainer = document.createElement('div');
    this.feedsContainer.className = 'mt-5';
    this.feedsContainer.innerHTML = `
      <div class="row justify-content-center">
        <div class="col-md-6">
          <h2 class="h4">${i18n.t('ui.feeds')}</h2>
          <div id="feeds-list" class="list-group"></div>
        </div>
      </div>
    `;
    
    this.postsContainer = document.createElement('div');
    this.postsContainer.className = 'mt-4';
    this.postsContainer.innerHTML = `
      <div class="row justify-content-center">
        <div class="col-md-6">
          <h2 class="h4">${i18n.t('ui.posts')}</h2>
          <div id="posts-list" class="list-group"></div>
        </div>
      </div>
    `;
    
    container.appendChild(this.feedsContainer);
    container.appendChild(this.postsContainer);
  }

  render(path, value) {
    console.log('View render:', path, value);
    
    if (path === 'error') {
      this.handleError(value);
    }
    
    if (path === 'valid') {
      this.handleValidation(value);
    }
    
    if (path === 'processed' && value) {
      this.handleProcessed();
    }
    
    if (path === 'feeds') {
      this.renderFeeds();
    }
    
    if (path === 'posts' || path === 'readPosts') {
      this.renderPosts();
    }
    
    if (path === 'loading') {
      this.handleLoading(value);
    }
  }

  handleError(error) {
    console.log('Handle error:', error);
    
    // Очищаем предыдущие классы
    this.feedback.className = 'feedback mt-2 small';
    
    if (error && error !== 'initial') {
      this.feedback.textContent = i18n.t(`errors.${error}`);
      this.feedback.classList.add('text-danger');
    } else if (error === null) {
      // Когда error = null, показываем успешное сообщение
      this.feedback.textContent = i18n.t('ui.success');
      this.feedback.classList.add('text-success');
    } else {
      // initial state - очищаем сообщение
      this.feedback.textContent = '';
    }
  }

  handleValidation(valid) {
    this.input.classList.toggle('is-invalid', !valid);
    this.input.classList.toggle('is-valid', valid);
  }

  handleProcessed() {
    this.input.value = '';
    this.input.focus();
    this.state.valid = true;
    this.state.processed = false;
  }

  handleLoading(loading) {
    this.submitButton.disabled = loading;
    this.submitButton.textContent = loading ? 'Загрузка...' : i18n.t('ui.submit');
  }

  renderFeeds() {
    const feedsList = document.getElementById('feeds-list');
    if (!feedsList) return;
    
    feedsList.innerHTML = '';
    
    this.state.feeds.forEach(feed => {
      const feedElement = document.createElement('div');
      feedElement.className = 'list-group-item';
      feedElement.innerHTML = `
        <h3 class="h6">${feed.title}</h3>
        <p class="mb-0 small">${feed.description}</p>
      `;
      feedsList.appendChild(feedElement);
    });
  }

  renderPosts() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;
    
    postsList.innerHTML = '';
    
    const sortedPosts = [...this.state.posts].sort((a, b) => b.id - a.id);
    
    sortedPosts.forEach(post => {
      const isRead = this.state.readPosts.has(post.id);
      const postElement = this.createPostElement(post, isRead);
      postsList.appendChild(postElement);
    });
  }

  createPostElement(post, isRead) {
    const postElement = document.createElement('div');
    postElement.className = 'list-group-item d-flex justify-content-between align-items-start';
    
    const titleClass = isRead ? 'fw-normal' : 'fw-bold';
    
    postElement.innerHTML = `
      <div class="flex-grow-1">
        <a href="${post.link}" class="${titleClass} text-decoration-none" target="_blank" rel="noopener noreferrer">
          ${post.title}
        </a>
      </div>
      <div class="btn-group ms-3">
        <button type="button" class="btn btn-outline-primary btn-sm preview-btn" data-post-id="${post.id}">
          ${i18n.t('ui.preview')}
        </button>
        <a href="${post.link}" class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">
          ${i18n.t('ui.read')}
        </a>
      </div>
    `;
    
    const previewBtn = postElement.querySelector('.preview-btn');
    previewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.handlePreviewClick(post);
    });
    
    return postElement;
  }

  handlePreviewClick(post) {
    this.showModal(post);
    this.markAsRead(post.id);
  }

  showModal(post) {
    const modalTitle = document.getElementById('postModalLabel');
    const modalDescription = document.getElementById('postDescription');
    const modalLink = document.getElementById('postLink');
    
    modalTitle.textContent = post.title;
    modalDescription.textContent = post.description || 'Описание отсутствует';
    modalLink.href = post.link;
    
    this.modal.show();
  }

  markAsRead(postId) {
    this.state.readPosts.add(postId);
  }

  setError(message) {
    this.state.error = message;
    this.state.valid = false;
  }

  setValid() {
    this.state.error = null;
    this.state.valid = true;
  }

  markProcessed() {
    this.state.processed = true;
  }

  addFeed(feed) {
    this.state.feeds.push({ ...feed, id: Date.now() });
  }

  addPosts(posts) {
    this.state.posts = [...this.state.posts, ...posts];
  }

  setLoading(loading) {
    this.state.loading = loading;
  }
}