import { MarketingTarget } from "../database/models";
import cote from "cote";

const requester = new cote.Requester({
    name: 'authentification'
});

async function ownerOrAdmin(ownerId, jwt)
{
    const request = { type: 'ownerOrAdmin', ownerId: ownerId, jwt: jwt};
    return await requester.send(request);
}

export async function marketingTargetUserCheck(req, res, next) {
    const marketingTarget = await MarketingTarget.findOne({_id: req.params.id});
    req.middleware_values = marketingTarget
    req.middleware_values._id = marketingTarget.ownerId

    const usertoken = req.headers.authorization;
    let token = null;

    if (usertoken) {
      token = usertoken.split(' ');
    } else {
        return res.status(500).json({ error: 'bad token'})
    }
    const response = await ownerOrAdmin(marketingTarget.ownerId, token[1]);
    if (response.status === false)
        return res.status(500).json({ error: response.error});
    next();
} 