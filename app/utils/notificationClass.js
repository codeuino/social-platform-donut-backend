module.exports = class Notification {
  constructor (heading = '', content = '', tag = '') {
    this.pushNotification(heading, content, tag)
  }

  pushNotification (heading, content, tag) {
    const notification = {
      heading: heading,
      content: content,
      tag: tag
    }
    return notification
  }
}
