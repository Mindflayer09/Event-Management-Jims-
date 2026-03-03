import api from '../axios';

export const getClubs = async () => {
  const res = await api.get('/clubs');
  console.log("FULL RESPONSE:", res.data);
  return res.data.clubs;
};

export const getClubById = (id) => api.get(`/clubs/${id}`);
