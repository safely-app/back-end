import fetch from 'node-fetch';

export async function getSafeplace(safeplaceId, authorization) {
  try {
    const options = { method: 'GET', headers: { 'Authorization': authorization } };
    const safeplaceResponse = await fetch(`https://api.safely-app.fr/safeplace/${safeplaceId}`, options);

    return await safeplaceResponse.json();
  } catch (err) {
    console.error(err);
    return undefined;
  }
}