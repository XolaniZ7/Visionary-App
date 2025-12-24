import Fuse from "fuse.js"
import { findAllActiveBooks, getAllApprovedAuthors, k, p } from "./db"
import { resyncSubscription } from "./payfast"

// Initialize with empty arrays to prevent blocking server startup
let books: Awaited<ReturnType<typeof findAllActiveBooks>> = []
let users: Awaited<ReturnType<typeof getAllApprovedAuthors>> = []

export const booksFuse = new Fuse(books, {
    keys: [
        {
            name: "title",
            weight: 1
        },
        {
            name: "description",
            weight: 0.3
        },
        {
            name: "userName",
            weight: 0.5
        },
    ],
    threshold: 0.3,
    ignoreLocation: true
})

export const authorFuse = new Fuse(users, {
    keys: [
        {
            name: "name",
            weight: 1
        },
        {
            name: "lastname",
            weight: 1
        },
        {
            name: "id",
            weight: 1
        },
    ],
    threshold: 0.3,
    ignoreLocation: true
})

// Asynchronously populate the search index in the background so it doesn't block server startup
async function initializeSearchIndex() {
    console.log("Initializing search index in the background...");
    books = await findAllActiveBooks();
    users = await getAllApprovedAuthors();
    booksFuse.setCollection(books);
    authorFuse.setCollection(users);
    console.log("Search index initialized.");
}

setTimeout(() => {
    initializeSearchIndex();
}, 5000);

setInterval(async () => {
    console.log("reindexing")
    books = await findAllActiveBooks()
    users = await getAllApprovedAuthors()
    booksFuse.setCollection(books);
    authorFuse.setCollection(users);
}, 60000)

async function resyncSubscriptions() {
    console.log("Resyncing all Status 7 subscriptions")
    const status7Subscriptions = await p.payments_subscription.findMany({ where: { status_id: 7 } })
    for (let index = 0; index < status7Subscriptions.length; index++) {
        const element = status7Subscriptions[index];

        console.log("Resyncing Subscription: " + element.token)
        await resyncSubscription(element.token)
    }
}
async function resyncAllSubscriptions() {
    console.log("Resyncing all subscriptions")
    const allSubs = await p.payments_subscription.findMany()
    for (let index = 0; index < allSubs.length; index++) {
        const element = allSubs[index];
        console.log("Resyncing Subscription: " + element.token)
        await resyncSubscription(element.token)
    }
}

resyncSubscriptions();
setInterval(resyncSubscriptions, 180000);
setInterval(resyncAllSubscriptions, 43200000);