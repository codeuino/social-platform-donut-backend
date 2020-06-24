const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const proposalController = require("../controllers/proposal");

// Create a new proposal
router.post("/", auth, proposalController.createProposal);

// Save the content of a proposal
router.patch("/:proposalId", auth, proposalController.saveProposal);

// Attach file to the given proposal
router.post("/attach/:proposalId", auth, proposalController.attachFile);

// Get proposals by userId
router.get("/user/:userId", auth, proposalController.getByUserId);

// get proposal by proposalId
router.get("/:proposalId", auth, proposalController.getProposalById);

// Deletes a proposal by given proposalId
router.delete("/", auth, proposalController.deleteById);

// Update proposal state
router.patch("/change/:proposalId", auth, proposalController.changeState);

// Get all the proposals
router.post("/all", auth, proposalController.getAllProposals);

// Comment on the given proposal
router.post("/comment", auth, proposalController.commentOnProposal);

module.exports = router;
