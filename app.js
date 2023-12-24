const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const chatPath = path.join(__dirname, 'chats/mateus.json');

dotenv.config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/send-message', async (req, res) => {
  
  const userMessage = req.body.message;

  newUserMessage = { role: 'user', content: userMessage }

  const currentMessages = JSON.parse(fs.readFileSync(chatPath, 'utf-8'));


  try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [...currentMessages, newUserMessage],
      });
  
      console.log("Resposta da OpenAI:", JSON.stringify(completion, null, 2));

      const botResponse = completion.choices[0].message.content || 'Desculpe, não consegui processar sua mensagem.';

      newBotMessage = { role: 'system', content: botResponse }

      currentMessages.push(newUserMessage);
      currentMessages.push(newBotMessage);
      
      fs.writeFileSync(chatPath, JSON.stringify(currentMessages, null, 2));

      console.log("Resposta do Bot:", botResponse);
      res.json({ userMessage, botResponse });
  } catch (error) {
      console.error("Erro ao processar a mensagem:", error);
      res.status(500).send("Erro interno do servidor");
  }
});


app.get('/', (req, res) => {

  let messages = JSON.parse(fs.readFileSync(chatPath, 'utf-8')).slice(1);

    res.render('index', { messages } );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));