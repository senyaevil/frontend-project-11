export default class Updater {
  constructor(app, interval = 5000) {
    this.app = app
    this.interval = interval
    this.timeoutId = null
    this.isUpdating = false
  }

  start() {
    this.scheduleUpdate()
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  scheduleUpdate() {
    this.timeoutId = setTimeout(() => {
      this.updateFeeds()
    }, this.interval)
  }

  updateFeeds() {
    if (this.isUpdating || this.app.feeds.length === 0) {
      this.scheduleUpdate()
      return
    }
    this.isUpdating = true
    const updatePromises = this.app.feeds.map((feedUrl, index) =>
      this.updateFeed(feedUrl, index),
    )
    Promise.allSettled(updatePromises)
      .finally(() => {
        this.isUpdating = false
        this.scheduleUpdate()
      })
  }

  updateFeed(feedUrl, feedIndex) {
    return this.app.fetchRSS(feedUrl)
      .then(content => this.app.parseRSS(content))
      .then(({ posts }) => {
        const newPosts = this.findNewPosts(posts, feedIndex)
        if (newPosts.length > 0) {
          this.app.addNewPosts(newPosts, feedIndex)
        }
      })
      .catch((error) => {
        console.error(`Error updating feed ${feedUrl}:`, error)
      })
  }

  findNewPosts(fetchedPosts, feedIndex) {
    const existingPosts = this.app.getPostsByFeedIndex(feedIndex)
    const existingLinks = new Set(existingPosts.map(post => post.link))
    return fetchedPosts.filter(post => !existingLinks.has(post.link))
  }
}
