import fetch from 'node-fetch';
import jwt_decode from "jwt-decode";
import { config } from '../store/config';
import { Pricing, PricingHistory } from '../database/models';

const AgeMatchingPrice = 0.1;

const cspCosts = {
	"csp--": 0.01,
	"csp-": 0.02,
	"csp": 0.06,
	"csp+": 0.11,
	"csp++": 0.21

}

//Get user marketing's informations.
const getuserTarget = async (authorization) => {
	var token = authorization.split(' ')[1];
	var decoded = jwt_decode(token);
	console.log(decoded._id);
	const url = process.env.NODE_ENV === 'production' ? config.prod.authenticateURL : config.dev.authenticateURL;
    const conf = {
        method: 'GET',
        headers: {
            'Authorization': authorization,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    const route = `user/${decoded._id}`;
    const response = await fetch(`${url}${route}`, conf);
	return await response.json();
}

//Get all the target informations from campaign0
const getCampaignTarget = async (campaign, authorization) => {

	const url = process.env.NODE_ENV === 'production' ? config.prod.commercialURL : config.dev.commercialURL;
    const conf = {
        method: 'GET',
        headers: {
            'Authorization': authorization,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    const route = `campaign/${campaign}`;
    const response = await fetch(`${url}${route}`, conf);
	return await response.json();

}

export const computeCost = async (event, campaign, authorization) => {
	let cost = await Pricing.findOne({costType: event});
	if (!cost)
        return {error: "Event not authorized."};

	let campaignInfo = await getCampaignTarget(campaign, authorization);	
	let userInfo = await getuserTarget(authorization);
	let FinalMatchingCost = 0;
	let matchingCostObject = {ageRange: 0, csp: 0, total: 0}
	if (campaignInfo && targets) {
		campaignInfo.targets.forEach(element => {
			let matchingCost = 0;
			const ageRange = element.ageRange.split('-');
			if (parseInt(userInfo.age) >= parseInt(ageRange[0]) && parseInt(userInfo.age) <= parseInt(ageRange[1])) {
				matchingCost += AgeMatchingPrice;
				matchingCostObject.ageRange += AgeMatchingPrice;
			}
			if (userInfo.csp == element.csp) {
				matchingCost += cspCosts[element.csp];
				matchingCostObject.csp += cspCosts[element.csp];
			}
			if (matchingCost > FinalMatchingCost)
				FinalMatchingCost = Number.parseFloat(matchingCost.toFixed(2));
		});
	}
	let totalCost = cost.price + FinalMatchingCost;
	let data = await sendAdEvent(event, campaign, authorization, totalCost);
	data.eventCost = cost.price;
	data.eventCostRatio = 0;
	data.totalCost = totalCost;
	matchingCostObject.total = FinalMatchingCost;
	data.matchingCost = matchingCostObject;
	data.userInfo = {age: userInfo.age, csp: userInfo.csp};
	return await data;
}

// Get the right cost for the received event
// and send it to the commercial service.
export const sendAdEvent = async (event, campaign, authorization, cost) => {
    const url = process.env.NODE_ENV === 'production' ? config.prod.commercialURL : config.dev.commercialURL;
    const conf = {
        method: 'PUT',
        body: JSON.stringify({cost: cost}),
        headers: {
            'Authorization': authorization,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
    const route = `campaign/cost/${campaign}`;
    const response = await fetch(`${url}${route}`, conf);
    return await response.json();
};

// Save the history of the received event with its cost.
export const saveCostHistory = async (data, campaignId, event) => {
	const costHistory = {
		campaignId: campaignId,
		eventType: event,
		userAge: data.userInfo.age,
		userCsp: data.userInfo.csp,
		eventCost: data.eventCost,
		totalCost: data.totalCost,
		matchingOn: []
	}
	if (data.matchingCost.total == 0)
		costHistory.matchingOn.push('none');
	else {
		data.matchingCost.ageRange > 0 ? costHistory.matchingOn.push("age") : null;
		data.matchingCost.csp > 0 ? costHistory.matchingOn.push("csp") : null;
	}
	await PricingHistory.create(costHistory);
}
