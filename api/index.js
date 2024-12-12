import express from 'express';
import axios from 'axios';

const app = express();

app.use(express.json());

const RABBITMQ_API_URL = process.env.RABBITMQ_API_URL;
const RABBITMQ_USER = process.env.RABBITMQ_USER;
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD;

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.post('/webhook', async (req, res) => {
  const events = req.body.events || [];
  const tasks = events
    .filter(({ type }) => type === 'message')
    .map(async ({ replyToken, message }) => {
      // Send message to RabbitMQ
      await axios.post(RABBITMQ_API_URL, {
        replyToken,
        messages: [
          {
            type: 'text',
            text: message.text,
          },
        ],
      }, {
        auth: {
          username: RABBITMQ_USER,
          password: RABBITMQ_PASSWORD,
        },
      });
    });

  await Promise.all(tasks);
  res.sendStatus(200);
});

app.listen(3000);

export default app;
