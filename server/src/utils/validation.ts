import * as admin from 'firebase-admin';

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://shopairs.firebaseio.com"
});

export async function validateToken(token: any) {
    return await admin
        .auth()
        .verifyIdToken(token)
        .then((decodedToken) => {
            return decodedToken
        })
        .catch((error) => {
            // TODO Handle error
            console.log(error.message)
        });
}