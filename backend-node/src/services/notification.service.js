const axios = require("axios");
const notificationModel = require("../models/notification.model");
const lostItemModel = require("../models/lostItem.model");
const foundItemModel = require("../models/foundItem.model");

/**
 * Checks for matches and creates notifications when a new Lost item is created.
 */
async function checkMatchesForNewLostItem(lostItem) {
  try {
    const foundItems = await foundItemModel.find();
    if (!foundItems || foundItems.length === 0) return;

    let matches = [];

    // Attempt AI semantic match via Python API
    if (process.env.PYTHON_API_URL) {
      try {
        const response = await axios.post(
          process.env.PYTHON_API_URL,
          {
            lost: `${lostItem.title}. ${lostItem.description}`,
            found: foundItems.map((f) => ({
              id: f._id,
              description: `${f.title}. ${f.description}`
            }))
          },
          { timeout: 4000 }
        );
        matches = response.data.matches || [];
      } catch (err) {
        // Fallback to text similarity heuristics if Python API is cold
      }
    }

    // Process high-confidence matches
    for (const match of matches) {
      const score = match.score || 0;
      if (score >= 0.65) {
        const found = foundItems.find((f) => String(f._id) === String(match.id));
        if (found) {
          const matchPercent = Math.round(score * 100);
          
          // Prevent duplicate notification
          const exists = await notificationModel.findOne({
            recipient: lostItem.reportedBy,
            lostItem: lostItem._id,
            foundItem: found._id
          });

          if (!exists) {
            await notificationModel.create({
              recipient: lostItem.reportedBy,
              type: "match_alert",
              title: `⚡ ${matchPercent}% Potential Match Found!`,
              message: `A found item "${found.title}" at ${found.location} closely matches your lost item.`,
              score: matchPercent,
              lostItem: lostItem._id,
              foundItem: found._id
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Match notification error (Lost item):", error.message);
  }
}

/**
 * Checks for matches and creates notifications when a new Found item is created.
 */
async function checkMatchesForNewFoundItem(foundItem) {
  try {
    const openLostItems = await lostItemModel.find({ status: "Open" });
    if (!openLostItems || openLostItems.length === 0) return;

    for (const lost of openLostItems) {
      // Don't notify the same user if they reported both
      if (String(lost.reportedBy) === String(foundItem.reportedBy)) continue;

      let score = 0;

      // Check with Python NLP model if available
      if (process.env.PYTHON_API_URL) {
        try {
          const response = await axios.post(
            process.env.PYTHON_API_URL,
            {
              lost: `${lost.title}. ${lost.description}`,
              found: [{ id: foundItem._id, description: `${foundItem.title}. ${foundItem.description}` }]
            },
            { timeout: 3000 }
          );
          if (response.data.matches && response.data.matches.length > 0) {
            score = response.data.matches[0].score || 0;
          }
        } catch (err) {
          // Fallback heuristic: category match + word overlap
          if (lost.category && foundItem.category && lost.category.toLowerCase() === foundItem.category.toLowerCase()) {
            const lostWords = (lost.title + " " + lost.description).toLowerCase().split(/\s+/);
            const foundWords = (foundItem.title + " " + foundItem.description).toLowerCase().split(/\s+/);
            const common = lostWords.filter((w) => w.length > 3 && foundWords.includes(w));
            if (common.length >= 2) score = 0.72;
          }
        }
      }

      if (score >= 0.65) {
        const matchPercent = Math.round(score * 100);
        
        const exists = await notificationModel.findOne({
          recipient: lost.reportedBy,
          lostItem: lost._id,
          foundItem: foundItem._id
        });

        if (!exists) {
          await notificationModel.create({
            recipient: lost.reportedBy,
            type: "match_alert",
            title: `⚡ ${matchPercent}% Potential Match Found!`,
            message: `Someone just reported finding "${foundItem.title}" at ${foundItem.location} matching your lost report.`,
            score: matchPercent,
            lostItem: lost._id,
            foundItem: foundItem._id
          });
        }
      }
    }
  } catch (error) {
    console.error("Match notification error (Found item):", error.message);
  }
}

module.exports = {
  checkMatchesForNewLostItem,
  checkMatchesForNewFoundItem
};
