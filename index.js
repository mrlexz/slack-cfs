const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const { WebClient, LogLevel } = require("@slack/web-api");

const client = new WebClient(process.env.TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG,
});

function extractUserIdUsernameAndContent(message) {
  // Regular expression to match the user ID and username within a mention
  const userMentionRegex = /<@(\w+)\|([\w.-]+)>/;
  const userMentionMatch = message.match(userMentionRegex);

  // Extract the user ID, username, and content from the message
  const userId = userMentionMatch ? userMentionMatch[1] : null;
  const username = userMentionMatch ? userMentionMatch[2] : null;
  const content = userId
    ? message.replace(userMentionMatch[0], "").trim()
    : message;

  return { userId, username, content };
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

    const {
      userId,
      content,
      username: toPerson,
    } = extractUserIdUsernameAndContent(message);

    const result = await client.chat.postMessage({
      channel: userId,
      text: `Ai đó đã thì thầm vào tai bạn: \`${content}\``,
    });

    await fetch(process.env.CHANNEL_TRACKING, {
      method: "POST",
      body: JSON.stringify({
        text: `\`${data.user_name}\` gửi tới \`${toPerson}\` với nội dung là \`${content}\``,
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
