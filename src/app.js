// src/app.js
import View from './view.js';
import Validator from './validator.js';
import Updater from './updater.js';
import { createRssSchema } from './schema.js';
import { fetchRSS } from './api.js';
import { parseRSS } from './parser.js';
import initI18n from './i18n.js';

export default class App {
  constructor() {
    this.view = null;
    this.updater = null;
    this.feeds = [];
    this.feedData = [];
    this.posts = [];
    
    initI18n().then(() => {
      this.init();
    });
  }

  init() {
    this.view = new View();
    this.updater = new Updater(this);
    
    this.view.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  handleSubmit() {
    const url = this.view.input.value.trim();
    
    if (!url) {
      this.view.setError('required');
      return;
    }
    
    const validator = new Validator(createRssSchema(this.feeds));
    
    this.view.setLoading(true);
    
    validator.validate(url)
      .then((result) => {
        if (result.isValid) {
          this.view.setValid();
          return this.addFeed(url);
        } else {
          this.view.setError(Object.values(result.errors)[0]);
          return Promise.reject(new Error('Validation failed'));
        }
      })
      .then(() => {
        this.view.markProcessed();
        this.view.setError(null);
        
        if (this.feeds.length === 1) {
          this.updater.start();
        }
      })
      .catch((error) => {
        if (error.message !== 'Validation failed') {
          this.view.setError(this.getErrorMessage(error));
        }
      })
      .finally(() => {
        this.view.setLoading(false);
      });
  }

  addFeed(url) {
    return this.fetchRSS(url)
      .then((content) => this.parseRSS(content))
      .then(({ feed, posts }) => {
        const feedId = Date.now();
        
        this.feeds.push(url);
        this.feedData.push({
          id: feedId,
          url,
          title: feed.title,
          description: feed.description,
          postLinks: posts.map(post => post.link)
        });
        
        const postsWithFeedId = posts.map(post => ({
          ...post,
          id: Date.now() + Math.random(),
          feedId,
          description: post.description || ''
        }));
        
        this.posts = [...this.posts, ...postsWithFeedId];
        
        this.view.addFeed(feed);
        this.view.addPosts(postsWithFeedId);
      });
  }

  addNewPosts(newPosts, feedIndex) {
    const feed = this.feedData[feedIndex];
    const postsWithFeedId = newPosts.map(post => ({
      ...post,
      id: Date.now() + Math.random(),
      feedId: feed.id,
      description: post.description || ''
    }));
    
    feed.postLinks = [...feed.postLinks, ...newPosts.map(post => post.link)];
    this.posts = [...this.posts, ...postsWithFeedId];
    this.view.addPosts(postsWithFeedId);
  }

  getPostsByFeedIndex(feedIndex) {
    const feed = this.feedData[feedIndex];
    return this.posts.filter(post => post.feedId === feed.id);
  }

  fetchRSS(url) {
    return fetchRSS(url);
  }

  parseRSS(content) {
    return parseRSS(content);
  }

  getErrorMessage(error) {
    if (error.message.includes('Network')) {
      return 'network';
    } else if (error.message.includes('RSS')) {
      return 'rss';
    }
    return 'unknown';
  }

  destroy() {
    if (this.updater) {
      this.updater.stop();
    }
  }
}