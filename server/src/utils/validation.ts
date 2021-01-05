import * as admin from 'firebase-admin';

const credential = process.env["FB_CONFIG_BASE64"] || '';
admin.initializeApp({  
    credential: admin.credential.cert( JSON.parse( Buffer.from(credential, 'base64').toString('ascii') ) ),
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
            return null
        });
}