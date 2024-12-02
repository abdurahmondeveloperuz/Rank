import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// API token for set_class endpoint
const API_TOKEN = '8a9b4dfe-1293-44d8-9e92-13d826e4b310';

// Store class data in memory
const classData = new Map();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the dist directory after building
app.use(express.static('dist'));

// Rankings page route
app.get('/rankings', async (req, res) => {
  const classId = req.query.class_id;
  
  if (!classId || !classData.has(classId)) {
    res.status(404).sendFile(join(__dirname, 'dist', '404.html'));
    return;
  }

  try {
    const html = await fs.readFile(join(__dirname, 'dist', 'index.html'), 'utf-8');
    res.send(html);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// API endpoint to get class data
app.get('/api/class', (req, res) => {
  const classId = req.query.class_id;
  
  if (!classId || !classData.has(classId)) {
    res.status(404).json({ error: 'Class not found' });
    return;
  }

  res.json(classData.get(classId));
});

// API endpoint to set class data
app.post('/api/set_class', (req, res) => {
  const authToken = req.headers.authorization?.split(' ')[1];
  
  if (authToken !== API_TOKEN) {
    res.status(404).sendFile(join(__dirname, 'dist', '404.html'));
    return;
  }

  const { class_id, students } = req.query;
  
  if (!class_id || !students) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  try {
    const parsedStudents = JSON.parse(students);
    
    // Calculate ranks based on progress
    const rankedStudents = parsedStudents
      .sort((a, b) => b.progress - a.progress)
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));

    // Update or create class data
    classData.set(class_id, {
      total_students: rankedStudents.length,
      students: rankedStudents
    });

    res.json({ message: 'Class data updated successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid students data format' });
  }
});

// Catch-all route for 404
app.get('*', (req, res) => {
  res.status(404).sendFile(join(__dirname, 'dist', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});