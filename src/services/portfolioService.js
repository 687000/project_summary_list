import { db } from '../api/firebase.js';
import { setPortfolioData } from '../store/portfolio.js';

const portfolioDoc = db.collection("portfolio").doc("data");

let unsubscribeSnapshot = null;

export async function updateDatabase(portfolioData) {
  try {
    await portfolioDoc.set(portfolioData);
  } catch (err) {
    console.warn("Firestore save failed:", err);
  }
}

export function listenToPortfolio(onData, onError) {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
  }
  unsubscribeSnapshot = portfolioDoc.onSnapshot(
    async (doc) => {
      if (doc.exists) {
        setPortfolioData(doc.data());
        onData();
      }
    },
    async (err) => {
      onError(err);
    },
  );
}
