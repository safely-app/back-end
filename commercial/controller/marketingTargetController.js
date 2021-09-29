import express from 'express';
import _ from "lodash";
import { MarketingTarget } from '../database/models';
import { validateMarketingTarget, putValidateMarketingTarget } from '../store/validation';
import { needToBeAdmin, marketingTargetUserCheck, needToBeLogin } from '../store/middleware';

export const MarketingTargetController = express.Router();

MarketingTargetController.get('/', needToBeAdmin, async (req, res) => {
    MarketingTarget.find({}, function(err, targets) {
        let targetsMap = [];

        targets.forEach((target) => {

            let PickedMarketingTarget = _.pick(target, [
            '_id', 'ownerId', 'name', 'csp', 'ageRange']);
            PickedMarketingTarget.interests = target.interests;
            targetsMap.push(PickedMarketingTarget);
        });
        res.status(200).send(targetsMap);
    });
});

MarketingTargetController.put('/:id', marketingTargetUserCheck, async (req, res, next) => {
    const { error } = putValidateMarketingTarget(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    const newBody = req.body;

    if (newBody._id)
        delete newBody._id   

    MarketingTarget.findByIdAndUpdate(req.params.id, newBody, (err) => {
        if (err)
            return res.status(403).json({error: 'Update couldn\'t be proceed'})
        return res.status(200).json({success: 'Updated!'})
    })
});

MarketingTargetController.post('/', needToBeLogin, async (req, res) => {
    const { error } = validateMarketingTarget(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    let marketingTarget = new MarketingTarget(_.pick(req.body, [
        'ownerId','name','csp', 'ageRange']));

    marketingTarget.interests = req.body.interests;
    await marketingTarget.save();
    res.status(201).send(marketingTarget);
});

MarketingTargetController.delete('/:id', marketingTargetUserCheck, async (req, res) => {
    MarketingTarget.deleteOne({_id: req.params.id})
      .then(()=> {
        res.status(200).json({ message: 'Marketing target deleted !' });
      })
      .catch( (error) => {
        res.status(400).json({ error: error });
      });
});