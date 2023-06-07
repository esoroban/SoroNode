const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
const openaiApiKey = process.env.OPENAI_API_KEY;

let price_json = fs.readFileSync('./price.json', 'utf8');
//let price = JSON.parse(price_json);
let price = JSON.stringify(price_json);
const app = express();
app.use(cors());

let phoneNumber = ""; // Variable to store phone number
let dialogue = ""; // Variable to store the dialogue
let storeDialogue = false; // Flag to decide whether to store the dialogue or not

// Чтение файла promt_ai.txt
let roleSystemContent = fs.readFileSync('promt_ai.txt', 'utf8');
//console.log(price);
roleSystemContent=roleSystemContent+" Price: Give only value you find next. If you can't find please answer `Let us call you` For full cource and summere intencive you can find here "+price;
let context = [
  {
    'role':'system',
    'content': roleSystemContent
  },
  {
    'role':'assistant',
    'content':"Konnichiwa! Please choose language 'Україньска', 'Română', 'Eesti' или выберете свой язык"
  }
];

app.use(express.json());

app.get('/initial-message', (req, res) => {
  const initialMessage = context[1].content;
  res.json({ message: initialMessage });
});

app.post('/message', async (req, res) => {
  const message = req.body.message;
  context.push({'role':'user', 'content':message});

  const response = await getCompletionFromMessages(context);
  context.push({'role':'assistant', 'content':response});

  dialogue += "User: " + message + "\n" + "Assistant: " + response + "\n";

  const phoneNumberRegex = /\+?(\d{1,4}[-.\s]?)(?!0+\s+,?$)\d{1,3}[-.\s]?(?!0+\s+,?$)\d{1,4}[-.\s]?(?!0+\s+,?$)\d{1,9}\s*,?$/g;
  if (phoneNumberRegex.test(message)) {
    phoneNumber = message;
    console.log("User's phone number is: ", phoneNumber);
    console.log("Dialogue: ", dialogue);
    if (storeDialogue) {
      console.log("Dialogue: ", dialogue); // Print the dialogue when phone number is detected
    }
  }

  if (message.toLowerCase() === "yes") {
    storeDialogue = true;
  } else if (message.toLowerCase() === "no") {
    storeDialogue = false;
  }

  res.json({ response });
});

async function getCompletionFromMessages(messages, model="gpt-3.5-turbo", temperature=0) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: model,
        messages: messages,
        temperature: temperature
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + openaiApiKey
        }
        
      }
    );

    return response.data.choices[0].message["content"];
  } catch (error) {
    console.error(error);
  }
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
