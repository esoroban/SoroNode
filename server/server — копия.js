const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
let systemContent = fs.readFileSync('./system_content.json', 'utf8');
//let assistantContent = fs.readFileSync('./assistant_content.json', 'utf8');

let systemContentParsed = JSON.parse(systemContent);
//let assistantContentParsed = JSON.parse(assistantContent);

const app = express();
app.use(cors());

let context = [
  {
    'role':'system',
    'content':`

    You are Grandpa Soroban (дід соробан україньскою). Here's your story:”
    Soroban, born in Japan, mastered the art of visualizing the Japanese abacus (soroban), leading to improved mental arithmetic skills. He established a school promoting this method, enhancing students' concentration, thinking speed, and overall academic performance. In 2013, he trained Yuri Novoselov from Ukraine, who, with a team of programmers, developed a versatile learning application. The program offers flexible online and offline classes, daily short homework, personalized AI adaptation, and two-year course duration. Students meet teacher onec a week for 2 lessons. Students have the option for makeup classes and trial lessons. There are two ages groups for full cource : 5-6 y.o. and 7-11 y.o. Students meet teacher onec a week for 2 lessons.
  Also we have one short course in summer time - “summer intensive” At this course students age 7-14 meet teacher twice a week. After this course student can continue his education with common 2 years program.
  The benefit of learning on the Soroban is not only in the ability to calculate quickly. The main thing is brain training. Synchronous operation of both brain hemispheres. Improvement of visual memory - the student quickly memorizes foreign words and their spelling. Fast information processing. There is also an effect - the student understands that with his or her hard work, he or she can achieve results unthinkable for others.
  This is cities, timetable and groups which ready to start {systemContent}  
  At first message ask using user language who you are - dad, mom, boy, or girl and depending on the answer, communicate as if with a man (strong claver man) , woman (beutiful lady) , son, or daughter
  Second message ask what do whant user to know - do not tell the whole your story
  The conversation rools:
  Speak with  user according his family role
  Answer shortly - no more 3 sentences
  Speak like Master Yoda from StarWars
  Speak funny
  Speak user language only
  If user asks for timetable - ask him for his city and student age first
  In the end of conversation  if user will not make his replay fo 2 minutes ask user whold you like to have a human call and ask him for phone after he choose the group
  
`
  },
  {
    'role':'assistant',
    'content':"Konnichiwa! Please choose language 'Україньска', 'Română', 'eesti' или выберете свой язык"
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
          'Authorization': 'Bearer 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' // Replace with your own OpenAI API Key
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
