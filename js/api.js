import axios from 'axios';

export async function fetchClassData(classId) {
  try {
    const response = await axios.get(`/api/class?class_id=${classId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Class not found');
    }
    throw new Error('Failed to fetch class data');
  }
}

export async function setClassData(classId, students, token) {
  try {
    const response = await axios.post(`/api/set_class?class_id=${classId}&students=${JSON.stringify(students)}`, null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update class data');
  }
}