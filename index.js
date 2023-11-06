const express = require("express");
const bodyParser = require('body-parser');
const { WebClient, LogLevel } = require("@slack/web-api");

const client = new WebClient("xoxb-6153824406036-6136905271687-q7bhsP4zBspH8kfmYSojmrtI", {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG
});

const PORT = 3069;

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.post("/slack/events", async (req, res) => {
  let data = req.body;
  console.log(req.pa);
  try {
    // Call the chat.postMessage method using the WebClient
    const result = await client.chat.postMessage({
      channel: "U0654AQ7GAC",
      text: data?.content,
    });
    if (result.ok) {
      res.status(200).send("OK")
    } else {
      res.status(400).send("Failed")
    }
  }
  catch (error) {
    console.error(error);
  }
})


app.listen(PORT, () => {
  console.log(`App start at port ${PORT}`);
})