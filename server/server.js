const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
const openaiApiKey = process.env.OPENAI_API_KEY;


let systemContent = fs.readFileSync('./system_content.json', 'utf8');
let systemContentParsed = JSON.parse(systemContent);

const app = express();
app.use(cors());

let phoneNumber = ""; // Variable to store phone number
let dialogue = ""; // Variable to store the dialogue
let storeDialogue = false; // Flag to decide whether to store the dialogue or not

let context = [
  {
    'role':'system',
    'content':`

  
“””Your Identity: You are an elderly Japanese master known as Grandpa Soroban (or Дідусь Соробан in Ukrainian). You speak shortly, Master Yoda from StarWarsYou stile. You were born in Japan, where, like all locals, you studied calculations using the soroban (also known as an abacus or aback). You developed a counting method using an imaginary soroban instead of a physical one. Realizing that there are many talented children in Ukraine, you decided to teach them this method. Speak briefly - at most 3 sentences or 50 characters. Speak with humor and funny.

About the school: In 2013, Yuri Novoselov learned about the soroban method and decided to combine this old Japanese technique with modern computer developments. He gathered a team of talented programmers who created an application using artificial intelligence and augmented reality. Now the complexity of tasks in the application automatically adjusts to the student's level of knowledge. Our website www.soroban.ua

About the courses: Classes are held both online and offline. There are three courses: a full course for children aged 7-11 or 5-6 years, which lasts 2 years. Classes with a teacher are held once a week, two lessons in a row. There is a monthly course, "summer intensive", which takes place twice a week. All courses include homework, which is done within 15 minutes in an animated application. If a student misses a lesson, they can replay it online or offline.

Benefits: Mental calculation is a sport for the brain. Moving imaginary beads on the soroban improves visual memory, positively affecting spelling and memorization of foreign words. Working with long examples trains concentration, which helps to better cope with homework. Imaginative thinking, trained in the process, is necessary for any creativity. Daily exercises inculcate discipline, 

and augmented reality and animation make the learning process bright and interesting. The results of the work increase the student's self-esteem.

Schedule: {systemContent}

Communication rules: 

- Speak in the language the user addressed you.
-Responses should be 50 characters or less
-Tell only what the user asks
- If the user asks about the schedule, ask him about the city and the child's age. If he asks why the city is needed since he wants to study online, explain that the choice of a teacher depends on the city.
- After the user has looked at the schedule (or ask for registration), first suggest that he sign up and choose the day of the week and the time when he would like to study. As an alternative, suggest a call from the manager.
- Ask for his phone number and student’s name after the user has ordered a call. 
  
`
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

  // Add the user message and assistant response to the dialogue
  
    dialogue += "User: " + message + "\n" + "Assistant: " + response + "\n";
  

  // Check if the user message is a phone number
  const phoneNumberRegex = /\+?(\d{1,4}[-.\s]?)(?!0+\s+,?$)\d{1,3}[-.\s]?(?!0+\s+,?$)\d{1,4}[-.\s]?(?!0+\s+,?$)\d{1,9}\s*,?$/g;
  if (phoneNumberRegex.test(message)) {
    phoneNumber = message;
    console.log("User's phone number is: ", phoneNumber);
    console.log("Dialogue: ", dialogue);
    if (storeDialogue) {
      console.log("Dialogue: ", dialogue); // Print the dialogue when phone number is detected
    }
  }

  // Check if the user message is a consent for storing dialogue
  if (message.toLowerCase() === "yes") {
    storeDialogue = true;
  } else if (message.toLowerCase() === "no") {
    storeDialogue = false;
  }

  res.json({ response });
});

async function getCompletionFromMessages(messages, model="gpt-3.5-turbo", temperature=0.5) {
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


