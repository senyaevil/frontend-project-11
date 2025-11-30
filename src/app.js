// src/app.js
import View from './view.js';
import Validator from './validator.js';
import { createRssSchema } from './schema.js';
import { fetchRSS } from './api.js';
import { parseRSS } from './parser.js';
import initI18n from './i18n.js';

export default class App {
  constructor() {
    this.view = null;
    this.feeds = [];
    this.feedData = [];
    this.posts = [];
    
    initI18n().then(() => {
      this.init();
    });
  }

  init() {
    this.view = new View();
    
    this.view.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  handleSubmit() {
    const url = this.view.input.value.trim();
    
    this.view.setLoading(true);
    this.view.setError(null);

    const validator = new Validator(createRssSchema(this.feeds));
    
    validator.validate(url)
      .then((result) => {
        console.log('Validation result:', result);
        if (!result.isValid) {
          this.view.setError(result.errors._form);
          return Promise.reject(new Error('Validation failed'));
        }
        return this.addFeed(url);
      })
      .then(() => {
        console.log('Feed added successfully');
        this.view.setSuccess();
        this.view.markProcessed();
      })
      .catch((error) => {
        console.error('Submit error:', error.message);
        if (error.message !== 'Validation failed') {
          this.view.setError(this.getErrorMessage(error));
        }
      })
      .finally(() => {
        this.view.setLoading(false);
      });
  }

  addFeed(url) {
    return fetchRSS(url)
      .then((content) => {
        const { feed, posts } = parseRSS(content);
        console.log('Loaded posts:', posts);
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
        
        return Promise.resolve();
      });
  }

  getErrorMessage(error) {
    if (error.message.includes('Network')) {
      return 'errors.network';
    } else if (error.message.includes('RSS') || error.message.includes('Invalid RSS')) {
      return 'errors.rss';
    }
    return 'errors.unknown';
  }
}
