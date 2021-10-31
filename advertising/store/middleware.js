import cote from "cote";

const requester = new cote.Requester({
    name: 'authentification'
});

async function ownerOrAdmin(ownerId, jwt)
{
    const request = { type: 'ownerOrAdmin', ownerId: ownerId, jwt: jwt};
    return await requester.send(request);
}

export async function emptyMiddleware(req, res, next) {
    next();
} 