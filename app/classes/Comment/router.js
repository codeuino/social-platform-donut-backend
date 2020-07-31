const { auth, isUnderMaintenance } = require('../../middleware')
const Controller = require('./controller')
const express = require('express')

// class Controller - Abstract Class - cannot be instantiated
//   public - accessible to inheriting classes
//     getRouter()
//   private
//     router
//     controllers
//     routerInitialized

class Router extends Controller {
  #router = express.Router()

  #controllers = this.getControllers()

  // IIFE
  #routerInitialized = (() => {
    // GET COMMENT BY POST ID
    this.#router.get('/:id', isUnderMaintenance, auth, this.#controllers.getCommentByPost)

    // CREATE COMMENT
    this.#router.post('/:id', isUnderMaintenance, auth, this.#controllers.comment)

    // UPDATE COMMENT BY ID
    this.#router.patch('/:id', isUnderMaintenance, auth, this.#controllers.update)

    // UPVOTE COMMENT BY COMMENT ID
    this.#router.patch('/upvote/:id', isUnderMaintenance, auth, this.#controllers.upvote)

    // DOWNVOTE COMMENT BY COMMENT ID
    this.#router.patch('/downvote/:id', isUnderMaintenance, auth, this.#controllers.downvote)

    // DELETE COMMENT BY ID
    this.#router.delete('/:id', isUnderMaintenance, auth, this.#controllers.delete)

    return true
  })()

  getRouter () {
    return this.#router
  }
}

module.exports = Router
