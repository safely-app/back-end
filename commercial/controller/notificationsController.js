import express from 'express';
import _ from "lodash";
import { Notifications } from '../database/models';
import { NotificationsUserCheck, NotificationsOwnerCheck, needToBeAdmin, needToBeLogin } from '../store/middleware';
import { validateNotifications, putValidateNotifications } from '../store/validation';

export const NotificationsController = express.Router();

NotificationsController.get('/', needToBeLogin, async (req, res) => {

    Notifications.find({}, function(err, targets) {
        let notificationsMap = [];

        targets.forEach((target) => {

            let PickedNotifications = _.pick(target, [
                '_id', 'ownerId','title','description']);
            PickedNotifications.targets = target.targets;
            if (PickedNotifications.ownerId === req.middleware_log_response.userId) {
                notificationsMap.push(PickedNotifications);
            }
        });
        res.status(200).send(notificationsMap);
    });
});

NotificationsController.get('/:id', NotificationsUserCheck, async (req, res) => {
    let notifications = await Notifications.findOne({ _id: req.params.id });

    if (notifications) {
        const PickedNotifications = _.pick(notifications, [
            '_id', 'ownerId','title','description']);
    
        res.send(PickedNotifications);
    } else
        res.status(404).json({error: "Notifications not found"});
});

NotificationsController.put('/:id', NotificationsUserCheck, async (req, res) => {
    const { error } = putValidateNotifications(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    const newBody = req.body;

    if (newBody._id)
        delete newBody._id   

    Notifications.findByIdAndUpdate(req.params.id, newBody, (err) => {
        if (err)
            return res.status(403).json({error: 'Update couldn\'t be proceed'})
        return res.status(200).json({success: 'Updated!'})
    })
});

NotificationsController.post('/', needToBeLogin, async (req, res) => {
    const { error } = validateNotifications(req.body);

    if (error)
      return res.status(400).json({ error: error.details[0].message});
    let notifications = new Notifications(_.pick(req.body, [
        'ownerId','title','description']));
    await notifications.save();
    res.status(201).send(notifications);
});

NotificationsController.delete('/:id', NotificationsUserCheck, async (req, res) => {
    Notifications.deleteOne({_id: req.params.id})
      .then(()=> {
        res.status(200).json({ message: 'Notifications deleted !' });
      })
      .catch( (error) => {
        res.status(400).json({ error: error });
      });
});