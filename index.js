const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const { WebClient, LogLevel } = require("@slack/web-api");

const client = new WebClient(process.env.TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG,
});

function extractUserIdAndContent(message) {
  // Regular expression to match the user ID within a mention
  const userIdRegex = /<@(\w+)\|[\w.-]+>/;
  const userIdMatch = message.match(userIdRegex);

  // Extract the user ID from the mention
  const userId = userIdMatch ? userIdMatch[1] : null;

  // Extract the content without the mention
  const content = userId ? message.replace(userIdMatch[0], "").trim() : message;

  return { userId, content };
}

const PORT = 3069;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello he's ly ly!");
});

app.post("/slack/events", async (req, res) => {
  let data = req.body;
  try {
    const message = data.text;

    const { userId, content } = extractUserIdAndContent(message);

    const result = await client.chat.postMessage({
      channel: userId,
      text: `Ai đó đã thì thầm vào tai bạn: \`${content}\``,
    });

    await fetch(process.env.CHANNEL_TRACKING, {
      method: "POST",
      body: JSON.stringify({
        text: `Có người trigger slash command: ${JSON.stringify({
          userName: data.user_name,
          userId: data.user_id,
          content,
        })}`,
      }),
    });

    if (result.ok) {
      res.status(200).send(`OK ${message}`);
    } else {
      res.status(400).send("Failed");
    }
  } catch (error) {
    res.status(400).send("Failed");
    console.error(error);
  }
});

app.listen(PORT, () => {
  console.log(`App start at port ${PORT}`);
});

module.exports = app;
