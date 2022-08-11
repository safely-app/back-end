import fetch from 'node-fetch';
import express from "express"
import * as hubspot from '@hubspot/api-client'
import * as dotenv from "dotenv";
const app = express()
const port = 3000

app.use(express.json())

dotenv.config();

const sleep = (milliseconds) => {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

app.post('/', async (req, res) => {
	let authorization = req.headers.authorization;
	let prospectList = req.body.list;
	let size = req.body.size;
	
	let result = await fetch("https://stargate-revenant.herokuapp.com/api/crm/graphql?q=getProspects", {
	"headers": {
		"accept": "*/*",
		"accept-language": "en-US,en;q=0.9",
		"authorization": authorization,
		"content-type": "application/json",
		"sec-fetch-dest": "empty",
		"sec-fetch-mode": "cors",
		"sec-fetch-site": "cross-site",
		"sec-gpc": "1",
		"Referer": "https://app.waalaxy.com/",
		"Referrer-Policy": "strict-origin-when-cross-origin"
	},
	"body": "{\"operationName\":\"getProspects\",\"variables\":{\"prospectList\":\"" + prospectList + "\",\"size\":" + size + ",\"start\":0,\"filters\":[]},\"query\":\"query getProspects($prospectList: ID, $start: Int, $size: Int, $search: String, $filters: [Filter], $ids: [String!], $prospectSelection: ProspectSelectionInput, $excTravelerStatus: [TravelerStatus!]) {\\n  prospects(\\n    prospectList: $prospectList\\n    start: $start\\n    size: $size\\n    search: $search\\n    filters: $filters\\n    ids: $ids\\n    prospectSelection: $prospectSelection\\n    excTravelerStatus: $excTravelerStatus\\n  ) {\\n    prospects {\\n      _id\\n      prospectList {\\n        _id\\n        name\\n        user\\n        totalProspects\\n        __typename\\n      }\\n      profile {\\n        _id\\n        firstName\\n        lastName\\n        occupation\\n        publicIdentifier\\n        memberId\\n        salesMemberId\\n        profilePicture\\n        influencer\\n        jobSeeker\\n        openLink\\n        premium\\n        profileUrl\\n        region\\n        company {\\n          name\\n          linkedinUrl\\n          website\\n          __typename\\n        }\\n        birthday {\\n          month\\n          day\\n          __typename\\n        }\\n        address\\n        email\\n        phoneNumbers {\\n          number\\n          type\\n          __typename\\n        }\\n        dropContactEnrichment {\\n          enrichmentDate\\n          civility\\n          first_name\\n          last_name\\n          full_name\\n          email {\\n            email\\n            qualification\\n            __typename\\n          }\\n          phone\\n          mobile_phone\\n          company\\n          website\\n          linkedin\\n          company_infogreffe\\n          siren\\n          siret\\n          vat\\n          nb_employees\\n          naf5_code\\n          naf5_des\\n          siret_address\\n          siret_zip\\n          siret_city\\n          company_linkedin\\n          company_turnover\\n          company_results\\n          __typename\\n        }\\n        __typename\\n      }\\n      customData\\n      customProfile {\\n        occupation\\n        firstName\\n        email\\n        company {\\n          name\\n          linkedinUrl\\n          website\\n          __typename\\n        }\\n        lastName\\n        phoneNumbers {\\n          number\\n          type\\n          __typename\\n        }\\n        region\\n        birthday {\\n          day\\n          month\\n          __typename\\n        }\\n        __typename\\n      }\\n      connectedAt\\n      status\\n      distance\\n      oneToOneConversationId\\n      user\\n      hasBeenEnriched\\n      contactEmail\\n      enrichedEmail\\n      history\\n      tags {\\n        _id\\n        name\\n        color\\n        __typename\\n      }\\n      origin {\\n        name\\n        trigger\\n        group {\\n          id\\n          name\\n          __typename\\n        }\\n        __typename\\n      }\\n      sharedGroups {\\n        id\\n        logo\\n        name\\n        __typename\\n      }\\n      isRepliedMonitored\\n      isSeenMonitored\\n      sharedProfessionalEvents {\\n        id\\n        name\\n        logo\\n        __typename\\n      }\\n      isActiveInCampaign\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}",
	"method": "POST"
	});

	let prospects = await result.json();

	let prosps = []
	prospects.data.prospects.prospects.forEach(async element => {
			console.log(element.profile.firstName, element.profile.lastName);
			const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_API_KEY })
			const contactObj = {
				properties: {
					firstname: element.profile.firstName,
					lastname: element.profile.lastName,
				},
			}
			prosps.push(contactObj);
			const createContactResponse = await hubspotClient.crm.contacts.basicApi.create(contactObj);
			await sleep(3000)
	});
	console.log("Size: ", prospects.data.prospects.prospects.length)
	return res.status(200).json(prosps);
	})
  
  app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
  })
  