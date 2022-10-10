import { MarketingTarget, Campaign, Advertising, Notifications, Modif } from "../database/models";
import { config } from "./config";
import cote from "cote";

const requester = new cote.Requester({
    name: 'authentification',
    key: config.dev.communicationKEY,
});

async function ownerOrAdmin(ownerId, jwt)
{
    const request = { type: 'owner or admin', ownerId: ownerId, jwt: jwt};
    return await requester.send(request);
}

export async function needToBeLogin(req, res, next) {
    const request = { type: 'owner or admin', ownerId: "", jwt: req.headers.authorization};
    const response = await requester.send(request);
    req.middleware_log_response = response;
    console.log(response)
    if (response.role === "empty")
        return res.status(500).json({ error: "You need to be login"});
    next();
}

export async function needToBeAdmin(req, res, next) {
    const request = { type: 'owner or admin', ownerId: "", jwt: req.headers.authorization};
    const response = await requester.send(request);
    console.log(request, response)
    if (response.right === "false" || response.right === "no")
        return res.status(401).json({ error: "Unauthorized"});
    next();
}

export async function UserCheckOwnerOrAdmin(req, res, next) {
    const userId = req.params.id;
    const usertoken = req.headers.authorization;
    const response = await ownerOrAdmin(userId, usertoken);

    console.log(response)
    if (response.right === "false" || response.right === "no")
        return res.status(401).json({ error: "Unauthorized"});
    next();
}

export async function CampaignUserCheck(req, res, next) {
    const campaign = await Campaign.findOne({_id: req.params.id});

	if(!campaign)
		return res.status(500).json({ error: "Campaign not found."});
    req.middleware_values = campaign
    req.middleware_values._id = campaign.ownerId

    const usertoken = req.headers.authorization;
    console.log(campaign)
    const response = await ownerOrAdmin(campaign.ownerId, usertoken);
    console.log(campaign.ownerId, usertoken)
    console.log(response)
    if (response.right === "false" || response.right === "no")
        return res.status(401).json({ error: "Unauthorized"});
    next();
} 

export async function marketingTargetUserCheck(req, res, next) {
    const marketingTarget = await MarketingTarget.findOne({_id: req.params.id});
    req.middleware_values = marketingTarget
    req.middleware_values._id = marketingTarget.ownerId

    const usertoken = req.headers.authorization;
    const response = await ownerOrAdmin(marketingTarget.ownerId, usertoken);
    if (response.right === "false"|| response.right === "no")
        return res.status(401).json({ error: "Unauthorized"});
    next();
}

export async function AdvertisingUserCheck(req, res, next) {
    try {
        const advertising = await Advertising.findOne({_id: req.params.id});
        req.middleware_values = advertising
        req.middleware_values._id = advertising.ownerId

        const usertoken = req.headers.authorization;
        const response = await ownerOrAdmin(advertising.ownerId, usertoken);
        if (response.right === "false"|| response.right === "no")
            return res.status(401).json({ error: "Unauthorized"});
        next();
    } catch {
        return res.status(404).json({error: "Advertising not found"});
    }
}

export async function AdvertisingOwnerCheck(req, res, next) {
    try {
        const advertising = await Advertising.findOne({ownerId: req.params.id});
        console.log(advertising)
        req.middleware_values = advertising
        req.middleware_values._id = advertising.ownerId

        const usertoken = req.headers.authorization;
        const response = await ownerOrAdmin(advertising.ownerId, usertoken);
        if (response.right === "false"|| response.right === "no")
            return res.status(401).json({ error: "Unauthorized"});
        next();
    } catch {
        return res.status(404).json({error: "Advertising not found"});
    }
}

export async function AdvertisingCampaignCheck(req, res, next) {
    try {
        const advertising = await Advertising.findOne({campaignId: req.params.id});

        req.middleware_values = advertising
        req.middleware_values._id = advertising.ownerId

        const usertoken = req.headers.authorization;
        const response = await ownerOrAdmin(advertising.ownerId, usertoken);

        if (response.right === "false"|| response.right === "no")
            return res.status(401).json({ error: "Unauthorized"});
        next();
    } catch {
        return res.status(404).json({error: "Advertising not found"});
    }
}

export async function NotificationsUserCheck(req, res, next) {
    try {
        const notifications = await Notifications.findOne({_id: req.params.id});
        req.middleware_values = notifications
        req.middleware_values._id = notifications.ownerId

        const usertoken = req.headers.authorization;
        const response = await ownerOrAdmin(notifications.ownerId, usertoken);
        if (response.right === "false"|| response.right === "no")
            return res.status(401).json({ error: "Unauthorized"});
        next();
    } catch {
        return res.status(404).json({error: "Notifications not found"});
    }
}

export async function NotificationsOwnerCheck(req, res, next) {
    try {
        const notifications = await Notifications.findOne({ownerId: req.params.id});
        req.middleware_values = notifications
        req.middleware_values._id = notifications.ownerId

        const usertoken = req.headers.authorization;
        const response = await ownerOrAdmin(notifications.ownerId, usertoken);
        if (response.right === "false"|| response.right === "no")
            return res.status(401).json({ error: "Unauthorized"});
        next();
    } catch {
        return res.status(404).json({error: "Notifications not found"});
    }
} 

export async function ModifUserCheck(req, res, next) {
    try {
        const modif = await Modif.findOne({_id: req.params.id});
        req.middleware_values = modif
        req.middleware_values._id = modif.ownerId

        const usertoken = req.headers.authorization;
        const response = await ownerOrAdmin(modif.ownerId, usertoken);
        if (response.right === "false"|| response.right === "no")
            return res.status(401).json({ error: "Unauthorized"});
        next();
    } catch {
        return res.status(404).json({error: "Modif not found"});
    }
}

export async function ModifOwnerCheck(req, res, next) {
    try {
        const modif = await Modif.findOne({ownerId: req.params.id});
        console.log(modif)
        req.middleware_values = modif
        req.middleware_values._id = modif.ownerId

        const usertoken = req.headers.authorization;
        const response = await ownerOrAdmin(modif.ownerId, usertoken);
        if (response.right === "false"|| response.right === "no")
            return res.status(401).json({ error: "Unauthorized"});
        next();
    } catch {
        return res.status(404).json({error: "Modif not found"});
    }
} 
