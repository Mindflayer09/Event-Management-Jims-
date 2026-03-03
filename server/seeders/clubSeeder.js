const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Club = require('../models/Club');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const clubs = [
  {
    name: 'IIC',
    description: 'Institution Innovation Council - Fostering innovation, startups, and entrepreneurship culture among students.',
    logo: '',
  },
  {
    name: 'CII Yuva',
    description: 'CII Young Indians - Empowering youth through industry connections, leadership programs, and skill development.',
    logo: '',
  },
  {
    name: 'Enigma',
    description: 'The technical club - Promoting coding, hackathons, tech workshops, and software development excellence.',
    logo: '',
  },
];

const seedClubs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB:", mongoose.connection.name);
    
    await Club.deleteMany();
    console.log('Cleared existing clubs');

    const created = await Club.insertMany(clubs);
    console.log(`Seeded ${created.length} clubs`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedClubs();