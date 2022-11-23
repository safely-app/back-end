import express from "express";
import _ from "lodash";
import { RequestClaimSafeplace } from "../database/models";
import {
    validateUpdateRequestClaimSafeplace,
    validateCreateRequestClaimSafeplace
} from "../store/validation"
import {
    RequestClaimSafeplaceUserCheck,
    requestAuth,
    AuthOrAdmin
} from "../store/middleware"

export const RequestClaimSafeplaceController = express.Router();

RequestClaimSafeplaceController.post('/', requestAuth, async (req, res) => {
    try {
        const { error } = validateCreateRequestClaimSafeplace(req.body);
        if (error) {
          return res.status(403).json({ error: error.details[0].message});
        }

        const user = req.authResponse;

        if (user.userId) {
            let request = new RequestClaimSafeplace(_.pick(req.body, [
                'userId', 'adminId', 'adminComment', 'safeplaceId', 'safeplaceName', 'status', 'safeplaceDescription', 'userComment', 'coordinate']));
    
            if (!request.status || (user && user.role !== 'admin'))
                request.status = "Pending"
            
            if (!request.userId || (user && user.role !== 'admin'))
                request.userId = user.userId
    
            await request.save();
            res.status(201).send(request);
        } else
            return res.status(403).json({error: 'Can\'t proceed to your request'});
    } catch {
        return res.status(403).json({error: 'Can\'t proceed to your request'});
    }
});

RequestClaimSafeplaceController.get('/' , requestAuth, AuthOrAdmin, async (req, res) => {
    RequestClaimSafeplace.find({}, function(err, requests) {
        res.status(200).send(requests);
    });
});

RequestClaimSafeplaceController.get('/:id', RequestClaimSafeplaceUserCheck, requestAuth, AuthOrAdmin, async (req, res) => {
    if (req.middleware_values)
        res.status(200).send(req.middleware_values);
    else
        res.status(404).json({error: "Request / Claim safeplace not found"});
});

RequestClaimSafeplaceController.get('/ownerRequestClaim/:userId', requestAuth, async (req, res) => {
    if (req.authResponse.role === 'empty')
      return res.status(401).json({message: "Unauthorized"})
  
    RequestClaimSafeplace.find({ userId: req.params.userId}, function(err, requests) {
        if (requests !== undefined) {
            res.status(200).json(requests);
        } else {
            res.status(500).json({message: "No requests claim safeplace found for this owner"});
        }
    });
});

RequestClaimSafeplaceController.put('/:id', RequestClaimSafeplaceUserCheck, requestAuth, AuthOrAdmin, async (req, res)=> {
    const user = req.authResponse;
    let newBody = req.body;

    const { error } = validateUpdateRequestClaimSafeplace(req.body);
    if (error) {
        return res.status(403).json({ error: error.details[0].message});
    }

    if (user.role !== "admin")
        newBody = (({ status, safeplaceId, userId, adminId }) => ({ status, safeplaceId, userId, adminId }))(newBody);
    
    Object.keys(newBody).forEach(key => newBody[key] === undefined ? delete newBody[key] : {});
    RequestClaimSafeplace.findByIdAndUpdate(req.params.id, newBody, (err, requestClaimSafeplace) => {
        if (err)
            return res.status(403).json({error: 'Update couldn\'t be proceed'})
        return res.status(200).json({success: 'Updated!'})
    })
});


RequestClaimSafeplaceController.delete('/:id', RequestClaimSafeplaceUserCheck, requestAuth, AuthOrAdmin, async (req, res) => {
    try {
        RequestClaimSafeplace.deleteOne({_id: req.params.id})
            .then(()=> {
              res.status(200).json({ message: 'Request / Claiming deleted !' });
            })
            .catch( (error) => {
              res.status(400).json({ error: error });
            });
    } catch {
        return res.status(403).json({error: 'Can\'t proceed to your request'});
    }
});