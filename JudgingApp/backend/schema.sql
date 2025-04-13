CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  date DATE
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password TEXT
);

CREATE TABLE IF NOT EXISTS judges (
  id VARCHAR(255) PRIMARY KEY,
  password TEXT
);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  event_id INT,
  user_id INT,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (user_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS judge_event (
  judge_id VARCHAR(255),
  event_id INT,
  PRIMARY KEY (judge_id, event_id),
  FOREIGN KEY (judge_id) REFERENCES judges(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  judge_id VARCHAR(255),
  project_id INT,
  score INT,
  feedback TEXT,
  PRIMARY KEY (judge_id, project_id),
  FOREIGN KEY (judge_id) REFERENCES judges(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
