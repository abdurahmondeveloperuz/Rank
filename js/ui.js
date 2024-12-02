import { fetchClassData } from './api.js';
import { stateManager } from './state.js';

function updateUI(state) {
  const { classData, loading, error } = state;
  
  if (loading) {
    document.querySelector('.leaderboard').classList.add('loading');
    return;
  }
  
  document.querySelector('.leaderboard').classList.remove('loading');

  if (error) {
    document.querySelector('.leaderboard').innerHTML = `
      <div class="error-message">
        ${error.message}
      </div>
    `;
    return;
  }

  if (!classData) return;

  // Update stats
  document.querySelector('.stat-value:nth-child(3)').textContent = classData.total_students;

  // Update student cards
  const topThree = classData.students.slice(0, 3);
  const otherStudents = classData.students.slice(3, 6);

  // Update top three
  topThree.forEach((student, index) => {
    const card = document.querySelector(`.place-${index + 1}`);
    if (!card) return;

    const img = card.querySelector('.student-img');
    const name = card.querySelector('h3');
    const score = card.querySelector('.score-badge');
    const progress = card.querySelector('.stat strong:last-child');

    img.src = student.photo;
    img.alt = student.name;
    name.textContent = student.name;
    score.textContent = `${student.progress} points`;
    progress.textContent = `${student.progress}%`;
  });

  // Update other rankings
  const otherRankings = document.querySelector('.other-rankings');
  otherRankings.innerHTML = `
    <h2>Other Top Performers</h2>
    ${otherStudents.map((student, index) => `
      <div class="student-row" style="animation-delay: ${0.7 + (index * 0.1)}s">
        <span class="rank">${student.rank}</span>
        <img src="${student.photo}" alt="${student.name}" class="student-img-small">
        <div class="student-info">
          <span class="name">${student.name}</span>
          <span class="progress-bar">
            <span class="progress" style="width: ${student.progress}%"></span>
          </span>
        </div>
        <span class="score">${student.progress}</span>
      </div>
    `).join('')}
  `;
}

export function initializeUI() {
  // Get class_id from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const classId = urlParams.get('class_id');

  if (!classId) {
    stateManager.setState({
      error: new Error('No class ID provided')
    });
    return;
  }

  // Subscribe to state changes
  stateManager.subscribe(updateUI);

  // Initial load
  loadClassData(classId);
}

export async function loadClassData(classId) {
  try {
    stateManager.setState({ loading: true, error: null });
    const data = await fetchClassData(classId);
    stateManager.setState({ classData: data, loading: false });
  } catch (error) {
    stateManager.setState({ error, loading: false });
  }
}