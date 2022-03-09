import fetch from 'node-fetch';
import { config } from '../store/config';

const eventsCost = {
    display: 0.1,
    view: 0.3,
    click: 0.5,
}

const authorizedEvents = ["click", "display", "view"];

// Get the right cost for the received event
// and send it to the commercial service.
export const sendAdEvent = async (event, campaign, authorization) => {
    if (!authorizedEvents.includes(event))
        return {error: "Event not authorized."};

    const url = process.env.NODE_ENV === 'production' ? config.prod.commercialURL : config.dev.commercialURL;
    const conf = {
        method: 'PUT',
        body: JSON.stringify({cost: eventsCost[event]}),
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