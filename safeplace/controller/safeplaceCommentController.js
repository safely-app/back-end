import express from 'express';
import { Safeplace, SafeplaceComment } from "../database/models/";
import { validateSafeplaceCommentCreation, validateSafeplaceCommentModification } from "../store/validation";
import {AuthOrAdmin, requestAuth, SafeplaceCommentUserCheck} from "../store/middleware";

export const SafeplaceCommentController = express.Router();

SafeplaceCommentController.get("/", requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const comments = await SafeplaceComment.find({});

  if (comments)
    res.status(200).json(comments);
  else
    res.status(500).json({message: "No comments found"});
})

SafeplaceCommentController.get("/:userId", requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const comments = await SafeplaceComment.find({userId: req.params.userId})

  if (comments)
    res.status(200).json(comments);
  else
    res.status(500).json({message: "No comments found"});
})

SafeplaceCommentController.get("/best/:number", requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const comments = await SafeplaceComment.find({})

  comments.sort((a,b) => (a.grade > b.grade) ? -1 : ((b.grade > a.grade) ? 1 : 0));

  console.log(comments.slice(0, req.params.number));

  if (comments)
    res.status(200).json(comments.slice(0, req.params.number));
  else
    res.status(500).json({message: "No comments found"});
})

SafeplaceCommentController.get("/best/:safeplaceId/:number", requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const comments = await SafeplaceComment.find({safeplaceId: req.params.safeplaceId})

  comments.sort((a,b) => (a.grade > b.grade) ? -1 : ((b.grade > a.grade) ? 1 : 0));

  console.log(comments.slice(0, req.params.number));

  if (comments)
    res.status(200).json(comments.slice(0, req.params.number));
  else
    res.status(500).json({message: "No comments found"});
})

SafeplaceCommentController.get("/worst/:number", requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const comments = await SafeplaceComment.find({})

  comments.sort((a,b) => (a.grade > b.grade) ? 1 : ((b.grade > a.grade) ? -1 : 0));

  if (comments)
    res.status(200).json(comments.slice(0, req.params.number));
  else
    res.status(500).json({message: "No comments found"});
})

SafeplaceCommentController.get("/worst/:safeplaceId/:number", requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const comments = await SafeplaceComment.find({safeplaceId: req.params.safeplaceId})

  comments.sort((a,b) => (a.grade > b.grade) ? 1 : ((b.grade > a.grade) ? -1 : 0));

  if (comments)
    res.status(200).json(comments.slice(0, req.params.number));
  else
    res.status(500).json({message: "No comments found"});
})

SafeplaceCommentController.post("/", requestAuth, async (req, res) => {
  if (req.authResponse.role === 'empty')
    return res.status(401).json({message: "Unauthorized"})

  const { error } = validateSafeplaceCommentCreation(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message});
  }

  const comment = {
    userId: req.body.userId,
    safeplaceId: req.body.safeplaceId,
    comment: req.body.comment,
    grade: req.body.grade
  };

  Object.keys(comment).forEach(key => comment[key] === undefined ? delete comment[key] : {});

  Safeplace.findOne({_id: comment.safeplaceId})
    .then(async (found) => {
      if (found) {
        const created = await SafeplaceComment.create(comment);

        if (created)
          res.status(200).json({message: "Comment created"});
        else
          res.status(500).json({message: "An error occured"});
      } else
        res.status(403).json({message: "This safeplace doesn't exists"})
    })
})

SafeplaceCommentController.put("/:id", SafeplaceCommentUserCheck, requestAuth, AuthOrAdmin, async (req, res) => {
  if (req.authResponse.right === 'false')
    return res.status(401).json({message: "Unauthorized"})

  const { error } = validateSafeplaceCommentModification(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message});
  }

  const doc = {
    comment: req.body.comment,
    grade: req.body.grade
  };

  Object.keys(doc).forEach(key => doc[key] === undefined ? delete doc[key] : {});

  SafeplaceComment.findByIdAndUpdate(req.params.id, doc, (err) => {
    if (err)
      return res.status(403).json({error: 'Update couldn\'t be proceed'})
    return res.status(200).json({success: 'Updated!'})
  })
})

SafeplaceCommentController.delete("/:id", SafeplaceCommentUserCheck, requestAuth, AuthOrAdmin, async (req, res) => {
  if (req.authResponse.right === 'false')
    return res.status(401).json({message: "Unauthorized"})

  SafeplaceComment.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(200).json({ message: 'Comment deleted !' });
    })
    .catch((error) => {
      res.status(400).json({error: error});
    })
})